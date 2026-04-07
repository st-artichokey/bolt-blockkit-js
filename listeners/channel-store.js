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

/**
 * Queries the Slack API to find public channels the bot is a member of
 * and sets the retro channel. Called on startup to recover channel state.
 * @param {import('@slack/bolt').WebClient} client - Slack Web API client.
 * @param {object} logger - Bolt logger instance.
 */
export const discoverRetroChannel = async (client, logger) => {
  try {
    const result = await client.users.conversations({
      types: "public_channel",
      exclude_archived: true,
      limit: 100,
    });
    const channels = result.channels || [];
    if (channels.length === 1) {
      setRetroChannel(channels[0].id);
      logger.info(`Auto-discovered retro channel: ${channels[0].id}`);
    } else if (channels.length > 1) {
      setRetroChannel(channels[0].id);
      logger.warn(
        `Bot is in ${channels.length} channels, using first: ${channels[0].id}`,
      );
    } else {
      logger.warn(
        "Bot is not in any channels — invite it with /invite @RetroRun",
      );
    }
  } catch (error) {
    logger.error("Failed to discover retro channel on startup", error);
  }
};
