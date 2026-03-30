# Changelog

## fix: Validate modal fields, verify action wiring, gitignore .slack/

- Added `requireField` helper to `parseRetroValues` — throws descriptive errors (e.g., "Missing required field: retro_title_block.retro_title.value") instead of opaque TypeErrors on malformed payloads
- Verified `retro-actions.js` → `actions/index.js` wiring is correct (no change needed)
- Added `.slack/` to `.gitignore` and removed tracked `.slack/` files — these are local Slack CLI config
- Added 2 tests: missing title field, missing mood selection
- Total tests: 54

## fix: Prevent concurrent canvas creation and cap cache size

- Added per-channel promise lock in `writeToCanvas` — concurrent submissions wait for an in-flight create to finish, then append via edit instead of creating a duplicate canvas
- Capped canvas cache at 50 entries with LRU eviction to prevent unbounded growth
- Extracted `writeToCanvas` helper from `retroSubmitCallback` for clarity
- Added test: two simultaneous submissions only create one canvas
- Total tests: 52

## refactor: Mirror source directory structure in test files

- Moved test files into subdirectories matching `listeners/` structure: `tests/events/`, `tests/actions/`, `tests/shortcuts/`, `tests/views/`
- `channel-store.spec.js` and `manifest.spec.js` stay at `tests/` root (mirror top-level sources)
- Updated all `esmock()` import paths to match new depths
- Total tests: 51

## feat: Auto-discover retro channel when bot is added

- Created `channel-store.js` shared module for retro channel and bot user ID state
- Added `member_joined_channel` event handler — when the bot is added to a channel, it automatically uses that channel for retrospectives
- Updated `app.js` to call `auth.test()` on startup and store the bot's own user ID
- Replaced `process.env.RETRO_CHANNEL_ID` direct reads in `app-home-opened.js` and `retro-submit.js` with `getRetroChannel()` from channel-store (env var remains as fallback)
- Updated App Home limited view to guide users to `/invite @RetroRun` instead of asking an admin to configure
- Added `member_joined_channel` to manifest `bot_events`
- Updated all tests to mock `channel-store` instead of env vars
- Total tests: 51

## fix: Pre-merge cleanup — stale docs, unused test helpers, cache recovery

- Updated README.md to reflect canvas output, removed references to deleted files and features
- Updated manifest.json `long_description` to reference native canvas commenting
- Removed unused `fakeRetroMessages` from app-home-opened tests, simplified `buildClient`
- Added canvas markdown content assertion to submission test
- Added stale cache recovery: if `canvases.edit` fails, clears cache and creates a new canvas
- Total tests: 44

## feat: Switch retro output from channel messages to shared canvas

- Retro submissions now write to a shared channel canvas via `conversations.canvases.create` / `canvases.edit` instead of posting Block Kit messages
- Added `buildRetroMarkdown()` to convert retro data to canvas markdown format
- Added "Send me a copy of my responses" checkbox to the retro modal; sends Block Kit summary to the user's App Home Messages tab when selected
- Removed Add Comment button, overflow menu (pin/bookmark), and `add-comment-submit.js` — canvases have native commenting
- App Home now references the channel canvas instead of listing individual retro messages
- Updated "How it works" step 3 to say "saved to the retro channel canvas"
- Added `canvases:write` scope, removed unused `im:write` scope from manifest
- Total tests: 43

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
