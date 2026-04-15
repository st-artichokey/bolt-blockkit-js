import dotenv from "dotenv";
import { WebClient } from "@slack/web-api";
import {
  buildDateHeading,
  buildRetroEntry,
} from "../listeners/views/retro-submit.js";

dotenv.config();

const SUBMISSIONS = [
  {
    date: "2026-04-01",
    retros: [
      {
        title: "Sprint 10 Retro — Frontend",
        sprint: "Sprint 10",
        date: "2026-04-01",
        wentWell: "Migrated 4 legacy pages to the new design system. Zero visual regressions caught in QA.",
        wentWrong: "Storybook builds were broken for 2 days and nobody noticed.",
        actionItems: "Add Storybook build check to CI. Rotate Storybook ownership weekly.",
        mood: "great",
        categories: ["Tooling", "Process"],
      },
      {
        title: "Sprint 10 Retro — Backend",
        sprint: "Sprint 10",
        date: "2026-04-01",
        wentWell: "API response times improved 35% after query optimization sprint.",
        wentWrong: "Rate limiter was too aggressive — blocked legitimate batch import requests.",
        actionItems: "Add per-client rate limit tiers. Document rate limit configuration.",
        mood: "ok",
        categories: ["Process", "Communication"],
      },
    ],
  },
  {
    date: "2026-04-08",
    retros: [
      {
        title: "Sprint 11 Retro",
        sprint: "Sprint 11",
        date: "2026-04-08",
        wentWell: "Shipped the new search feature on time. Customer feedback has been overwhelmingly positive.",
        wentWrong: "Search indexing job timed out twice during peak hours. Had to manually restart.",
        actionItems: "Increase timeout for indexing jobs. Add circuit breaker for peak load.",
        mood: "great",
        categories: ["Team Dynamics", "Tooling"],
      },
      {
        title: "Sprint 11 Retro — Infrastructure",
        sprint: "Sprint 11",
        date: "2026-04-08",
        wentWell: "Terraform modules are fully tested now. Infrastructure changes go through PR review.",
        wentWrong: "DNS propagation delay caused 20 minutes of downtime during the cutover.",
        actionItems: "Pre-warm DNS changes 24h before cutover. Add DNS health check to monitoring.",
        mood: "tough",
        categories: ["Process", "Tooling"],
      },
      {
        title: "Sprint 11 Retro — QA",
        sprint: "Sprint 11",
        date: "2026-04-08",
        wentWell: "Caught a critical auth bypass during manual testing that automated tests missed.",
        wentWrong: "Test environment was down for half a day — blocked all QA work.",
        actionItems: "Dedicated test environment with its own DB. Auto-restart on health check failure.",
        mood: "ok",
        categories: ["Tooling"],
      },
    ],
  },
  {
    date: "2026-04-15",
    retros: [
      {
        title: "Sprint 12 Retro",
        sprint: "Sprint 12",
        date: "2026-04-15",
        wentWell: "All sprint goals completed. Team velocity is the highest it's been in 3 months.",
        wentWrong: "Two PRs sat in review for 4 days. Bottleneck was a single senior reviewer.",
        actionItems: "Require 1 review instead of 2 for small PRs. Expand reviewer pool.",
        mood: "great",
        categories: ["Communication", "Process", "Team Dynamics"],
      },
    ],
  },
];

/**
 * Writes a retro entry to the channel canvas using the same API flow
 * as the real app: lookup canvas → find date section → insert.
 */
async function writeRetroToCanvas(client, channelId, canvasId, retro, botUserId) {
  const entry = buildRetroEntry(retro, botUserId);

  // Look up existing date heading
  const { sections } = await client.canvases.sections.lookup({
    canvas_id: canvasId,
    criteria: { section_types: ["h1"], contains_text: retro.date },
  });

  const dateSection = sections?.[0];
  if (dateSection) {
    // Date heading exists — insert entry after it
    await client.canvases.edit({
      canvas_id: canvasId,
      changes: [
        {
          operation: "insert_after",
          section_id: dateSection.id,
          document_content: { type: "markdown", markdown: entry },
        },
      ],
    });
  } else {
    // No date heading — insert date + entry at the top
    await client.canvases.edit({
      canvas_id: canvasId,
      changes: [
        {
          operation: "insert_at_start",
          document_content: {
            type: "markdown",
            markdown: buildDateHeading(retro.date) + entry,
          },
        },
      ],
    });
  }
}

async function main() {
  const client = new WebClient(process.env.SLACK_BOT_TOKEN);

  const auth = await client.auth.test();
  const botUserId = auth.user_id;
  console.log(`Bot user: ${auth.user} (${botUserId})\n`);

  // Discover retro channel
  const { channels } = await client.users.conversations({
    types: "public_channel",
    exclude_archived: true,
  });

  if (!channels || channels.length === 0) {
    console.error("Bot is not in any channels. Invite it first with /invite @RetroRun");
    process.exit(1);
  }

  const channel = channels[0];
  console.log(`Retro channel: #${channel.name} (${channel.id})`);

  // Check for existing canvas or create one
  const info = await client.conversations.info({ channel: channel.id });
  let canvasId = info.channel?.properties?.canvas?.canvas_id;

  if (canvasId) {
    console.log(`Using existing canvas: ${canvasId}`);
  } else {
    // Create canvas with first submission
    const firstGroup = SUBMISSIONS[0];
    const firstRetro = firstGroup.retros[0];
    const markdown =
      buildDateHeading(firstRetro.date) + buildRetroEntry(firstRetro, botUserId);

    const result = await client.conversations.canvases.create({
      channel_id: channel.id,
      title: "Retro Canvas",
      document_content: { type: "markdown", markdown },
    });
    canvasId = result.canvas_id;
    console.log(`Created "Retro Canvas": ${canvasId}`);
    console.log(`  [1] ${firstRetro.title} (${firstRetro.date})`);

    // Remove the first retro from the list since we already wrote it
    firstGroup.retros = firstGroup.retros.slice(1);
  }

  // Submit remaining retros one by one, exercising the lookup + insert flow
  let count = 0;
  for (const group of SUBMISSIONS) {
    for (const retro of group.retros) {
      await writeRetroToCanvas(client, channel.id, canvasId, retro, botUserId);
      count++;
      console.log(`  [${count}] ${retro.title} (${retro.date})`);
    }
  }

  console.log(`\nDone! Wrote ${count} retro entries sequentially to canvas ${canvasId}.`);
}

main().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
