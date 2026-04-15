# Seed & Teardown Scripts

Scripts for setting up and tearing down a demo/test environment in your Slack workspace.

## Prerequisites

- Node.js installed
- `.env` file with `SLACK_BOT_TOKEN` configured
- Bot app installed in the workspace with required scopes (see `manifest.json`)

## Scripts

| Command | Script | Description |
|---------|--------|-------------|
| `npm run seed` | `seed-retros.js` | Creates a "Retro Canvas" in the retro channel with 8 dummy retro entries across 3 sprint dates |
| `npm run seed:projects` | `seed-projects.js` | Creates 3 project channels (`#proj-aurora-v2`, `#proj-beacon-v2`, `#proj-cascade-v2`) with topics, 8 messages each, and a project hub canvas |
| `npm run seed:members` | `seed-members.js` | Joins the bot to all project channels so the App Home shows the full-access view |
| `npm run seed:submissions` | `seed-retro-submissions.js` | Simulates sequential retro submissions that exercise the date-grouping and section-lookup canvas write flow |
| `npm run teardown` | `teardown.js` | Clears all bot messages and canvases from seeded channels |

## Recommended Setup Order

```bash
# 1. Create project channels with messages and canvases
npm run seed:projects

# 2. Join the bot to all project channels
npm run seed:members

# 3. Populate the retro channel canvas (bulk insert)
npm run seed

# 4. Or simulate sequential retro submissions (exercises real write flow)
npm run seed:submissions
```

## Resetting the Environment

```bash
# Clear all seeded content (messages + canvases), keeps channels intact
npm run teardown

# Then re-run any seed scripts as needed
npm run seed:projects
npm run seed
```

## Notes

- **Teardown clears content, not channels.** Channels are left active so they can be reused. Slack does not allow bot tokens to unarchive channels they've been removed from, so archiving is avoided.
- **`seed:submissions` vs `seed`:** The `seed` script bulk-creates a single canvas with all content at once. The `seed:submissions` script writes entries one at a time using the same API flow as the real app (`canvases.sections.lookup` + `canvases.edit`), which is better for testing the date-grouping logic.
- **Idempotent re-runs:** `seed:projects` handles both `name_taken` (channels) and `channel_canvas_already_exists` (canvases) so it can be re-run safely without teardown.
- **Rate limits:** Teardown deletes messages individually, which can hit Slack's rate limits. The Slack SDK auto-retries, so it will complete — just may take longer on channels with many messages.

## Required OAuth Scopes

These scripts use the following bot scopes (all included in `manifest.json`):

**Core app scopes:**
- `canvases:read` — look up canvas sections
- `canvases:write` — create/edit/delete canvases
- `channels:history` — read channel messages for teardown
- `channels:read` — list channels
- `chat:write` — post messages and delete bot messages

**Seed-only scopes** (not needed by the core app — only required for running these scripts):
- `channels:join` — join existing channels
- `channels:manage` — create channels, set topics
