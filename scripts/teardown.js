import dotenv from "dotenv";
import { WebClient } from "@slack/web-api";

dotenv.config();

const PROJECT_CHANNELS = ["proj-aurora-v2", "proj-beacon-v2", "proj-cascade-v2"];

/**
 * Deletes all bot messages from a channel and removes the channel canvas.
 */
async function cleanChannel(client, channelId, channelName, botUserId) {
  // Delete channel canvas if present
  try {
    const info = await client.conversations.info({ channel: channelId });
    const canvasId = info.channel?.properties?.canvas?.canvas_id;
    if (canvasId) {
      await client.canvases.delete({ canvas_id: canvasId });
      console.log(`  Deleted canvas: ${canvasId}`);
    }
  } catch (error) {
    console.log(`  Could not clean canvas: ${error.message}`);
  }

  // Delete bot messages from the channel
  let deleted = 0;
  try {
    const history = await client.conversations.history({
      channel: channelId,
      limit: 100,
    });
    for (const msg of history.messages || []) {
      if (msg.bot_id || msg.user === botUserId) {
        try {
          await client.chat.delete({ channel: channelId, ts: msg.ts });
          deleted++;
        } catch {
          // Can't delete some messages (e.g. system messages) — skip
        }
      }
    }
  } catch (error) {
    console.log(`  Could not clean messages: ${error.message}`);
  }

  if (deleted > 0) {
    console.log(`  Deleted ${deleted} messages`);
  }
}

async function main() {
  const client = new WebClient(process.env.SLACK_BOT_TOKEN);

  const auth = await client.auth.test();
  const botUserId = auth.user_id;
  console.log(`Authenticated as: ${auth.user} (${botUserId})\n`);

  // Clean project channels
  const { channels } = await client.conversations.list({
    types: "public_channel",
    exclude_archived: false,
    limit: 1000,
  });

  for (const name of PROJECT_CHANNELS) {
    const channel = channels.find((c) => c.name === name);
    if (!channel) {
      console.log(`#${name} — not found, skipping`);
      continue;
    }
    if (channel.is_archived) {
      console.log(`#${name} — archived, skipping (delete manually in Slack)`);
      continue;
    }
    console.log(`#${name} (${channel.id}):`);
    await cleanChannel(client, channel.id, name, botUserId);
  }

  // Clean retro channel canvas
  const { channels: botChannels } = await client.users.conversations({
    types: "public_channel",
    exclude_archived: true,
  });

  if (botChannels && botChannels.length > 0) {
    const retroChannel = botChannels[0];
    console.log(`\n#${retroChannel.name} (retro channel, ${retroChannel.id}):`);
    await cleanChannel(client, retroChannel.id, retroChannel.name, botUserId);
  } else {
    console.log("\nBot is not in any channels — no retro canvas to clean up");
  }

  console.log("\nTeardown complete. Run seed scripts to recreate content.");
}

main().catch((err) => {
  console.error("Teardown failed:", err.message);
  process.exit(1);
});
