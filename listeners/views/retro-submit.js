/** Maps mood values to display emoji. */
const MOOD_EMOJI = {
  great: ":tada:",
  ok: ":slightly_smiling_face:",
  tough: ":persevere:",
};

/**
 * Extracts structured form data from the modal submission values.
 * @param {object} values - The view.state.values object from the submission.
 * @returns {object} Parsed retro fields.
 */
export const parseRetroValues = (values) => ({
  title: values.retro_title_block.retro_title.value,
  sprint: values.sprint_block.sprint_select.selected_option.text.text,
  date: values.date_block.sprint_date.selected_date,
  wentWell: values.went_well_block.went_well.value,
  wentWrong: values.went_wrong_block.went_wrong.value,
  actionItems: values.action_items_block.action_items.value,
  mood: values.mood_block.team_mood.selected_option.value,
  categories: (values.categories_block.categories.selected_options || []).map(
    (opt) => opt.text.text,
  ),
});

/**
 * Builds the Block Kit message blocks for a retro summary.
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
      type: "actions",
      elements: [
        {
          type: "button",
          text: { type: "plain_text", text: "Add Comment" },
          action_id: "add_comment",
          style: "primary",
        },
        {
          type: "overflow",
          action_id: "retro_overflow",
          options: [
            {
              text: { type: "plain_text", text: ":pushpin: Pin to Channel" },
              value: "pin",
            },
            {
              text: { type: "plain_text", text: ":bookmark: Bookmark" },
              value: "bookmark",
            },
          ],
        },
      ],
    },
    {
      type: "context",
      elements: [
        { type: "mrkdwn", text: `Submitted by <@${userId}> on ${retro.date}` },
      ],
    },
  ];
};

/**
 * Handles the retrospective modal submission. Parses input and posts a
 * summary message to the configured channel.
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
  const channel = process.env.RETRO_CHANNEL_ID;

  if (!channel) {
    logger.error("RETRO_CHANNEL_ID is not set");
    return;
  }

  try {
    await client.chat.postMessage({
      channel,
      text: `Retrospective: ${retro.title}`,
      blocks: buildRetroSummaryBlocks(retro, userId),
    });
  } catch (error) {
    logger.error("Failed to post retro summary", error);
  }
};
