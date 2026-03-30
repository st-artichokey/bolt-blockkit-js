/**
 * Publishes the App Home tab with retrospective instructions and recent entries.
 * Only fires for the "home" tab; other tabs are ignored.
 * @param {object} args - Bolt event callback arguments.
 * @param {import('@slack/bolt').WebClient} args.client - Slack Web API client.
 * @param {object} args.event - The app_home_opened event payload.
 * @param {object} args.logger - Bolt logger instance.
 */
const appHomeOpenedCallback = async ({ client, event, logger }) => {
  if (event.tab !== "home") return;

  try {
    await client.views.publish({
      user_id: event.user,
      view: {
        type: "home",
        blocks: [
          {
            type: "header",
            text: { type: "plain_text", text: "Team Retrospectives" },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "Collect and review team feedback using interactive Block Kit forms.",
            },
          },
          { type: "divider" },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: [
                "*How to start a retro:*",
                "",
                "1. Use the global shortcut *Start Retrospective* (search in the shortcuts menu)",
                "2. Fill out the form with your sprint feedback",
                "3. A summary is posted to the retro channel for the team to review",
              ].join("\n"),
            },
          },
          { type: "divider" },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: [
                "*Block Kit elements demonstrated:*",
                "",
                ":small_blue_diamond: Plain-text inputs (single & multi-line)",
                ":small_blue_diamond: Static select menus",
                ":small_blue_diamond: Datepicker",
                ":small_blue_diamond: Radio buttons",
                ":small_blue_diamond: Checkboxes",
                ":small_blue_diamond: Modals with submission handling",
                ":small_blue_diamond: Header, section, divider, and context blocks",
                ":small_blue_diamond: Actions block with buttons and overflow menus",
                ":small_blue_diamond: Chained modals (Add Comment)",
              ].join("\n"),
            },
          },
          { type: "divider" },
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: "Built with :slack: Bolt for JavaScript and Block Kit",
              },
            ],
          },
        ],
      },
    });
  } catch (error) {
    logger.error(error);
  }
};

export { appHomeOpenedCallback };
