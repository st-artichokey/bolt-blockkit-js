import assert from "node:assert/strict";
import { describe, it, mock } from "node:test";
import esmock from "esmock";

/** Builds a fake view.state.values object matching the retro modal structure. */
const buildFakeValues = (overrides = {}) => ({
  retro_title_block: { retro_title: { value: "Sprint 4 Retro" } },
  sprint_block: {
    sprint_select: {
      selected_option: { text: { text: "Sprint 4" }, value: "sprint_4" },
    },
  },
  date_block: { sprint_date: { selected_date: "2026-03-28" } },
  went_well_block: { went_well: { value: "Shipped on time" } },
  went_wrong_block: { went_wrong: { value: "Too many meetings" } },
  action_items_block: { action_items: { value: "Reduce sync meetings" } },
  mood_block: {
    team_mood: {
      selected_option: { value: "great", text: { text: "Great :tada:" } },
    },
  },
  categories_block: {
    categories: {
      selected_options: [{ text: { text: "Process" }, value: "process" }],
    },
  },
  ...overrides,
});

describe("parseRetroValues", () => {
  const loadModule = () => esmock("../../listeners/views/retro-submit.js", {});

  it("extracts all fields from modal values", async () => {
    const { parseRetroValues } = await loadModule();
    const result = parseRetroValues(buildFakeValues());

    assert.equal(result.title, "Sprint 4 Retro");
    assert.equal(result.sprint, "Sprint 4");
    assert.equal(result.date, "2026-03-28");
    assert.equal(result.wentWell, "Shipped on time");
    assert.equal(result.wentWrong, "Too many meetings");
    assert.equal(result.actionItems, "Reduce sync meetings");
    assert.equal(result.mood, "great");
    assert.deepEqual(result.categories, ["Process"]);
  });

  it("handles empty categories", async () => {
    const { parseRetroValues } = await loadModule();
    const values = buildFakeValues({
      categories_block: { categories: { selected_options: [] } },
    });
    const result = parseRetroValues(values);
    assert.deepEqual(result.categories, []);
  });

  it("throws a descriptive error when a required field is missing", async () => {
    const { parseRetroValues } = await loadModule();
    const values = buildFakeValues({ retro_title_block: {} });

    assert.throws(() => parseRetroValues(values), {
      message: /retro_title/i,
    });
  });

  it("throws when mood selection is missing", async () => {
    const { parseRetroValues } = await loadModule();
    const values = buildFakeValues({
      mood_block: { team_mood: { selected_option: null } },
    });

    assert.throws(() => parseRetroValues(values), {
      message: /team_mood/i,
    });
  });
});

describe("buildRetroSummaryBlocks", () => {
  const loadModule = () => esmock("../../listeners/views/retro-submit.js", {});

  it("returns blocks with header, sections, dividers, and context", async () => {
    const { buildRetroSummaryBlocks, parseRetroValues } = await loadModule();
    const retro = parseRetroValues(buildFakeValues());
    const blocks = buildRetroSummaryBlocks(retro, "U456");

    const types = blocks.map((b) => b.type);
    assert.ok(types.includes("header"));
    assert.ok(types.includes("section"));
    assert.ok(types.includes("divider"));
    assert.ok(types.includes("context"));
  });

  it("does not include actions block (no Add Comment or overflow)", async () => {
    const { buildRetroSummaryBlocks, parseRetroValues } = await loadModule();
    const retro = parseRetroValues(buildFakeValues());
    const blocks = buildRetroSummaryBlocks(retro, "U456");

    const actionsBlock = blocks.find((b) => b.type === "actions");
    assert.equal(actionsBlock, undefined, "Should not have actions block");
  });

  it("includes the submitter in the context block", async () => {
    const { buildRetroSummaryBlocks, parseRetroValues } = await loadModule();
    const retro = parseRetroValues(buildFakeValues());
    const blocks = buildRetroSummaryBlocks(retro, "U456");

    const context = blocks.find((b) => b.type === "context");
    assert.ok(context.elements[0].text.includes("<@U456>"));
  });

  it('shows "None selected" when no categories are chosen', async () => {
    const { buildRetroSummaryBlocks, parseRetroValues } = await loadModule();
    const retro = parseRetroValues(
      buildFakeValues({
        categories_block: { categories: { selected_options: [] } },
      }),
    );
    const blocks = buildRetroSummaryBlocks(retro, "U456");

    const fieldsBlock = blocks.find((b) =>
      b.fields?.some((f) => f.text.includes("Focus Areas")),
    );
    assert.ok(fieldsBlock.fields.some((f) => f.text.includes("None selected")));
  });
});

