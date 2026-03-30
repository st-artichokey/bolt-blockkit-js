/**
 * Publishes the App Home tab with retrospective instructions.
 * Only fires for the "home" tab; other tabs are ignored.
 * @param {object} args - Bolt event callback arguments.
 * @param {import('@slack/bolt').WebClient} args.client - Slack Web API client.
 * @param {object} args.event - The app_home_opened event payload.
 * @param {object} args.logger - Bolt logger instance.
 */
const appHomeOpenedCallback = async ({ client, event, logger }) => {
  if (event.tab !== "home") return;

  const channelId = process.env.RETRO_CHANNEL_ID;
  let hasChannelAccess = false;

  if (channelId) {
    try {
      await client.conversations.history({
        channel: channelId,
        limit: 1,
      });
      hasChannelAccess = true;
    } catch {
      hasChannelAccess = false;
    }
  }

  const blocks = [
    {
      type: "header",
      text: { type: "plain_text", text: "Team Retrospectives" },
    },
  ];

  if (hasChannelAccess) {
    blocks.push(
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `Hey <@${event.user}>! Collect and review team feedback using interactive retrospective forms.`,
        },
      },
      { type: "divider" },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: { type: "plain_text", text: "Start Retrospective" },
            action_id: "start_retro_home",
            style: "primary",
          },
        ],
      },
      { type: "divider" },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: [
            "*How it works:*",
            "",
            '1. Click *Start Retrospective* above — or search "Start Retrospective" in the shortcuts menu (the lightning bolt icon)',
            "2. Fill out the form with your sprint feedback",
            "3. Your responses are saved to the retro channel canvas for the team to review",
          ].join("\n"),
        },
      },
      { type: "divider" },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `View all retrospectives in the <slack://channel?team=&id=${channelId}|retro channel> canvas.`,
        },
      },
    );
  } else {
    blocks.push(
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "Collect and review team feedback using interactive retrospective forms.",
        },
      },
      { type: "divider" },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: [
            "*How it works:*",
            "",
            '1. Search "Start Retrospective" in the shortcuts menu (the lightning bolt icon)',
            "2. Fill out the form with your sprint feedback",
            "3. Your responses are saved to the retro channel canvas for the team to review",
          ].join("\n"),
        },
      },
      { type: "divider" },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "To get started, ask a workspace admin to configure RetroRun with a retrospective channel.",
        },
      },
    );
  }

  blocks.push(
    { type: "divider" },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "*Need help?*\nVisit our <https://github.com/st-artichokey/retrorun|support page> for documentation and to report issues.",
      },
    },
    { type: "divider" },
    {
      type: "context",
      elements: [{ type: "mrkdwn", text: "This app is free to use." }],
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: "This app uses AI-assisted automation to help facilitate retrospectives.",
        },
      ],
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: "Built with Bolt for JavaScript and Block Kit",
        },
      ],
    },
  );

  try {
    await client.views.publish({
      user_id: event.user,
      view: { type: "home", blocks },
    });
  } catch (error) {
    logger.error(error);
  }
};

export { appHomeOpenedCallback };
