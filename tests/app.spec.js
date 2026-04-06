import assert from "node:assert/strict";
import { describe, it, mock } from "node:test";
import esmock from "esmock";

describe("discoverRetroChannel", () => {
  const buildClient = (channels = []) => ({
    users: {
      conversations: mock.fn(async () => ({ channels })),
    },
  });

  const buildLogger = () => ({
    info: mock.fn(),
    warn: mock.fn(),
    error: mock.fn(),
  });

  const loadModule = () => esmock("../listeners/channel-store.js", {});

  it("sets retro channel when bot is in exactly one channel", async () => {
    const { discoverRetroChannel, getRetroChannel } = await loadModule();
    const client = buildClient([{ id: "C123", name: "retro" }]);
    const logger = buildLogger();

    await discoverRetroChannel(client, logger);

    assert.equal(getRetroChannel(), "C123");
    assert.equal(logger.info.mock.calls.length, 1);
  });

  it("uses first channel and warns when bot is in multiple channels", async () => {
    const { discoverRetroChannel, getRetroChannel } = await loadModule();
    const client = buildClient([
      { id: "C111", name: "retro" },
      { id: "C222", name: "general" },
    ]);
    const logger = buildLogger();

    await discoverRetroChannel(client, logger);

    assert.equal(getRetroChannel(), "C111");
    assert.equal(logger.warn.mock.calls.length, 1);
    assert.ok(
      logger.warn.mock.calls[0].arguments[0].includes("2 channels"),
      "Should warn about multiple channels",
    );
  });

  it("does not set retro channel when bot is in no channels", async () => {
    const { discoverRetroChannel, getRetroChannel } = await loadModule();
    const client = buildClient([]);
    const logger = buildLogger();

    await discoverRetroChannel(client, logger);

    assert.equal(getRetroChannel(), null);
    assert.equal(logger.warn.mock.calls.length, 1);
    assert.ok(
      logger.warn.mock.calls[0].arguments[0].includes("not in any channels"),
      "Should warn about no channels",
    );
  });

  it("handles API error gracefully", async () => {
    const { discoverRetroChannel, getRetroChannel } = await loadModule();
    const client = {
      users: {
        conversations: mock.fn(async () => {
          throw new Error("api_error");
        }),
      },
    };
    const logger = buildLogger();

    await discoverRetroChannel(client, logger);

    assert.equal(getRetroChannel(), null);
    assert.equal(logger.error.mock.calls.length, 1);
  });
});
