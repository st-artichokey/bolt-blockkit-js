import { startRetroHomeCallback } from "./retro-actions.js";

/**
 * Registers all action listeners.
 * @param {import('@slack/bolt').App} app - The Bolt app instance.
 * @returns {void}
 */
export const register = (app) => {
  app.action("start_retro_home", startRetroHomeCallback);
};
