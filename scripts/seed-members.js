import dotenv from "dotenv";
import { WebClient } from "@slack/web-api";

dotenv.config();

const PROJECT_CHANNELS = ["proj-aurora-v2", "proj-beacon-v2", "proj-cascade-v2"];

async function main() {
  const client = new WebClient(process.env.SLACK_BOT_TOKEN);

  const auth = await client.auth.test();
  const botUserId = auth.user_id;
  console.log(`Bot user: ${auth.user} (${botUserId})\n`);

  // Look up all public channels
  const { channels } = await client.conversations.list({
    types: "public_channel",
    exclude_archived: true,
    limit: 1000,
  });

  // Join project channels
  for (const name of PROJECT_CHANNELS) {
    const channel = channels.find((c) => c.name === name);
    if (!channel) {
      console.log(`#${name} — not found, skipping`);
      continue;
    }
    try {
      await client.conversations.join({ channel: channel.id });
      console.log(`#${name} — bot joined (${channel.id})`);
    } catch (error) {
      if (error.data?.error === "already_in_channel") {
        console.log(`#${name} — bot already a member`);
      } else {
        console.log(`#${name} — failed to join: ${error.message}`);
      }
    }
  }

  // Find or join the retro channel (first channel bot is in, or first non-project channel)
  const { channels: botChannels } = await client.users.conversations({
    types: "public_channel",
    exclude_archived: true,
  });

  if (botChannels && botChannels.length > 0) {
    const retroChannel = botChannels[0];
    console.log(`\nRetro channel: #${retroChannel.name} (${retroChannel.id}) — bot is a member`);
  } else {
    // Bot isn't in any channel — try to find one to join
    const nonProject = channels.find(
      (c) => !PROJECT_CHANNELS.includes(c.name) && !c.is_archived,
    );
    if (nonProject) {
      await client.conversations.join({ channel: nonProject.id });
      console.log(`\nJoined #${nonProject.name} as retro channel (${nonProject.id})`);
    } else {
      console.log("\nNo suitable retro channel found. Create one and invite the bot.");
    }
  }

  // List workspace members the bot can see (for reference)
  try {
    const { members } = await client.users.list({ limit: 50 });
    const humans = members.filter((m) => !m.is_bot && !m.deleted && m.id !== "USLACKBOT");
    console.log(`\nWorkspace has ${humans.length} active human members:`);
    for (const user of humans.slice(0, 10)) {
      console.log(`  @${user.name} (${user.id}) — ${user.real_name || "no display name"}`);
    }
    if (humans.length > 10) {
      console.log(`  ... and ${humans.length - 10} more`);
    }
  } catch (error) {
    console.log(`\nCould not list members: ${error.message}`);
    console.log("Add users:read scope to list workspace members.");
  }

  console.log("\nDone! Bot is set up in all channels.");
}

main().catch((err) => {
  console.error("Seed members failed:", err.message);
  process.exit(1);
});
