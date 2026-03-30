import assert from "node:assert/strict";
import { describe, it, mock } from "node:test";
import esmock from "esmock";

describe("startRetroCallback", () => {
  const loadModule = () =>
    esmock("../../listeners/shortcuts/start-retro.js", {});

  it("acknowledges the shortcut", async () => {
    const { startRetroCallback } = await loadModule();
    const ack = mock.fn(async () => {});
    const client = { views: { open: mock.fn(async () => ({})) } };
    const shortcut = { trigger_id: "T123" };
    const logger = { error: mock.fn() };

    await startRetroCallback({ ack, client, shortcut, logger });

    assert.equal(ack.mock.calls.length, 1);
  });

  it("opens the retro modal with the trigger_id", async () => {
    const { startRetroCallback } = await loadModule();
    const ack = mock.fn(async () => {});
    const openMock = mock.fn(async () => ({}));
    const client = { views: { open: openMock } };
    const shortcut = { trigger_id: "T123" };
    const logger = { error: mock.fn() };

    await startRetroCallback({ ack, client, shortcut, logger });

    assert.equal(openMock.mock.calls.length, 1);
    const call = openMock.mock.calls[0].arguments[0];
    assert.equal(call.trigger_id, "T123");
    assert.equal(call.view.type, "modal");
    assert.equal(call.view.callback_id, "retro_submit");
  });

  it("logs errors when modal open fails", async () => {
    const { startRetroCallback } = await loadModule();
    const ack = mock.fn(async () => {});
    const error = new Error("open failed");
    const client = {
      views: {
        open: mock.fn(async () => {
          throw error;
        }),
      },
    };
    const shortcut = { trigger_id: "T123" };
    const logger = { error: mock.fn() };

    await startRetroCallback({ ack, client, shortcut, logger });

    assert.equal(logger.error.mock.calls.length, 1);
  });
});

describe("buildRetroModal", () => {
  const loadModule = () =>
    esmock("../../listeners/shortcuts/start-retro.js", {});

  it("returns a valid modal with all input blocks", async () => {
    const { buildRetroModal } = await loadModule();
    const modal = buildRetroModal();

    assert.equal(modal.type, "modal");
    assert.equal(modal.callback_id, "retro_submit");

    const blockIds = modal.blocks
      .filter((b) => b.block_id)
      .map((b) => b.block_id);

    assert.ok(blockIds.includes("retro_title_block"));
    assert.ok(blockIds.includes("sprint_block"));
    assert.ok(blockIds.includes("date_block"));
    assert.ok(blockIds.includes("went_well_block"));
    assert.ok(blockIds.includes("went_wrong_block"));
    assert.ok(blockIds.includes("action_items_block"));
    assert.ok(blockIds.includes("mood_block"));
    assert.ok(blockIds.includes("categories_block"));
  });

  it("includes divider blocks between sections", async () => {
    const { buildRetroModal } = await loadModule();
    const modal = buildRetroModal();
    const dividers = modal.blocks.filter((b) => b.type === "divider");
    assert.ok(dividers.length >= 2);
  });

  it("includes a send-copy checkbox", async () => {
    const { buildRetroModal } = await loadModule();
    const modal = buildRetroModal();
    const dmBlock = modal.blocks.find((b) => b.block_id === "dm_summary_block");
    assert.ok(dmBlock, "Expected a dm_summary_block");
    const element = dmBlock.element || dmBlock.accessory;
    assert.equal(element.type, "checkboxes");
    assert.equal(element.action_id, "dm_summary");
    assert.ok(element.options.length >= 1);
  });
});
