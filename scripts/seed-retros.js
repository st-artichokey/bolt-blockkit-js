import dotenv from "dotenv";
import { WebClient } from "@slack/web-api";
import { buildDateHeading, buildRetroEntry } from "../listeners/views/retro-submit.js";

dotenv.config();

const DUMMY_RETROS = [
  {
    title: "Sprint 12 Retro",
    sprint: "Sprint 12",
    date: "2026-04-01",
    wentWell: "Shipped the new onboarding flow ahead of schedule. QA caught zero regressions.",
    wentWrong: "Deployment pipeline was flaky — two rollbacks in one week.",
    actionItems: "Add canary deploys to staging. Pair with platform team on CI reliability.",
    mood: "great",
    categories: ["Process", "Tooling"],
  },
  {
    title: "Sprint 12 Retro — Design",
    sprint: "Sprint 12",
    date: "2026-04-01",
    wentWell: "Design reviews were fast and actionable. New component library is paying off.",
    wentWrong: "Handoff docs were incomplete for the settings page redesign.",
    actionItems: "Template for design handoff docs. Schedule mid-sprint check-ins.",
    mood: "ok",
    categories: ["Communication", "Process"],
  },
  {
    title: "Sprint 12 Retro — Backend",
    sprint: "Sprint 12",
    date: "2026-04-01",
    wentWell: "Database migration ran in under 30 seconds with zero downtime.",
    wentWrong: "Cache invalidation bug caused stale data for ~15 minutes.",
    actionItems: "Add cache-bust integration tests. Document invalidation strategy.",
    mood: "ok",
    categories: ["Tooling", "Team Dynamics"],
  },
  {
    title: "Sprint 13 Retro",
    sprint: "Sprint 13",
    date: "2026-04-08",
    wentWell: "Cross-team pairing sessions boosted knowledge sharing. Morale felt high.",
    wentWrong: "Scope creep on the notifications feature — missed the sprint goal by two stories.",
    actionItems: "Stricter scope lock after sprint planning. PO to triage mid-sprint requests.",
    mood: "ok",
    categories: ["Process", "Communication"],
  },
  {
    title: "Sprint 13 Retro — Frontend",
    sprint: "Sprint 13",
    date: "2026-04-08",
    wentWell: "Accessibility audit passed on first attempt. Screen reader testing was thorough.",
    wentWrong: "Bundle size grew 12% — no one noticed until staging.",
    actionItems: "Add bundle size check to CI. Set a 250KB budget for main chunk.",
    mood: "great",
    categories: ["Tooling", "Process"],
  },
  {
    title: "Sprint 13 Retro — Platform",
    sprint: "Sprint 13",
    date: "2026-04-08",
    wentWell: "New logging pipeline reduced p99 query time from 8s to 200ms.",
    wentWrong: "Alert fatigue — too many low-priority pages overnight.",
    actionItems: "Review alert thresholds. Consolidate noisy monitors into a digest.",
    mood: "tough",
    categories: ["Tooling", "Team Dynamics"],
  },
  {
    title: "Sprint 14 Retro",
    sprint: "Sprint 14",
    date: "2026-04-15",
    wentWell: "Delivered all sprint goals. Standups were focused and under 10 minutes.",
    wentWrong: "Code review turnaround was slow — average 2 days.",
    actionItems: "Set 24-hour SLA for first review. Rotate review buddies weekly.",
    mood: "great",
    categories: ["Communication", "Process", "Team Dynamics"],
  },
  {
    title: "Sprint 14 Retro — QA",
    sprint: "Sprint 14",
    date: "2026-04-15",
    wentWell: "Test automation coverage hit 80%. Manual regression suite cut in half.",
    wentWrong: "Flaky e2e test blocked the release for 3 hours.",
    actionItems: "Quarantine flaky tests. Add retry logic for network-dependent specs.",
    mood: "ok",
    categories: ["Tooling"],
  },
];

const DATES = ["2026-04-01", "2026-04-08", "2026-04-15"];

async function main() {
  const client = new WebClient(process.env.SLACK_BOT_TOKEN);

  // Resolve bot user ID for attribution
  const auth = await client.auth.test();
  const botUserId = auth.user_id;
  console.log(`Bot user: ${botUserId}`);

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
  console.log(`Target channel: #${channel.name} (${channel.id})`);

  // Build all content grouped by date
  let markdown = "";
  for (const date of DATES) {
    const entries = DUMMY_RETROS.filter((r) => r.date === date);
    markdown += buildDateHeading(date);
    for (const retro of entries) {
      markdown += buildRetroEntry(retro, botUserId);
    }
  }

  // Create the canvas
  const result = await client.conversations.canvases.create({
    channel_id: channel.id,
    title: "Retro Canvas",
    document_content: { type: "markdown", markdown },
  });

  console.log(`Created "Retro Canvas" (${result.canvas_id}) in #${channel.name}`);
  console.log(`  ${DUMMY_RETROS.length} entries across ${DATES.length} dates`);
}

main().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