describe("buildDateHeading", () => {
  const loadModule = () => esmock("../../listeners/views/retro-submit.js", {});

  it("returns an H1 heading with the date", async () => {
    const { buildDateHeading } = await loadModule();
    const heading = buildDateHeading("2026-04-07");
    assert.ok(heading.startsWith("# 2026-04-07"), "Should start with H1 date");
  });
});

describe("buildRetroEntry", () => {
  const loadModule = () => esmock("../../listeners/views/retro-submit.js", {});

  it("returns markdown with retro title as H2 heading", async () => {
    const { buildRetroEntry, parseRetroValues } = await loadModule();
    const retro = parseRetroValues(buildFakeValues());
    const md = buildRetroEntry(retro, "U456");

    assert.ok(md.includes("## Sprint 4 Retro"), "Title should be H2");
    assert.ok(!md.includes("# 2026-03-28"), "Should not include date heading");
  });

  it("includes all retro sections", async () => {
    const { buildRetroEntry, parseRetroValues } = await loadModule();
    const retro = parseRetroValues(buildFakeValues());
    const md = buildRetroEntry(retro, "U456");

    assert.ok(md.includes("What Went Well"), "Missing went well section");
    assert.ok(md.includes("Shipped on time"), "Missing went well content");
    assert.ok(md.includes("What Didn't Go Well"), "Missing went wrong section");
    assert.ok(md.includes("Too many meetings"), "Missing went wrong content");
    assert.ok(md.includes("Action Items"), "Missing action items section");
    assert.ok(
      md.includes("Reduce sync meetings"),
      "Missing action items content",
    );
  });

  it("includes sprint, date, mood, and categories metadata", async () => {
    const { buildRetroEntry, parseRetroValues } = await loadModule();
    const retro = parseRetroValues(buildFakeValues());
    const md = buildRetroEntry(retro, "U456");

    assert.ok(md.includes("Sprint 4"), "Missing sprint");
    assert.ok(md.includes("2026-03-28"), "Missing date");
    assert.ok(md.includes(":tada:"), "Missing mood emoji");
    assert.ok(md.includes("Process"), "Missing categories");
  });

  it("includes submitter mention", async () => {
    const { buildRetroEntry, parseRetroValues } = await loadModule();
    const retro = parseRetroValues(buildFakeValues());
    const md = buildRetroEntry(retro, "U456");

    assert.ok(md.includes("![](@U456)"), "Missing submitter canvas mention");
  });
});

