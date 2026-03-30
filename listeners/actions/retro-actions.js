/**
 * Opens a modal for adding a comment to a retrospective thread.
 * Demonstrates chained modals — triggered from a button in a posted message.
 * @param {object} args - Bolt action callback arguments.
 * @param {Function} args.ack - Acknowledge the action.
 * @param {import('@slack/bolt').WebClient} args.client - Slack Web API client.
 * @param {object} args.body - The full request body.
 * @param {object} args.logger - Bolt logger instance.
 */
export const addCommentCallback = async ({ ack, client, body, logger }) => {
  await ack();

  const metadata = JSON.stringify({
    channel: body.channel?.id || body.container?.channel_id,
    message_ts: body.message?.ts || body.container?.message_ts,
  });

  try {
    await client.views.open({
      trigger_id: body.trigger_id,
      view: {
        type: "modal",
        callback_id: "add_comment_submit",
        private_metadata: metadata,
        title: { type: "plain_text", text: "Add Comment" },
        submit: { type: "plain_text", text: "Post" },
        close: { type: "plain_text", text: "Cancel" },
        blocks: [
          {
            type: "input",
            block_id: "comment_block",
            label: { type: "plain_text", text: "Your Comment" },
            element: {
              type: "plain_text_input",
              action_id: "comment_input",
              multiline: true,
              placeholder: { type: "plain_text", text: "Add your thoughts..." },
            },
          },
        ],
      },
    });
  } catch (error) {
    logger.error("Failed to open comment modal", error);
  }
};

/**
 * Handles overflow menu actions on retrospective messages.
 * @param {object} args - Bolt action callback arguments.
 * @param {Function} args.ack - Acknowledge the action.
 * @param {import('@slack/bolt').WebClient} args.client - Slack Web API client.
 * @param {object} args.body - The full request body.
 * @param {object} args.action - The action payload with selected_option.
 * @param {object} args.logger - Bolt logger instance.
 */
export const retroOverflowCallback = async ({
  ack,
  client,
  body,
  action,
  logger,
}) => {
  await ack();

  const selected = action.selected_option.value;
  const channel = body.channel?.id || body.container?.channel_id;
  const messageTs = body.message?.ts || body.container?.message_ts;

  if (!channel || !messageTs) {
    logger.error("Missing channel or message_ts for overflow action");
    return;
  }

  try {
    if (selected === "pin") {
      await client.pins.add({ channel, timestamp: messageTs });
    } else if (selected === "bookmark") {
      await client.chat.postMessage({
        channel: body.user.id,
        text: `:bookmark: You bookmarked a retrospective! Check it here: https://slack.com/archives/${channel}/p${messageTs.replace(".", "")}`,
      });
    }
  } catch (error) {
    logger.error(`Failed to handle overflow action: ${selected}`, error);
  }
};
