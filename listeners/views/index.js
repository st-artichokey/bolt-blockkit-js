import { retroSubmitCallback } from "./retro-submit.js";

/**
 * Registers all view submission listeners.
 * @param {import('@slack/bolt').App} app - The Bolt app instance.
 */
export const register = (app) => {
  app.view("retro_submit", retroSubmitCallback);
};
