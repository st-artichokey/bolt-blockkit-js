import assert from "node:assert/strict";
import { describe, it, mock } from "node:test";
import esmock from "esmock";

describe("memberJoinedChannelCallback", () => {
  it("stores channel when the bot itself joins", async () => {
    const setRetroChannel = mock.fn();
    const { memberJoinedChannelCallback } = await esmock(
      "../listeners/events/member-joined-channel.js",
      {
        "../listeners/channel-store.js": {
          getBotUserId: () => "U_BOT",
          setRetroChannel,
        },
      },
    );

    const event = { user: "U_BOT", channel: "C_NEW_CHANNEL" };
    const logger = { info: mock.fn() };

    await memberJoinedChannelCallback({ event, logger });

    assert.equal(setRetroChannel.mock.calls.length, 1);
    assert.equal(setRetroChannel.mock.calls[0].arguments[0], "C_NEW_CHANNEL");
  });

  it("ignores when a non-bot user joins", async () => {
    const setRetroChannel = mock.fn();
    const { memberJoinedChannelCallback } = await esmock(
      "../listeners/events/member-joined-channel.js",
      {
        "../listeners/channel-store.js": {
          getBotUserId: () => "U_BOT",
          setRetroChannel,
        },
      },
    );

    const event = { user: "U_HUMAN", channel: "C_SOME_CHANNEL" };
    const logger = { info: mock.fn() };

    await memberJoinedChannelCallback({ event, logger });

    assert.equal(setRetroChannel.mock.calls.length, 0);
  });

  it("ignores when bot user ID is not yet initialized", async () => {
    const setRetroChannel = mock.fn();
    const { memberJoinedChannelCallback } = await esmock(
      "../listeners/events/member-joined-channel.js",
      {
        "../listeners/channel-store.js": {
          getBotUserId: () => null,
          setRetroChannel,
        },
      },
    );

    const event = { user: "U_SOMEONE", channel: "C_CHANNEL" };
    const logger = { info: mock.fn() };

    await memberJoinedChannelCallback({ event, logger });

    assert.equal(setRetroChannel.mock.calls.length, 0);
  });
});
