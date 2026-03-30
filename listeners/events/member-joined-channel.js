import { getBotUserId, setRetroChannel } from "../channel-store.js";

export const memberJoinedChannelCallback = async ({ event, logger }) => {
  const botId = getBotUserId();
  if (!botId || event.user !== botId) {
    return;
  }

  logger.info(
    `Bot added to channel ${event.channel}, setting as retro channel`,
  );
  setRetroChannel(event.channel);
};
