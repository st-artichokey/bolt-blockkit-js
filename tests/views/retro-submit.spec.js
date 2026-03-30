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

describe("buildRetroMarkdown", () => {
  const loadModule = () => esmock("../../listeners/views/retro-submit.js", {});

  it("returns markdown string with retro title as heading", async () => {
    const { buildRetroMarkdown, parseRetroValues } = await loadModule();
    const retro = parseRetroValues(buildFakeValues());
    const md = buildRetroMarkdown(retro, "U456");

    assert.ok(md.includes("# Sprint 4 Retro"));
  });

  it("includes all retro sections", async () => {
    const { buildRetroMarkdown, parseRetroValues } = await loadModule();
    const retro = parseRetroValues(buildFakeValues());
    const md = buildRetroMarkdown(retro, "U456");

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
    const { buildRetroMarkdown, parseRetroValues } = await loadModule();
    const retro = parseRetroValues(buildFakeValues());
    const md = buildRetroMarkdown(retro, "U456");

    assert.ok(md.includes("Sprint 4"), "Missing sprint");
    assert.ok(md.includes("2026-03-28"), "Missing date");
    assert.ok(md.includes(":tada:"), "Missing mood emoji");
    assert.ok(md.includes("Process"), "Missing categories");
  });

  it("includes submitter mention", async () => {
    const { buildRetroMarkdown, parseRetroValues } = await loadModule();
    const retro = parseRetroValues(buildFakeValues());
    const md = buildRetroMarkdown(retro, "U456");

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

  /** Builds a mock client with canvas and chat APIs. */
  const buildClient = (canvasId = null) => ({
    conversations: {
      canvases: {
        create: mock.fn(async () => ({
          canvas_id: canvasId || "F_NEW_CANVAS",
        })),
      },
    },
    canvases: {
      edit: mock.fn(async () => ({})),
    },
    chat: { postMessage: mock.fn(async () => ({})) },
  });

  it("acknowledges and creates a canvas on first submission", async () => {
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
    assert.equal(createCall.document_content.type, "markdown");
    assert.ok(
      createCall.document_content.markdown.includes("# Sprint 4 Retro"),
      "Canvas should contain retro title as markdown heading",
    );
  });

  it("appends to existing canvas on subsequent submissions", async () => {
    const { retroSubmitCallback } = await loadModule();
    const ack = mock.fn(async () => {});
    const client = buildClient();
    const view = { state: { values: buildFakeValues() } };
    const body = { user: { id: "U456" } };
    const logger = { error: mock.fn() };

    // First call creates the canvas
    await retroSubmitCallback({ ack, view, body, client, logger });
    // Second call should append
    await retroSubmitCallback({ ack, view, body, client, logger });

    assert.equal(
      client.conversations.canvases.create.mock.calls.length,
      1,
      "Should only create once",
    );
    assert.equal(
      client.canvases.edit.mock.calls.length,
      1,
      "Should edit on second call",
    );
    const editCall = client.canvases.edit.mock.calls[0].arguments[0];
    assert.equal(editCall.canvas_id, "F_NEW_CANVAS");
    assert.equal(editCall.changes[0].operation, "insert_at_end");
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

    assert.equal(client.chat.postMessage.mock.calls.length, 1);
    const dmCall = client.chat.postMessage.mock.calls[0].arguments[0];
    assert.equal(dmCall.channel, "U456");
  });

  it("does not send copy when checkbox not selected", async () => {
    const { retroSubmitCallback } = await loadModule();
    const ack = mock.fn(async () => {});
    const client = buildClient();
    const view = { state: { values: buildFakeValues() } };
    const body = { user: { id: "U456" } };
    const logger = { error: mock.fn() };

    await retroSubmitCallback({ ack, view, body, client, logger });

    assert.equal(client.chat.postMessage.mock.calls.length, 0);
  });

  it("creates a new canvas when edit fails with stale cache", async () => {
    const { retroSubmitCallback } = await loadModule();
    const ack = mock.fn(async () => {});
    const client = buildClient();
    const view = { state: { values: buildFakeValues() } };
    const body = { user: { id: "U456" } };
    const logger = { error: mock.fn() };

    // First call creates the canvas and caches the ID
    await retroSubmitCallback({ ack, view, body, client, logger });
    assert.equal(client.conversations.canvases.create.mock.calls.length, 1);

    // Make edit fail (simulating deleted canvas)
    client.canvases.edit = mock.fn(async () => {
      throw new Error("canvas_not_found");
    });
    // Reset create mock to return a new canvas ID
    client.conversations.canvases.create = mock.fn(async () => ({
      canvas_id: "F_RECOVERED_CANVAS",
    }));

    // Second call should recover by creating a new canvas
    await retroSubmitCallback({ ack, view, body, client, logger });

    assert.equal(
      client.conversations.canvases.create.mock.calls.length,
      1,
      "Should create a new canvas after edit failure",
    );
  });

  it("logs error when retro channel is not configured", async () => {
    const { retroSubmitCallback } = await loadModule(null);
    const ack = mock.fn(async () => {});
    const client = buildClient();
    const view = { state: { values: buildFakeValues() } };
    const body = { user: { id: "U456" } };
    const logger = { error: mock.fn() };

    await retroSubmitCallback({ ack, view, body, client, logger });

    assert.equal(client.conversations.canvases.create.mock.calls.length, 0);
    assert.equal(logger.error.mock.calls.length, 1);
  });
});
