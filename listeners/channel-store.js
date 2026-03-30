let retroChannelId = null;
let botUserId = null;

/**
 * Returns the retro channel ID, falling back to the RETRO_CHANNEL_ID env var.
 * @returns {string|null} The channel ID or null if not configured.
 */
export const getRetroChannel = () =>
  retroChannelId || process.env.RETRO_CHANNEL_ID || null;

/**
 * Stores the retro channel ID.
 * @param {string} channelId - The Slack channel ID.
 */
export const setRetroChannel = (channelId) => {
  retroChannelId = channelId;
};

/**
 * Returns the bot's own user ID.
 * @returns {string|null} The bot user ID or null if not yet initialized.
 */
export const getBotUserId = () => botUserId;

/**
 * Stores the bot's own user ID.
 * @param {string} userId - The bot's Slack user ID.
 */
export const setBotUserId = (userId) => {
  botUserId = userId;
};
