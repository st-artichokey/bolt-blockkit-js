import assert from "node:assert/strict";
import { describe, it, mock } from "node:test";
import esmock from "esmock";

describe("startRetroHomeCallback", () => {
  const loadModule = () =>
    esmock("../../listeners/actions/retro-actions.js", {
      "../../listeners/shortcuts/start-retro.js": {
        buildRetroModal: () => ({
          type: "modal",
          callback_id: "retro_submit",
          blocks: [],
        }),
      },
    });

  it("acknowledges the action", async () => {
    const { startRetroHomeCallback } = await loadModule();
    const ack = mock.fn(async () => {});
    const client = { views: { open: mock.fn(async () => ({})) } };
    const body = { trigger_id: "T123" };
    const logger = { error: mock.fn() };

    await startRetroHomeCallback({ ack, client, body, logger });

    assert.equal(ack.mock.calls.length, 1);
  });

  it("opens the retro modal with the trigger_id", async () => {
    const { startRetroHomeCallback } = await loadModule();
    const ack = mock.fn(async () => {});
    const openMock = mock.fn(async () => ({}));
    const client = { views: { open: openMock } };
    const body = { trigger_id: "T456" };
    const logger = { error: mock.fn() };

    await startRetroHomeCallback({ ack, client, body, logger });

    assert.equal(openMock.mock.calls.length, 1);
    const call = openMock.mock.calls[0].arguments[0];
    assert.equal(call.trigger_id, "T456");
    assert.equal(call.view.type, "modal");
    assert.equal(call.view.callback_id, "retro_submit");
  });

  it("logs errors when modal open fails", async () => {
    const { startRetroHomeCallback } = await loadModule();
    const ack = mock.fn(async () => {});
    const error = new Error("open failed");
    const client = {
      views: {
        open: mock.fn(async () => {
          throw error;
        }),
      },
    };
    const body = { trigger_id: "T123" };
    const logger = { error: mock.fn() };

    await startRetroHomeCallback({ ack, client, body, logger });

    assert.equal(logger.error.mock.calls.length, 1);
  });
});
