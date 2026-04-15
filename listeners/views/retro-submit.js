import { getRetroChannel } from "../channel-store.js";

/** Maps mood values to display emoji. */
const MOOD_EMOJI = {
  great: ":tada:",
  ok: ":slightly_smiling_face:",
  tough: ":persevere:",
};

/** Returns the display emoji and formatted categories list for a retro. */
const formatRetroMeta = (retro) => ({
  moodEmoji: MOOD_EMOJI[retro.mood] || "",
  categoriesList:
    retro.categories.length > 0 ? retro.categories.join(", ") : "None selected",
});

/** In-memory canvas ID cache keyed by channel ID (max 50 entries, FIFO eviction). */
const MAX_CACHE_SIZE = 50;
const canvasCache = new Map();

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
  const { moodEmoji, categoriesList } = formatRetroMeta(retro);

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
 * Builds the H1 date heading for a canvas section.
 * @param {string} date - The date string (e.g. "2026-04-07").
 * @returns {string} Markdown H1 heading with the date.
 */
export const buildDateHeading = (date) => `# ${date}\n\n`;

/**
 * Builds canvas markdown for a single retro entry (H2+ content, no date heading).
 * @param {object} retro - Parsed retro data from parseRetroValues.
 * @param {string} userId - The Slack user ID of the submitter.
 * @returns {string} Markdown-formatted retro entry for canvas.
 */
export const buildRetroEntry = (retro, userId) => {
  const { moodEmoji, categoriesList } = formatRetroMeta(retro);

  return [
    `## ${retro.title}`,
    `**Sprint:** ${retro.sprint} | **Date:** ${retro.date}`,
    `**Mood:** ${moodEmoji} ${retro.mood} | **Focus Areas:** ${categoriesList}`,
    "---",
    "### What Went Well",
    retro.wentWell,
    "### What Didn't Go Well",
    retro.wentWrong,
    "### Action Items",
    retro.actionItems,
    `> Submitted by ![](@${userId}) on ${retro.date}`,
    "",
  ].join("\n\n");
};

/**
 * Looks up the existing channel canvas ID via conversations.info.
 * @param {import('@slack/bolt').WebClient} client - Slack Web API client.
 * @param {string} channel - The Slack channel ID.
 * @returns {string|null} The canvas ID or null if not found.
 */
const lookupCanvasId = async (client, channel) => {
  const info = await client.conversations.info({ channel });
  return info.channel?.properties?.canvas?.canvas_id ?? null;
};

/**
 * Caches a canvas ID with FIFO eviction.
 */
const cacheCanvasId = (channel, canvasId) => {
  if (canvasCache.size >= MAX_CACHE_SIZE) {
    const oldest = canvasCache.keys().next().value;
    canvasCache.delete(oldest);
  }
  canvasCache.set(channel, canvasId);
};

/**
 * Gets the canvas ID for a channel, using cache when available.
 * @param {import('@slack/bolt').WebClient} client - Slack Web API client.
 * @param {string} channel - The Slack channel ID.
 * @returns {string|null} The canvas ID or null if no canvas exists.
 */
const getCanvasId = async (client, channel) => {
  const cached = canvasCache.get(channel);
  if (cached) return cached;

  const canvasId = await lookupCanvasId(client, channel);
  if (canvasId) cacheCanvasId(channel, canvasId);
  return canvasId;
};

/**
 * Writes a retro entry to the channel canvas, grouped under a date heading.
 * - If no canvas exists, creates one with the date heading + entry.
 * - If canvas exists but the date heading is missing, inserts date + entry at the top.
 * - If canvas exists and the date heading is found, inserts entry after the heading.
 * @param {import('@slack/bolt').WebClient} client - Slack Web API client.
 * @param {string} channel - The Slack channel ID.
 * @param {object} retro - Parsed retro data from parseRetroValues.
 * @param {string} userId - The Slack user ID of the submitter.
 */
const writeToCanvas = async (client, channel, retro, userId) => {
  const entry = buildRetroEntry(retro, userId);
  const canvasId = await getCanvasId(client, channel);

  if (!canvasId) {
    const markdown = buildDateHeading(retro.date) + entry;
    const result = await client.conversations.canvases.create({
      channel_id: channel,
      title: "Retro Canvas",
      document_content: { type: "markdown", markdown },
    });
    cacheCanvasId(channel, result.canvas_id);
    return { created: true };
  }

  // Look up existing date heading in the canvas
  const { sections } = await client.canvases.sections.lookup({
    canvas_id: canvasId,
    criteria: { section_types: ["h1"], contains_text: retro.date },
  });

  const dateSection = sections?.[0];
  const change = dateSection
    ? {
        operation: "insert_after",
        section_id: dateSection.id,
        document_content: { type: "markdown", markdown: entry },
      }
    : {
        operation: "insert_at_start",
        document_content: {
          type: "markdown",
          markdown: buildDateHeading(retro.date) + entry,
        },
      };

  await client.canvases.edit({ canvas_id: canvasId, changes: [change] });
  return { created: false };
};

/**
 * Handles the retrospective modal submission. Writes retro content to the
 * channel canvas, sends a confirmation to the submitter, and optionally
 * sends a Block Kit copy to the user's Messages tab. If the retro channel
 * is not configured, notifies the user with setup instructions.
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
    try {
      await client.chat.postMessage({
        channel: userId,
        text: "Your retrospective couldn't be saved — RetroRun isn't in a channel yet. Ask a workspace admin to type `/invite @RetroRun` in a channel, then try again.",
      });
    } catch (error) {
      logger.error("Failed to send setup error to user", error);
    }
    return;
  }

  let canvasWriteSucceeded = false;
  let canvasCreated = false;
  try {
    const result = await writeToCanvas(client, channel, retro, userId);
    canvasWriteSucceeded = true;
    canvasCreated = result.created;
  } catch (error) {
    logger.error("Failed to write retro to canvas", error);
  }

  if (canvasWriteSucceeded) {
    try {
      const text = canvasCreated
        ? `A "Retro Canvas" was created in <#${channel}>. Your retrospective "${retro.title}" has been saved there.`
        : `Your retrospective "${retro.title}" was submitted to <#${channel}>.`;
      await client.chat.postMessage({ channel: userId, text });
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
