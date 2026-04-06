import assert from "node:assert/strict";
import { describe, it } from "node:test";
import esmock from "esmock";

describe("channel-store", () => {
  const loadModule = () => esmock("../listeners/channel-store.js", {});

  it("returns null when no channel is set", async () => {
    const { getRetroChannel } = await loadModule();
    assert.equal(getRetroChannel(), null);
  });

  it("setRetroChannel stores and retrieves channel", async () => {
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
