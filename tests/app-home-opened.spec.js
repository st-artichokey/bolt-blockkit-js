import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import esmock from "esmock";

describe("appHomeOpenedCallback", () => {
  const loadModule = () =>
    esmock("../listeners/events/app-home-opened.js", {});

  /** Helper to call the callback and return the published blocks. */
  const getPublishedBlocks = async (userId = "U123") => {
    const { appHomeOpenedCallback } = await loadModule();
    const publishMock = mock.fn(async () => ({}));
    const client = { views: { publish: publishMock } };
    const event = { tab: "home", user: userId };
    const logger = { error: mock.fn() };

    await appHomeOpenedCallback({ client, event, logger });

    return {
      blocks: publishMock.mock.calls[0].arguments[0].view.blocks,
      publishMock,
      logger,
    };
  };

  it("publishes the home tab view for home tab events", async () => {
    const { appHomeOpenedCallback } = await loadModule();
    const publishMock = mock.fn(async () => ({}));
    const client = { views: { publish: publishMock } };
    const event = { tab: "home", user: "U123" };
    const logger = { error: mock.fn() };

    await appHomeOpenedCallback({ client, event, logger });

    assert.equal(publishMock.mock.calls.length, 1);
    const call = publishMock.mock.calls[0].arguments[0];
    assert.equal(call.user_id, "U123");
    assert.equal(call.view.type, "home");
    assert.ok(call.view.blocks.length > 0);
  });

  it("skips non-home tab events", async () => {
    const { appHomeOpenedCallback } = await loadModule();
    const publishMock = mock.fn(async () => ({}));
    const client = { views: { publish: publishMock } };
    const event = { tab: "messages", user: "U123" };
    const logger = { error: mock.fn() };

    await appHomeOpenedCallback({ client, event, logger });

    assert.equal(publishMock.mock.calls.length, 0);
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

  it("logs errors from views.publish", async () => {
    const { appHomeOpenedCallback } = await loadModule();
    const error = new Error("publish failed");
    const client = {
      views: {
        publish: mock.fn(async () => {
          throw error;
        }),
      },
    };
    const event = { tab: "home", user: "U123" };
    const logger = { error: mock.fn() };

    await appHomeOpenedCallback({ client, event, logger });

    assert.equal(logger.error.mock.calls.length, 1);
  });
});
