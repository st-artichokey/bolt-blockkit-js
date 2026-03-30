/**
 * Handles the "Add Comment" modal submission. Posts the comment as a
 * thread reply to the original retro message.
 * @param {object} args - Bolt view submission callback arguments.
 * @param {Function} args.ack - Acknowledge the view submission.
 * @param {object} args.view - The submitted view payload.
 * @param {object} args.body - The full request body.
 * @param {import('@slack/bolt').WebClient} args.client - Slack Web API client.
 * @param {object} args.logger - Bolt logger instance.
 */
export const addCommentSubmitCallback = async ({
  ack,
  view,
  body,
  client,
  logger,
}) => {
  await ack();

  const comment = view.state.values.comment_block.comment_input.value;
  const metadata = JSON.parse(view.private_metadata || "{}");
  const userId = body.user.id;

  if (!metadata.channel || !metadata.message_ts) {
    logger.error("Missing metadata for comment thread reply");
    return;
  }

  try {
    await client.chat.postMessage({
      channel: metadata.channel,
      thread_ts: metadata.message_ts,
      text: comment,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Comment from <@${userId}>:*\n${comment}`,
          },
        },
      ],
    });
  } catch (error) {
    logger.error("Failed to post comment", error);
  }
};
