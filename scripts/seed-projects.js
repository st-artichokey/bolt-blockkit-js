import dotenv from "dotenv";
import { WebClient } from "@slack/web-api";

dotenv.config();

const PROJECTS = [
  {
    channel: "proj-aurora-v2",
    topic: "Mobile app rewrite — React Native | Sprint 6 | Ship date: May 15",
    canvasTitle: "Aurora Project Hub",
    canvasMarkdown: `# Project Aurora — Mobile App Rewrite

## Overview
Full rewrite of the legacy iOS/Android apps into a single React Native codebase. Goal is feature parity by May 15 with 40% less code and a unified CI pipeline.

## Team
- **Tech Lead:** Sarah Chen
- **iOS:** Marcus Rivera, Priya Patel
- **Android:** James Okafor
- **Design:** Lena Kowalski
- **QA:** Tomás Herrera

## Architecture
- **Framework:** React Native 0.76 with New Architecture (Fabric + TurboModules)
- **State:** Zustand + React Query for server state
- **Navigation:** React Navigation 7 (native stack)
- **CI/CD:** GitHub Actions → EAS Build → TestFlight / Play Console
- **Monitoring:** Sentry for crashes, Datadog RUM for performance

## Current Sprint Goals (Sprint 6)
- [ ] Finish offline sync for saved items
- [ ] Push notification deep linking (all 12 routes)
- [ ] Performance budget: cold start < 2s on Pixel 6
- [ ] Migrate remaining 3 screens from legacy bridge

## Key Decisions
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-10 | Zustand over Redux | Less boilerplate, team already familiar, sufficient for our state complexity |
| 2026-03-18 | Skip Expo, use bare workflow | Need native modules for BLE and NFC that Expo doesn't support |
| 2026-04-02 | React Query for API layer | Automatic cache invalidation + optimistic updates out of the box |
| 2026-04-10 | Ship Android first | Play Console review is faster; iOS can follow 3 days later |
`,
    messages: [
      "Good morning team! :sunrise: Standup thread below — drop your update as a reply",
      ":white_check_mark: Offline sync PR is up: `aurora/#247`. Needs review from someone familiar with the SQLite layer. Tests are green but I want a second pair of eyes on the conflict resolution logic.",
      "Heads up — React Native 0.76.1 dropped yesterday with a fix for the Fabric crash we've been hitting on Android 12. I'll bump the version in a separate PR today.",
      ":rotating_light: Found a regression in push notification deep linking. Routes to the profile tab are landing on the home tab instead. Investigating — likely a navigation state issue.",
      "Deep link bug was a missing `getId` param in the profile stack navigator. Fix is in `aurora/#251`, one-liner. @Tomás can you smoke test on both platforms?",
      ":chart_with_upwards_trend: Performance update: cold start is at 1.8s on Pixel 6 and 1.6s on iPhone 14. We're under budget! :tada:",
      "Design sync notes: Lena is updating the empty states for saved items and notifications. New illustrations dropping in Figma by EOD Wednesday.",
      ":ship: Android build `6.0.0-beta.4` is on the Play Console internal track. QA team — please hammer offline mode and deep links this round.",
    ],
  },
  {
    channel: "proj-beacon-v2",
    topic: "Internal developer platform & CLI | v2.0 beta | DX team",
    canvasTitle: "Beacon Project Hub",
    canvasMarkdown: `# Project Beacon — Developer Platform CLI

## Overview
Building "Beacon" — an internal CLI and web dashboard that unifies service creation, deployment, observability, and incident management. Replaces 6 separate tools with one opinionated workflow.

## Team
- **Tech Lead:** Alex Nguyen
- **Backend:** Fatima Al-Hassan, Derek Kim
- **Frontend:** Yuki Tanaka
- **Platform:** Chris Okonkwo
- **PM:** Rachel Goldstein

## Architecture
- **CLI:** Go binary, distributed via Homebrew tap + internal artifact registry
- **API:** Go + gRPC, deployed on Kubernetes
- **Dashboard:** Next.js 15, deployed on Vercel (internal)
- **Auth:** SSO via Okta OIDC, short-lived tokens stored in OS keychain
- **Plugin system:** WASM-based plugins for team-specific extensions

## Current Sprint Goals (Sprint 4)
- [ ] \`beacon deploy\` — canary deployment with automatic rollback
- [ ] Dashboard: real-time deploy progress via SSE
- [ ] Plugin SDK: publish v0.1 with docs and 2 example plugins
- [ ] Migrate oncall rotation from PagerDuty scripts to \`beacon oncall\`

## Key Decisions
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-02-20 | Go over Rust for CLI | Faster compilation, team expertise, good enough performance for our use case |
| 2026-03-05 | WASM plugins over shared libraries | Sandboxed execution, language-agnostic, no ABI compatibility headaches |
| 2026-03-22 | gRPC over REST for internal API | Strong typing, streaming support for deploy logs, code generation |
| 2026-04-08 | OS keychain for token storage | More secure than dotfiles, native support on macOS/Linux/WSL |
`,
    messages: [
      ":wave: Sprint 4 kickoff! Focus areas: canary deploys, dashboard SSE, and plugin SDK. Let's ship a beta by Friday.",
      "The `beacon deploy --canary` flag is working locally. It spins up a canary pod, routes 5% of traffic, monitors error rate for 10 minutes, then promotes or rolls back. PR: `beacon/#189`.",
      ":thinking_face: Question for the group: should `beacon oncall` pull from PagerDuty's API or should we build our own schedule storage? PD API has rate limits that might bite us.",
      "Consensus from the thread: use PagerDuty as source of truth but cache schedules locally with a 5-minute TTL. Avoids rate limits and works offline. @Derek can you own this?",
      ":package: Plugin SDK v0.1 is published to the internal registry. Docs are at beacon.internal/plugins. The example plugins are a deploy notifier (Slack webhook) and a cost estimator (pulls from AWS CUR).",
      ":bug: Found a token refresh race condition — if two CLI commands run concurrently, both try to refresh and one gets a 401. Fix: file-based lock during refresh. PR `beacon/#195`.",
      "Dashboard SSE is live on staging. You can watch deploys in real time now — canary percentage, error rate, and pod health all stream in. Demo at 3pm in #dx-demos if anyone wants to see it.",
      ":tada: 47 internal engineers used Beacon this week, up from 12 last week. Top command: `beacon deploy` (68 invocations). The word is spreading!",
    ],
  },
  {
    channel: "proj-cascade-v2",
    topic: "Data pipeline migration — Kafka → Flink | Phase 2 | Data eng",
    canvasTitle: "Cascade Project Hub",
    canvasMarkdown: `# Project Cascade — Data Pipeline Migration

## Overview
Migrating the real-time data pipeline from a custom Kafka Streams topology to Apache Flink. Goal: 10x throughput, exactly-once processing, and unified batch/stream with Flink SQL. Phase 2 focuses on the customer events pipeline (highest volume).

## Team
- **Tech Lead:** Wei Zhang
- **Data Eng:** Amara Osei, Pavel Novak, Sofia Martinez
- **Infra:** Ben Larsson
- **Analytics:** Nadia Petrova

## Architecture
- **Processing:** Apache Flink 1.19 on Kubernetes (native mode)
- **Source/Sink:** Kafka (MSK) → Flink → Iceberg tables on S3
- **Orchestration:** Flink's built-in checkpointing + custom K8s operator
- **Schema:** Confluent Schema Registry (Avro), evolving to Protobuf
- **Monitoring:** Prometheus + Grafana, Flink native metrics

## Current Phase Goals (Phase 2)
- [ ] Customer events pipeline: Kafka → Flink → Iceberg (300k events/sec target)
- [ ] Exactly-once semantics with Flink checkpoints + Kafka transactions
- [ ] Backfill 90 days of historical data via Flink batch mode
- [ ] Decommission old Kafka Streams consumer group
- [ ] Latency SLA: p99 < 500ms from event ingestion to Iceberg commit

## Key Decisions
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-01-15 | Flink over Spark Structured Streaming | True stream-native, lower latency, better state management, Flink SQL is more mature |
| 2026-02-10 | Iceberg over Delta Lake | Open standard, engine-agnostic, better partition evolution, no vendor lock-in |
| 2026-03-01 | Avro → Protobuf migration | Better backwards compatibility, smaller payload, native Flink support |
| 2026-04-05 | Kubernetes native mode over YARN | Aligns with company infra direction, better autoscaling, simpler ops |
`,
    messages: [
      ":ocean: Phase 2 officially started. Customer events pipeline is the big one — 300k events/sec at peak. Let's make sure our Flink cluster sizing is right before we cut over.",
      "Ran a load test overnight: Flink handled 450k events/sec with 3 TaskManagers (8 slots each). Checkpointing every 30 seconds, p99 latency at 280ms. We have plenty of headroom. :muscle:",
      ":warning: Schema Registry is showing intermittent 503s under load. Ben is investigating — might need to scale the registry pods. Not blocking yet but we should fix before cutover.",
      "Schema Registry issue was a JVM heap limit. Bumped from 512MB to 2GB, no more 503s. Added a Grafana alert for registry heap usage > 80%.",
      "Backfill job is running — processing 90 days of historical data through Flink batch mode. ETA ~6 hours for 2.1 billion events. Iceberg is compacting nicely, table size tracking as expected.",
      ":white_check_mark: Backfill complete! 2.1B events, zero data loss. Ran a reconciliation query comparing old and new tables — row counts match within 0.001% (timestamp edge cases at partition boundaries, known and acceptable).",
      "Exactly-once semantics verified: injected 1000 duplicate events with the same Kafka offset. Flink deduped all of them via checkpoint barriers. The Iceberg sink shows exactly 1000 rows, not 2000. :chefs_kiss:",
      ":calendar: Cutover plan for next Tuesday: 1) Enable dual-write (old + new pipeline) at 9am. 2) Monitor for 4 hours. 3) Disable old consumer group at 1pm. 4) Decommission old topology by EOW. Runbook in the canvas.",
    ],
  },
];

