import { startRetroCallback } from "./start-retro.js";

/**
 * Registers all shortcut listeners.
 * @param {import('@slack/bolt').App} app - The Bolt app instance.
 * @returns {void}
 */
export const register = (app) => {
  app.shortcut("start_retro", startRetroCallback);
};
