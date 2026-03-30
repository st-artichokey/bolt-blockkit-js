import { addCommentCallback, retroOverflowCallback } from "./retro-actions.js";

/**
 * Registers all action listeners.
 * @param {import('@slack/bolt').App} app - The Bolt app instance.
 */
export const register = (app) => {
  app.action("add_comment", addCommentCallback);
  app.action("retro_overflow", retroOverflowCallback);
};
