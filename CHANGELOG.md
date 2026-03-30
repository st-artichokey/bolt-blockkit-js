# Changelog

## feat: Add recent activity and unauthorized user handling to App Home

- App Home now fetches recent retro messages via `conversations.history` and displays up to 3 entries
- Shows "No retrospectives yet" empty state when no retros found
- Shows limited view (no Start Retrospective button, configure prompt) when channel access fails or `RETRO_CHANNEL_ID` is not set
- Added `channels:history` OAuth scope to manifest.json
- Added 4 tests (TDD): recent retros, empty state, channel access failure, missing env var
- Total tests: 35

## feat: Add support section and pricing disclosure to App Home

- Added "Need help?" section with link to GitHub repo (https://github.com/st-artichokey/retrorun)
- Added "This app is free to use" pricing disclosure context block
- Added 2 tests (TDD): support link presence, pricing disclosure
- Total tests: 31

## fix: Rename app to RetroRun everywhere

- Updated app name, bot display name, and long_description in manifest.json and tests
- "Recap" implied summarizing past retros; "RetroRun" better signals active input collection

## feat: Update manifest for Slack marketplace compliance

- Renamed app from "bolt-blockkit-retro" to "RetroRun"
- Shortened description to fit 10-word marketplace limit
- Added `long_description` with detailed feature overview
- Added `background_color` (#4A154B — Slack aubergine)
- Updated `bot_user.display_name` to match app name
- Added 5 manifest validation tests (TDD)
- Total tests: 29

## fix: Use user-friendly language for shortcuts menu reference

- Replaced "global shortcut" jargon with discoverable instruction: search "Start Retrospective" in the shortcuts menu (lightning bolt icon)
- Added test asserting user-friendly language and no jargon
- Total tests: 24

## feat: Update App Home to comply with Slack guidelines

- Added personalized greeting with user mention
- Added "Start Retrospective" button in actions block on App Home
- Added AI disclosure context block (Slack marketplace requirement)
- Removed developer-facing "Block Kit elements demonstrated" section
- Created `startRetroHomeCallback` action handler reusing `buildRetroModal()`
- Registered `start_retro_home` action in actions/index.js
- Added 7 new tests (TDD): greeting, button, AI disclosure, no dev content, action handler
- Total tests: 23

## refactor: Move session logs to claude-notes/logs and remove .env.example

- Renamed `claude-session-logs/` to `claude-notes/logs/` to match emoji-tr-app directory structure
- Added empty `claude-notes/notes/` directory for developer notes
- Removed `.env.example` (users create `.env` directly)
- Updated CLAUDE.md session log paths to reflect new location

## docs: Add README and remove token/cost tracking

- Added README.md with project purpose, getting started guide, structure overview, and tech stack
- Removed model/token/cost placeholders from CLAUDE.md and session log

## feat: Scaffold Bolt Block Kit retrospective app

- Initialized project with package.json, manifest.json, biome.json, .gitignore, .env.example
- Created Bolt app entry point (app.js) with Socket Mode for local development
- Built retrospective modal with Block Kit inputs: plain-text, static select, datepicker, radio buttons, checkboxes, multi-line text
- Added modal submission handler that posts rich Block Kit summary to a channel
- Created App Home tab with usage instructions and Block Kit element showcase
- Added "Add Comment" button action with chained modal for thread replies
- Added overflow menu with pin and bookmark actions
- Wrote 14 unit tests covering all features (app home, modal build, submit, parse)
- Created CLAUDE.md with project conventions (changelog, session logs, code style)
- Created session log for 2026-03-30
