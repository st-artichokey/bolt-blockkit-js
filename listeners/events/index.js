import { appHomeOpenedCallback } from "./app-home-opened.js";
import { memberJoinedChannelCallback } from "./member-joined-channel.js";

/**
 * Registers all event listeners.
 * @param {import('@slack/bolt').App} app - The Bolt app instance.
 */
export const register = (app) => {
  app.event("app_home_opened", appHomeOpenedCallback);
  app.event("member_joined_channel", memberJoinedChannelCallback);
};
