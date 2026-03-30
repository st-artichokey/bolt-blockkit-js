import * as actions from "./actions/index.js";
import * as events from "./events/index.js";
import * as shortcuts from "./shortcuts/index.js";
import * as views from "./views/index.js";

/**
 * Top-level registration entry point. Delegates to each listener category.
 * @param {import('@slack/bolt').App} app - The Bolt app instance.
 */
export const registerListeners = (app) => {
  events.register(app);
  shortcuts.register(app);
  views.register(app);
  actions.register(app);
};