describe("retroSubmitCallback", () => {
  const loadModule = (channelId = "C999") =>
    esmock("../../listeners/views/retro-submit.js", {
      "../../listeners/channel-store.js": {
        getRetroChannel: () => channelId,
      },
    });

  /** Builds a mock client. canvasId=null means no canvas exists yet. */
  const buildClient = ({ canvasId = null, dateSections = [] } = {}) => ({
    conversations: {
      canvases: {
        create: mock.fn(async () => ({ canvas_id: "F_NEW_CANVAS" })),
      },
      info: mock.fn(async () => ({
        channel: canvasId
          ? { properties: { canvas: { canvas_id: canvasId } } }
          : { properties: {} },
      })),
    },
    canvases: {
      edit: mock.fn(async () => ({})),
      sections: {
        lookup: mock.fn(async () => ({ sections: dateSections })),
      },
    },
    chat: { postMessage: mock.fn(async () => ({})) },
  });

  it("creates a canvas titled 'Retro Canvas' when none exists", async () => {
    const { retroSubmitCallback } = await loadModule();
    const ack = mock.fn(async () => {});
    const client = buildClient();
    const view = { state: { values: buildFakeValues() } };
    const body = { user: { id: "U456" } };
    const logger = { error: mock.fn() };

    await retroSubmitCallback({ ack, view, body, client, logger });

    assert.equal(ack.mock.calls.length, 1);
    assert.equal(client.conversations.canvases.create.mock.calls.length, 1);
    const createCall =
      client.conversations.canvases.create.mock.calls[0].arguments[0];
    assert.equal(createCall.channel_id, "C999");
    assert.equal(
      createCall.title,
      "Retro Canvas",
      "Should create canvas with title 'Retro Canvas'",
    );
    assert.ok(
      createCall.document_content.markdown.includes("# 2026-03-28"),
      "Should include date heading",
    );
    assert.ok(
      createCall.document_content.markdown.includes("## Sprint 4 Retro"),
      "Should include retro entry as H2",
    );

    const creationNotice = client.chat.postMessage.mock.calls.find((call) =>
      call.arguments[0].text.includes("Retro Canvas"),
    );
    assert.ok(creationNotice, "Should notify user that canvas was created");
    assert.equal(creationNotice.arguments[0].channel, "U456");
    assert.ok(
      creationNotice.arguments[0].text.includes("<#C999>"),
      "Notification should reference the retro channel",
    );
  });

  it("inserts under existing date heading when section found", async () => {
    const { retroSubmitCallback } = await loadModule();
    const ack = mock.fn(async () => {});
    const client = buildClient({
      canvasId: "F_EXISTING",
      dateSections: [{ id: "section_123" }],
    });
    const view = { state: { values: buildFakeValues() } };
    const body = { user: { id: "U456" } };
    const logger = { error: mock.fn() };

    await retroSubmitCallback({ ack, view, body, client, logger });

    assert.equal(
      client.conversations.canvases.create.mock.calls.length,
      0,
      "Should not create a new canvas",
    );
    assert.equal(client.canvases.edit.mock.calls.length, 1);
    const editCall = client.canvases.edit.mock.calls[0].arguments[0];
    assert.equal(editCall.canvas_id, "F_EXISTING");
    assert.equal(editCall.changes[0].operation, "insert_after");
    assert.equal(editCall.changes[0].section_id, "section_123");
    assert.ok(
      editCall.changes[0].document_content.markdown.includes(
        "## Sprint 4 Retro",
      ),
      "Should insert retro entry",
    );
    assert.ok(
      !editCall.changes[0].document_content.markdown.includes("# 2026-03-28"),
      "Should not include date heading when section exists",
    );
  });

  it("inserts new date section at top when no date heading found", async () => {
    const { retroSubmitCallback } = await loadModule();
    const ack = mock.fn(async () => {});
    const client = buildClient({ canvasId: "F_EXISTING", dateSections: [] });
    const view = { state: { values: buildFakeValues() } };
    const body = { user: { id: "U456" } };
    const logger = { error: mock.fn() };

    await retroSubmitCallback({ ack, view, body, client, logger });

    assert.equal(client.canvases.edit.mock.calls.length, 1);
    const editCall = client.canvases.edit.mock.calls[0].arguments[0];
    assert.equal(editCall.canvas_id, "F_EXISTING");
    assert.equal(editCall.changes[0].operation, "insert_at_start");
    assert.ok(
      editCall.changes[0].document_content.markdown.includes("# 2026-03-28"),
      "Should include date heading",
    );
    assert.ok(
      editCall.changes[0].document_content.markdown.includes(
        "## Sprint 4 Retro",
      ),
      "Should include retro entry",
    );
  });

  it("sends copy to Messages tab when checkbox selected", async () => {
    const { retroSubmitCallback } = await loadModule();
    const ack = mock.fn(async () => {});
    const client = buildClient();
    const values = buildFakeValues({
      dm_summary_block: {
        dm_summary: { selected_options: [{ value: "send_copy" }] },
      },
    });
    const view = { state: { values } };
    const body = { user: { id: "U456" } };
    const logger = { error: mock.fn() };

    await retroSubmitCallback({ ack, view, body, client, logger });

    assert.equal(
      client.chat.postMessage.mock.calls.length,
      2,
      "Should send confirmation + copy",
    );
    const copyCall = client.chat.postMessage.mock.calls[1].arguments[0];
    assert.equal(copyCall.channel, "U456");
    assert.ok(copyCall.blocks, "Copy message should include Block Kit blocks");
  });

  it("does not send copy when checkbox not selected", async () => {
    const { retroSubmitCallback } = await loadModule();
    const ack = mock.fn(async () => {});
    const client = buildClient();
    const view = { state: { values: buildFakeValues() } };
    const body = { user: { id: "U456" } };
    const logger = { error: mock.fn() };

    await retroSubmitCallback({ ack, view, body, client, logger });

    assert.equal(
      client.chat.postMessage.mock.calls.length,
      1,
      "Should only send confirmation, not a copy",
    );
    const call = client.chat.postMessage.mock.calls[0].arguments[0];
    assert.ok(
      call.text.includes("Retro Canvas") || call.text.includes("submitted"),
      "The only message should be the confirmation",
    );
  });

  it("sends error message to user when retro channel is not configured", async () => {
    const { retroSubmitCallback } = await loadModule(null);
    const ack = mock.fn(async () => {});
    const client = buildClient();
    const view = { state: { values: buildFakeValues() } };
    const body = { user: { id: "U456" } };
    const logger = { error: mock.fn() };

    await retroSubmitCallback({ ack, view, body, client, logger });

    assert.equal(client.conversations.canvases.create.mock.calls.length, 0);
    assert.equal(logger.error.mock.calls.length, 1);
    assert.equal(
      client.chat.postMessage.mock.calls.length,
      1,
      "Should send an error message to the user",
    );
    const errorMsg = client.chat.postMessage.mock.calls[0].arguments[0];
    assert.equal(errorMsg.channel, "U456");
    assert.ok(
      errorMsg.text.includes("/invite @RetroRun"),
      "Error message should tell user how to fix it",
    );
  });

  it("sends confirmation message to user on successful submission", async () => {
    const { retroSubmitCallback } = await loadModule();
    const ack = mock.fn(async () => {});
    const client = buildClient({
      canvasId: "F_EXISTING",
      dateSections: [{ id: "section_123" }],
    });
    const view = { state: { values: buildFakeValues() } };
    const body = { user: { id: "U456" } };
    const logger = { error: mock.fn() };

    await retroSubmitCallback({ ack, view, body, client, logger });

    const confirmationCall = client.chat.postMessage.mock.calls.find(
      (call) => call.arguments[0].text.includes("was submitted to"),
    );
    assert.ok(confirmationCall, "Should send a confirmation message");
    assert.equal(confirmationCall.arguments[0].channel, "U456");
    assert.ok(
      confirmationCall.arguments[0].text.includes("<#C999>"),
      "Confirmation should link to the retro channel",
    );
  });

  it("does not send confirmation when canvas write fails", async () => {
    const { retroSubmitCallback } = await loadModule();
    const ack = mock.fn(async () => {});
    const client = buildClient();
    client.conversations.info = mock.fn(async () => {
      throw new Error("info_error");
    });
    const view = { state: { values: buildFakeValues() } };
    const body = { user: { id: "U456" } };
    const logger = { error: mock.fn() };

    await retroSubmitCallback({ ack, view, body, client, logger });

    const confirmationCall = client.chat.postMessage.mock.calls.find(
      (call) => call.arguments[0].text.includes("was submitted to"),
    );
    assert.equal(
      confirmationCall,
      undefined,
      "Should not send confirmation when canvas write fails",
    );
  });

  it("still sends DM copy when canvas write fails and checkbox selected", async () => {
    const { retroSubmitCallback } = await loadModule();
    const ack = mock.fn(async () => {});
    const client = buildClient();
    client.conversations.info = mock.fn(async () => {
      throw new Error("info_error");
    });
    const values = buildFakeValues({
      dm_summary_block: {
        dm_summary: { selected_options: [{ value: "send_copy" }] },
      },
    });
    const view = { state: { values } };
    const body = { user: { id: "U456" } };
    const logger = { error: mock.fn() };

    await retroSubmitCallback({ ack, view, body, client, logger });

    assert.equal(
      client.chat.postMessage.mock.calls.length,
      1,
      "Should still send DM copy even when canvas write fails",
    );
    const copyCall = client.chat.postMessage.mock.calls[0].arguments[0];
    assert.ok(copyCall.blocks, "Message should include Block Kit blocks");
  });

  it("sends only the error message when channel is not configured", async () => {
    const { retroSubmitCallback } = await loadModule(null);
    const ack = mock.fn(async () => {});
    const client = buildClient();
    const view = { state: { values: buildFakeValues() } };
    const body = { user: { id: "U456" } };
    const logger = { error: mock.fn() };

    await retroSubmitCallback({ ack, view, body, client, logger });

    assert.equal(
      client.chat.postMessage.mock.calls.length,
      1,
      "Should only send the error message, not confirmation or copy",
    );
    assert.ok(
      client.chat.postMessage.mock.calls[0].arguments[0].text.includes(
        "/invite @RetroRun",
      ),
      "The only message should be the error with setup instructions",
    );
  });
});