async function main() {
  const client = new WebClient(process.env.SLACK_BOT_TOKEN);

  const auth = await client.auth.test();
  console.log(`Authenticated as: ${auth.user} (${auth.user_id})\n`);

  for (const project of PROJECTS) {
    console.log(`--- Setting up #${project.channel} ---`);

    // Create channel
    let channelId;
    try {
      const created = await client.conversations.create({
        name: project.channel,
        is_private: false,
      });
      channelId = created.channel.id;
      console.log(`  Created channel: ${channelId}`);
    } catch (error) {
      if (error.data?.error === "name_taken") {
        // Channel already exists — find it and join
        const list = await client.conversations.list({
          types: "public_channel",
          limit: 1000,
        });
        const existing = list.channels.find((c) => c.name === project.channel);
        if (!existing) throw new Error(`Channel ${project.channel} exists but couldn't find it`);
        channelId = existing.id;
        await client.conversations.join({ channel: channelId });
        console.log(`  Reusing existing channel: ${channelId}`);
      } else {
        throw error;
      }
    }

    // Set topic
    await client.conversations.setTopic({
      channel: channelId,
      topic: project.topic,
    });
    console.log(`  Set topic`);

    // Post messages
    for (const text of project.messages) {
      await client.chat.postMessage({ channel: channelId, text });
    }
    console.log(`  Posted ${project.messages.length} messages`);

    // Create canvas
    const canvas = await client.conversations.canvases.create({
      channel_id: channelId,
      title: project.canvasTitle,
      document_content: { type: "markdown", markdown: project.canvasMarkdown },
    });
    console.log(`  Created canvas: "${project.canvasTitle}" (${canvas.canvas_id})`);

    console.log();
  }

  console.log("Done! All 3 project channels are ready.");
}

main().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
