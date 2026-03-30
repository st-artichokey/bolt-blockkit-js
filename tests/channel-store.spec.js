import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import esmock from "esmock";

describe("channel-store", () => {
  const originalEnv = process.env.RETRO_CHANNEL_ID;

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.RETRO_CHANNEL_ID;
    } else {
      process.env.RETRO_CHANNEL_ID = originalEnv;
    }
  });

  const loadModule = () => esmock("../listeners/channel-store.js", {});

  it("returns null when no channel is set and env var is absent", async () => {
    delete process.env.RETRO_CHANNEL_ID;
    const { getRetroChannel } = await loadModule();
    assert.equal(getRetroChannel(), null);
  });

  it("falls back to RETRO_CHANNEL_ID env var", async () => {
    process.env.RETRO_CHANNEL_ID = "C_FROM_ENV";
    const { getRetroChannel } = await loadModule();
    assert.equal(getRetroChannel(), "C_FROM_ENV");
  });

  it("setRetroChannel overrides the env var fallback", async () => {
    process.env.RETRO_CHANNEL_ID = "C_FROM_ENV";
    const { getRetroChannel, setRetroChannel } = await loadModule();
    setRetroChannel("C_DYNAMIC");
    assert.equal(getRetroChannel(), "C_DYNAMIC");
  });

  it("stores and retrieves bot user ID", async () => {
    const { getBotUserId, setBotUserId } = await loadModule();
    assert.equal(getBotUserId(), null);
    setBotUserId("U_BOT");
    assert.equal(getBotUserId(), "U_BOT");
  });
});
