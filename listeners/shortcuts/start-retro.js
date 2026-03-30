/** Sprint options for the static select menu. */
const SPRINT_OPTIONS = [
  { text: { type: "plain_text", text: "Sprint 1" }, value: "sprint_1" },
  { text: { type: "plain_text", text: "Sprint 2" }, value: "sprint_2" },
  { text: { type: "plain_text", text: "Sprint 3" }, value: "sprint_3" },
  { text: { type: "plain_text", text: "Sprint 4" }, value: "sprint_4" },
];

/** Category options for the checkbox group. */
const CATEGORY_OPTIONS = [
  {
    text: { type: "plain_text", text: "Communication" },
    value: "communication",
  },
  { text: { type: "plain_text", text: "Process" }, value: "process" },
  { text: { type: "plain_text", text: "Tooling" }, value: "tooling" },
  {
    text: { type: "plain_text", text: "Team Dynamics" },
    value: "team_dynamics",
  },
];

/** Mood options for the radio button group. */
const MOOD_OPTIONS = [
  { text: { type: "plain_text", text: "Great :tada:" }, value: "great" },
  {
    text: { type: "plain_text", text: "OK :slightly_smiling_face:" },
    value: "ok",
  },
  { text: { type: "plain_text", text: "Tough :persevere:" }, value: "tough" },
];

/**
 * Builds the Block Kit modal view for the retrospective form.
 * @returns {object} A Slack modal view payload.
 */
export const buildRetroModal = () => ({
  type: "modal",
  callback_id: "retro_submit",
  title: { type: "plain_text", text: "Team Retrospective" },
  submit: { type: "plain_text", text: "Submit" },
  close: { type: "plain_text", text: "Cancel" },
  blocks: [
    {
      type: "input",
      block_id: "retro_title_block",
      label: { type: "plain_text", text: "Retro Title" },
      element: {
        type: "plain_text_input",
        action_id: "retro_title",
        placeholder: {
          type: "plain_text",
          text: "e.g. Sprint 4 Retrospective",
        },
      },
    },
    {
      type: "input",
      block_id: "sprint_block",
      label: { type: "plain_text", text: "Sprint / Iteration" },
      element: {
        type: "static_select",
        action_id: "sprint_select",
        placeholder: { type: "plain_text", text: "Select a sprint" },
        options: SPRINT_OPTIONS,
      },
    },
    {
      type: "input",
      block_id: "date_block",
      label: { type: "plain_text", text: "Sprint End Date" },
      element: {
        type: "datepicker",
        action_id: "sprint_date",
        placeholder: { type: "plain_text", text: "Select a date" },
      },
    },
    { type: "divider" },
    {
      type: "input",
      block_id: "went_well_block",
      label: { type: "plain_text", text: "What went well?" },
      element: {
        type: "plain_text_input",
        action_id: "went_well",
        multiline: true,
        placeholder: {
          type: "plain_text",
          text: "Share positive highlights...",
        },
      },
    },
    {
      type: "input",
      block_id: "went_wrong_block",
      label: { type: "plain_text", text: "What didn't go well?" },
      element: {
        type: "plain_text_input",
        action_id: "went_wrong",
        multiline: true,
        placeholder: {
          type: "plain_text",
          text: "Share areas for improvement...",
        },
      },
    },
    {
      type: "input",
      block_id: "action_items_block",
      label: { type: "plain_text", text: "Action Items" },
      element: {
        type: "plain_text_input",
        action_id: "action_items",
        multiline: true,
        placeholder: {
          type: "plain_text",
          text: "List next steps or improvements...",
        },
      },
    },
    { type: "divider" },
    {
      type: "input",
      block_id: "mood_block",
      label: { type: "plain_text", text: "Team Mood" },
      element: {
        type: "radio_buttons",
        action_id: "team_mood",
        options: MOOD_OPTIONS,
      },
    },
    {
      type: "input",
      block_id: "categories_block",
      label: { type: "plain_text", text: "Focus Areas" },
      element: {
        type: "checkboxes",
        action_id: "categories",
        options: CATEGORY_OPTIONS,
      },
      optional: true,
    },
    { type: "divider" },
    {
      type: "input",
      block_id: "dm_summary_block",
      label: { type: "plain_text", text: "Personal Copy" },
      element: {
        type: "checkboxes",
        action_id: "dm_summary",
        options: [
          {
            text: {
              type: "plain_text",
              text: "Send me a copy of my responses",
            },
            value: "send_copy",
          },
        ],
      },
      optional: true,
    },
  ],
});

/**
 * Opens the retrospective modal when the global shortcut is triggered.
 * @param {object} args - Bolt shortcut callback arguments.
 * @param {Function} args.ack - Acknowledge the shortcut request.
 * @param {import('@slack/bolt').WebClient} args.client - Slack Web API client.
 * @param {object} args.shortcut - The shortcut payload.
 * @param {object} args.logger - Bolt logger instance.
 */
export const startRetroCallback = async ({ ack, client, shortcut, logger }) => {
  await ack();

  try {
    await client.views.open({
      trigger_id: shortcut.trigger_id,
      view: buildRetroModal(),
    });
  } catch (error) {
    logger.error("Failed to open retro modal", error);
  }
};
