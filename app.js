import { App, LogLevel } from "@slack/bolt";
import { config } from "dotenv";
import {
  discoverRetroChannel,
  setBotUserId,
} from "./listeners/channel-store.js";
import { registerListeners } from "./listeners/index.js";

config();

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  logLevel: process.env.LOG_LEVEL === "debug" ? LogLevel.DEBUG : LogLevel.INFO,
});

registerListeners(app);

(async () => {
  try {
    await app.start();
  } catch (error) {
    app.logger.error("Failed to start the app", error);
    process.exit(1);
  }

  try {
    const authResult = await app.client.auth.test();
    if (!authResult.user_id) {
      throw new Error("auth.test did not return a valid user_id");
    }
    setBotUserId(authResult.user_id);
  } catch (error) {
    app.logger.error(
      "Failed to resolve bot user ID — auto-channel discovery is disabled",
      error,
    );
  }

  await discoverRetroChannel(app.client, app.logger);

  app.logger.info("Bolt app is running!");
})();
