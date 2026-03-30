import { appHomeOpenedCallback } from "./app-home-opened.js";

/**
 * Registers all event listeners.
 * @param {import('@slack/bolt').App} app - The Bolt app instance.
 */
export const register = (app) => {
  app.event("app_home_opened", appHomeOpenedCallback);
};
