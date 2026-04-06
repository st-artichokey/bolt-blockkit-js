let retroChannelId = null;
let botUserId = null;

/**
 * Returns the retro channel ID, set via auto-discovery when the bot joins a channel.
 * @returns {string|null} The channel ID or null if not yet discovered.
 */
export const getRetroChannel = () => retroChannelId;

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
