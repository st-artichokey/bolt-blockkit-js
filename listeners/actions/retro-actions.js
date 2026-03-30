import { buildRetroModal } from "../shortcuts/start-retro.js";

/**
 * Opens the retrospective modal from the App Home "Start Retrospective" button.
 * Reuses the same modal as the global shortcut.
 * @param {object} args - Bolt action callback arguments.
 * @param {Function} args.ack - Acknowledge the action.
 * @param {import('@slack/bolt').WebClient} args.client - Slack Web API client.
 * @param {object} args.body - The full request body.
 * @param {object} args.logger - Bolt logger instance.
 */
export const startRetroHomeCallback = async ({ ack, client, body, logger }) => {
  await ack();

  try {
    await client.views.open({
      trigger_id: body.trigger_id,
      view: buildRetroModal(),
    });
  } catch (error) {
    logger.error("Failed to open retro modal from home", error);
  }
};
