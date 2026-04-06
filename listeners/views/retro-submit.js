import { getRetroChannel } from "../channel-store.js";

/** Maps mood values to display emoji. */
const MOOD_EMOJI = {
  great: ":tada:",
  ok: ":slightly_smiling_face:",
  tough: ":persevere:",
};

/** In-memory canvas ID cache keyed by channel ID (max 50 entries, LRU eviction). */
const MAX_CACHE_SIZE = 50;
const canvasCache = new Map();

/** Per-channel promise locks to prevent concurrent canvas creation. */
const channelLocks = new Map();

/**
 * Reads a required field from the modal values, throwing a descriptive error if missing.
 */
const requireField = (obj, path) => {
  let current = obj;
  for (const key of path) {
    current = current?.[key];
    if (current == null) {
      throw new Error(`Missing required field: ${path.join(".")}`);
    }
  }
  return current;
};

/**
 * Extracts structured form data from the modal submission values.
 * @param {object} values - The view.state.values object from the submission.
 * @returns {object} Parsed retro fields.
 */
export const parseRetroValues = (values) => ({
  title: requireField(values, ["retro_title_block", "retro_title", "value"]),
  sprint: requireField(values, [
    "sprint_block",
    "sprint_select",
    "selected_option",
    "text",
    "text",
  ]),
  date: requireField(values, ["date_block", "sprint_date", "selected_date"]),
  wentWell: requireField(values, ["went_well_block", "went_well", "value"]),
  wentWrong: requireField(values, ["went_wrong_block", "went_wrong", "value"]),
  actionItems: requireField(values, [
    "action_items_block",
    "action_items",
    "value",
  ]),
  mood: requireField(values, [
    "mood_block",
    "team_mood",
    "selected_option",
    "value",
  ]),
  categories: (values.categories_block?.categories?.selected_options || []).map(
    (opt) => opt.text.text,
  ),
});

/**
 * Builds the Block Kit message blocks for a retro summary (used for Messages tab copy).
 * @param {object} retro - Parsed retro data from parseRetroValues.
 * @param {string} userId - The Slack user ID of the submitter.
 * @returns {object[]} An array of Block Kit blocks.
 */
export const buildRetroSummaryBlocks = (retro, userId) => {
  const moodEmoji = MOOD_EMOJI[retro.mood] || "";
  const categoriesList =
    retro.categories.length > 0 ? retro.categories.join(", ") : "None selected";

  return [
    {
      type: "header",
      text: { type: "plain_text", text: retro.title },
    },
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*Sprint:*\n${retro.sprint}` },
        { type: "mrkdwn", text: `*Date:*\n${retro.date}` },
      ],
    },
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*Mood:*\n${moodEmoji} ${retro.mood}` },
        { type: "mrkdwn", text: `*Focus Areas:*\n${categoriesList}` },
      ],
    },
    { type: "divider" },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*:white_check_mark: What went well*\n${retro.wentWell}`,
      },
    },
    { type: "divider" },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*:x: What didn't go well*\n${retro.wentWrong}`,
      },
    },
    { type: "divider" },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*:arrow_right: Action Items*\n${retro.actionItems}`,
      },
    },
    { type: "divider" },
    {
      type: "context",
      elements: [
        { type: "mrkdwn", text: `Submitted by <@${userId}> on ${retro.date}` },
      ],
    },
  ];
};

/**
 * Builds canvas markdown content for a retro entry.
 * @param {object} retro - Parsed retro data from parseRetroValues.
 * @param {string} userId - The Slack user ID of the submitter.
 * @returns {string} Markdown-formatted retro summary for canvas.
 */
export const buildRetroMarkdown = (retro, userId) => {
  const moodEmoji = MOOD_EMOJI[retro.mood] || "";
  const categoriesList =
    retro.categories.length > 0 ? retro.categories.join(", ") : "None selected";

  return [
    `# ${retro.title}`,
    `**Sprint:** ${retro.sprint} | **Date:** ${retro.date}`,
    `**Mood:** ${moodEmoji} ${retro.mood} | **Focus Areas:** ${categoriesList}`,
    "---",
    "## What Went Well",
    retro.wentWell,
    "## What Didn't Go Well",
    retro.wentWrong,
    "## Action Items",
    retro.actionItems,
    `> Submitted by ![](@${userId}) on ${retro.date}`,
    "",
  ].join("\n\n");
};

/**
 * Writes markdown to the channel canvas, creating one if needed.
 * Uses a per-channel lock to prevent concurrent canvas creation.
 */
const writeToCanvas = async (client, channel, markdown) => {
  // Wait for any in-flight create for this channel to finish first
  const pending = channelLocks.get(channel);
  if (pending) {
    await pending;
  }

  const existingCanvasId = canvasCache.get(channel);

  if (existingCanvasId) {
    try {
      await client.canvases.edit({
        canvas_id: existingCanvasId,
        changes: [
          {
            operation: "insert_at_end",
            document_content: { type: "markdown", markdown },
          },
        ],
      });
      return;
    } catch {
      canvasCache.delete(channel);
    }
  }

  // Create a new canvas, storing the promise so concurrent callers can wait
  const createPromise = client.conversations.canvases.create({
    channel_id: channel,
    document_content: { type: "markdown", markdown },
  });
  channelLocks.set(channel, createPromise);

  try {
    const result = await createPromise;
    // Evict oldest entry if cache is full
    if (canvasCache.size >= MAX_CACHE_SIZE) {
      const oldest = canvasCache.keys().next().value;
      canvasCache.delete(oldest);
    }
    canvasCache.set(channel, result.canvas_id);
  } finally {
    channelLocks.delete(channel);
  }
};

/**
 * Handles the retrospective modal submission. Writes retro content to the
 * channel canvas and optionally sends a copy to the user's Messages tab.
 * @param {object} args - Bolt view submission callback arguments.
 * @param {Function} args.ack - Acknowledge the view submission.
 * @param {object} args.view - The submitted view payload.
 * @param {object} args.body - The full request body.
 * @param {import('@slack/bolt').WebClient} args.client - Slack Web API client.
 * @param {object} args.logger - Bolt logger instance.
 */
export const retroSubmitCallback = async ({
  ack,
  view,
  body,
  client,
  logger,
}) => {
  await ack();

  const retro = parseRetroValues(view.state.values);
  const userId = body.user.id;
  const channel = getRetroChannel();

  if (!channel) {
    logger.error("Retro channel is not configured");
    return;
  }

  const markdown = buildRetroMarkdown(retro, userId);

  let canvasWriteSucceeded = false;
  try {
    await writeToCanvas(client, channel, markdown);
    canvasWriteSucceeded = true;
  } catch (error) {
    logger.error("Failed to write retro to canvas", error);
  }

  if (canvasWriteSucceeded) {
    try {
      await client.chat.postMessage({
        channel: userId,
        text: `Your retrospective "${retro.title}" was submitted to <#${channel}>.`,
      });
    } catch (error) {
      logger.error("Failed to send submission confirmation", error);
    }
  }

  const dmSelected =
    view.state.values.dm_summary_block?.dm_summary?.selected_options?.length >
    0;

  if (dmSelected) {
    try {
      await client.chat.postMessage({
        channel: userId,
        text: `Your retrospective: ${retro.title}`,
        blocks: buildRetroSummaryBlocks(retro, userId),
      });
    } catch (error) {
      logger.error("Failed to send retro copy to Messages tab", error);
    }
  }
};
