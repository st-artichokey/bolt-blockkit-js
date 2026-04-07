import assert from "node:assert/strict";
import { describe, it, mock } from "node:test";
import esmock from "esmock";

describe("appHomeOpenedCallback", () => {
  const loadModule = (channelId = "C999") =>
    esmock("../../listeners/events/app-home-opened.js", {
      "../../listeners/channel-store.js": {
        getRetroChannel: () => channelId,
      },
    });

  /** Builds a mock client with configurable conversations.history. */
  const buildClient = () => ({
    views: { publish: mock.fn(async () => ({})) },
    conversations: { history: mock.fn(async () => ({ messages: [] })) },
  });

  /** Helper to call the callback and return the published blocks. */
  const getPublishedBlocks = async (
    userId = "U123",
    client = null,
    channelId = "C999",
  ) => {
    const { appHomeOpenedCallback } = await loadModule(channelId);
    const c = client || buildClient();
    const event = { tab: "home", user: userId };
    const logger = { error: mock.fn() };

    await appHomeOpenedCallback({ client: c, event, logger });

    return {
      blocks: c.views.publish.mock.calls[0].arguments[0].view.blocks,
      publishMock: c.views.publish,
      logger,
    };
  };

  it("publishes the home tab view for home tab events", async () => {
    const { appHomeOpenedCallback } = await loadModule();
    const client = buildClient();
    const event = { tab: "home", user: "U123" };
    const logger = { error: mock.fn() };

    await appHomeOpenedCallback({ client, event, logger });

    assert.equal(client.views.publish.mock.calls.length, 1);
    const call = client.views.publish.mock.calls[0].arguments[0];
    assert.equal(call.user_id, "U123");
    assert.equal(call.view.type, "home");
    assert.ok(call.view.blocks.length > 0);
  });

  it("skips non-home tab events", async () => {
    const { appHomeOpenedCallback } = await loadModule();
    const client = buildClient();
    const event = { tab: "messages", user: "U123" };
    const logger = { error: mock.fn() };

    await appHomeOpenedCallback({ client, event, logger });

    assert.equal(client.views.publish.mock.calls.length, 0);
  });

  it("includes header block with app title", async () => {
    const { blocks } = await getPublishedBlocks();
    const header = blocks.find((b) => b.type === "header");
    assert.ok(header);
    assert.equal(header.text.text, "Team Retrospectives");
  });

  it("includes a personalized greeting with the user ID", async () => {
    const { blocks } = await getPublishedBlocks("U789");
    const greeting = blocks.find(
      (b) =>
        b.type === "section" &&
        b.text?.type === "mrkdwn" &&
        b.text.text.includes("<@U789>"),
    );
    assert.ok(greeting, "Expected a section block with personalized greeting");
  });

  it("includes a Start Retrospective button in an actions block", async () => {
    const { blocks } = await getPublishedBlocks();
    const actionsBlock = blocks.find((b) => b.type === "actions");
    assert.ok(actionsBlock, "Expected an actions block");

    const startButton = actionsBlock.elements.find(
      (el) => el.action_id === "start_retro_home",
    );
    assert.ok(startButton, "Expected a button with action_id start_retro_home");
    assert.equal(startButton.type, "button");
  });

  it("includes an AI disclosure context block", async () => {
    const { blocks } = await getPublishedBlocks();
    const aiDisclosure = blocks.find(
      (b) =>
        b.type === "context" &&
        b.elements?.some(
          (el) => el.type === "mrkdwn" && /ai|automat/i.test(el.text),
        ),
    );
    assert.ok(aiDisclosure, "Expected a context block with AI disclosure");
  });

  it("uses user-friendly language for the shortcuts menu reference", async () => {
    const { blocks } = await getPublishedBlocks();
    const howItWorks = blocks.find(
      (b) => b.type === "section" && b.text?.text?.includes("shortcuts menu"),
    );
    assert.ok(howItWorks, "Expected a reference to the shortcuts menu");
    assert.ok(
      howItWorks.text.text.includes("lightning bolt"),
      "Expected a mention of the lightning bolt icon",
    );
    assert.ok(
      !howItWorks.text.text.includes("global shortcut"),
      "Should not use jargon 'global shortcut'",
    );
  });

  it("does not contain developer-facing Block Kit element list", async () => {
    const { blocks } = await getPublishedBlocks();
    const devSection = blocks.find(
      (b) =>
        b.type === "section" &&
        b.text?.text?.includes("Block Kit elements demonstrated"),
    );
    assert.equal(
      devSection,
      undefined,
      "Should not include developer-facing content",
    );
  });

  it("includes a support section with a link to the GitHub repo", async () => {
    const { blocks } = await getPublishedBlocks();
    const supportBlock = blocks.find(
      (b) =>
        b.type === "section" &&
        b.text?.text?.includes("https://github.com/st-artichokey/retrorun"),
    );
    assert.ok(supportBlock, "Expected a section with a GitHub support link");
    assert.ok(
      /help|support/i.test(supportBlock.text.text),
      "Expected the support section to mention help or support",
    );
  });

  it("includes a pricing disclosure", async () => {
    const { blocks } = await getPublishedBlocks();
    const pricingBlock = blocks.find(
      (b) =>
        b.type === "context" &&
        b.elements?.some((el) => el.type === "mrkdwn" && /free/i.test(el.text)),
    );
    assert.ok(
      pricingBlock,
      "Expected a context block disclosing the app is free",
    );
  });

  it("references the channel canvas for viewing retrospectives", async () => {
    const { blocks } = await getPublishedBlocks();
    const canvasRef = blocks.find(
      (b) => b.type === "section" && b.text?.text?.includes("canvas"),
    );
    assert.ok(canvasRef, "Expected a section referencing the channel canvas");
  });

  it("links to the retro channel using native mrkdwn channel mention", async () => {
    const { blocks } = await getPublishedBlocks("U123", null, "C999");
    const linkBlock = blocks.find(
      (b) => b.type === "section" && b.text?.text?.includes("<#C999>"),
    );
    assert.ok(linkBlock, "Expected a block with a native channel mention <#C999>");
    assert.ok(
      !linkBlock.text.text.includes("slack://"),
      "Should use native channel mention, not slack:// deep link",
    );
  });

  it("shows limited view without button when channel access fails", async () => {
    const client = {
      views: { publish: mock.fn(async () => ({})) },
      conversations: {
        history: mock.fn(async () => {
          throw new Error("channel_not_found");
        }),
      },
    };
    const { blocks } = await getPublishedBlocks("U123", client);

    const actionsBlock = blocks.find((b) => b.type === "actions");
    assert.equal(
      actionsBlock,
      undefined,
      "Limited view should not include actions block",
    );

    const invitePrompt = blocks.find(
      (b) => b.type === "section" && b.text?.text?.includes("invite"),
    );
    assert.ok(invitePrompt, "Expected a prompt to invite the bot to a channel");
  });

  it("shows limited view when retro channel is not configured", async () => {
    const client = buildClient();
    const { blocks } = await getPublishedBlocks("U123", client, null);

    const actionsBlock = blocks.find((b) => b.type === "actions");
    assert.equal(
      actionsBlock,
      undefined,
      "Limited view should not include actions block when channel not configured",
    );
  });

  it("logs errors from views.publish", async () => {
    const { appHomeOpenedCallback } = await loadModule();
    const error = new Error("publish failed");
    const client = {
      views: {
        publish: mock.fn(async () => {
          throw error;
        }),
      },
      conversations: { history: mock.fn(async () => ({ messages: [] })) },
    };
    const event = { tab: "home", user: "U123" };
    const logger = { error: mock.fn() };

    await appHomeOpenedCallback({ client, event, logger });

    assert.equal(logger.error.mock.calls.length, 1);
  });
});
