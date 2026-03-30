import { App, LogLevel } from "@slack/bolt";
import { config } from "dotenv";
import { setBotUserId } from "./listeners/channel-store.js";
import { registerListeners } from "./listeners/index.js";

config();

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  logLevel: LogLevel.DEBUG,
});

registerListeners(app);

(async () => {
  try {
    await app.start();
    const authResult = await app.client.auth.test();
    setBotUserId(authResult.user_id);
    app.logger.info("Bolt app is running!");
  } catch (error) {
    app.logger.error("Failed to start the app", error);
  }
})();
