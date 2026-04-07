import {
  getBotUserId,
  getRetroChannel,
  setRetroChannel,
} from "../channel-store.js";

export const memberJoinedChannelCallback = async ({ event, logger }) => {
  const botId = getBotUserId();
  if (!botId || event.user !== botId) {
    return;
  }

  const existing = getRetroChannel();
  if (existing) {
    logger.warn(
      `Bot added to ${event.channel}, but retro channel is already set to ${existing} — ignoring`,
    );
    return;
  }

  logger.info(
    `Bot added to channel ${event.channel}, setting as retro channel`,
  );
  setRetroChannel(event.channel);
};
