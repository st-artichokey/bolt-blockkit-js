# Changelog

## feat: Add seed script for dummy retro data

- Added `scripts/seed-retros.js` — creates a "Retro Canvas" with 8 dummy retro entries across 3 sprint dates
- Auto-discovers the retro channel via `users.conversations`
- Uses `buildRetroMarkdown` to generate canvas content matching the app's real output
- Run with `npm run seed`

## docs: Fix inaccurate comments in retro-submit

- Fixed "LRU eviction" comments to "FIFO eviction" — the cache evicts oldest-inserted, not least-recently-used
- Updated `retroSubmitCallback` JSDoc to document confirmation message and no-channel error path
- Improved inline comment on create-or-recover IIFE to describe the full recovery flow
- Added missing `@param` tags to `lookupCanvasId`

## refactor: Extract shared formatRetroMeta helper

- Deduplicated mood emoji and categories list formatting from `buildRetroSummaryBlocks` and `buildRetroMarkdown` into `formatRetroMeta`
- No behavior change; total tests: 65

## fix: Recover existing canvas instead of creating duplicates

- `writeToCanvas` now handles the `channel_canvas_already_exists` error from `conversations.canvases.create`
- When creation fails because a canvas already exists, the code looks up the canvas ID via `conversations.info` and appends to it
- Fixes duplicate canvas creation after app restarts (in-memory cache was lost)
- Extracted `appendToCanvas`, `lookupCanvasId`, and `cacheCanvasId` helpers for clarity
- Added 1 new test, updated 1 existing test for the recovery flow
- Total tests: 65

## fix: Guard against multi-channel race in member_joined_channel

- When the bot is added to a new channel but a retro channel is already set, the event handler now logs a warning and skips the update
- Prevents unpredictable last-write-wins behavior when the bot is added to multiple channels
- Added test for the guard; updated existing test to mock `getRetroChannel`
- Total tests: 64

## fix: Replace broken deep link with native channel mention

- Replaced unreliable `slack://channel` deep link in App Home with Slack's native mrkdwn channel mention (`<#CXXXXX>`)
- The `slack://` protocol link did not work in practice; native mentions are rendered and linked by Slack automatically
- Updated test to assert the native format is used
- Total tests: 63

## fix: Add missing im:write scope for DM copies

- Added `im:write` to `manifest.json` bot OAuth scopes — required for the "Send me a copy" DM feature to work
- Without this scope, DM copy requests silently failed
- Added manifest test asserting `im:write` is present
- Total tests: 62

## fix: Restore .slack/hooks.json for Slack CLI app startup

- Restored `.slack/hooks.json` — the Slack CLI bootstrap file that was accidentally deleted when `.slack/` was added to `.gitignore`
- Replaced blanket `.slack/` gitignore with a selective `.slack/.gitignore` that only ignores machine-specific files (`apps.dev.json`, `cache/`, `config.json`)
- Without `hooks.json`, `slack run` cannot discover how to start the app

## docs: Add Slack interactivity guide link to README and CONTRIBUTING

- Added interactivity guide link to README Resources section (shortcuts, modals, action handling)
- Added interactivity guide link to CONTRIBUTING.md AI review checklist for verifying API methods

## fix: Send user-facing error when retro channel is not configured

- When `getRetroChannel()` returns null during submission, the user now receives a message explaining the issue and how to fix it (`/invite @RetroRun`)
- Previously the modal closed silently with only a server-side log
- Updated 2 existing tests to assert the error message is sent
- Total tests: 61

## feat: Auto-discover retro channel on startup

- Added `discoverRetroChannel()` in `channel-store.js` — queries `users.conversations` on startup to find public channels the bot is already in
- Handles single channel (sets it), multiple channels (uses first, warns), no channels (warns), and API errors (logs, continues)
- Called in `app.js` after `auth.test()` so the retro channel survives app restarts
- Added 4 tests (TDD): one channel, multiple channels, no channels, API error
- Total tests: 61

## fix: Remove stale RETRO_CHANNEL_ID env var fallback

- Removed `process.env.RETRO_CHANNEL_ID` fallback from `getRetroChannel()` — the env var was causing `channel_not_found` errors when set to a stale value
- Auto-discovery via `member_joined_channel` is now the sole mechanism for setting the retro channel
- Removed `RETRO_CHANNEL_ID` from README env var docs and `.env`
- Updated channel-store tests to remove env var references
- Total tests: 57 (removed 1 env var fallback test)

## fix: Add missing commands scope for global shortcut

- Added `commands` bot scope — required for the "Start Retrospective" global shortcut to appear in Slack
- Without this scope, shortcuts are not available to users (per Slack docs: "your app must have the `commands` permission scope")
- Verified `commands` is a bot-only scope

## fix: Add missing channels:read scope for member_joined_channel event

- Added `channels:read` scope — required for the bot to receive `member_joined_channel` events
- Without this scope, auto-channel discovery was silently broken (event never delivered)
- Verified all scopes against Slack API docs: no other missing or unused scopes

## fix: Clean up manifest — remove unused scope, enable Messages tab

- Removed unused `chat:write.public` scope (app only writes canvases to the retro channel, not messages)
- Enabled `messages_tab_enabled` in App Home — confirmation messages and DM copies are delivered to the Messages tab, so it should be visible to users
- All 58 tests pass

## feat: Send confirmation message to Messages tab after retro submission

- After a successful canvas write, a confirmation message is sent to the user's Messages tab with a link to the retro channel
- Confirmation is not sent if the canvas write fails or the channel is not configured
- Confirmation is skipped on canvas failure, but DM copy still sends if the user requested it
- Added 4 tests (TDD): confirmation on success, not on canvas failure, DM copy still sends on canvas failure, not on unconfigured channel
- Updated 2 existing tests to account for the new confirmation message
- Total tests: 58

## fix: Remove Claude-specific conventions from CONTRIBUTING.md

- Removed session logs section (internal Claude Code convention, not for developers)
- Made TDD steps tool-agnostic instead of AI-centric
## docs: Add CONTRIBUTING.md and clean up project configuration

- Added `CONTRIBUTING.md` with guidelines for AI-assisted and traditional contributors
- Renamed npm package from `bolt-blockkit-js` to `retrorun` to match app display name
- Updated `CLAUDE.md` heading to match package name
- Rewrote `README.md`: RetroRun branding, canvas output docs, auto-channel discovery, project structure, env vars, Resources section, contributing link
- Added missing `@returns {void}` JSDoc tags to all register functions
- Removed unused `commands` scope and redundant `messages_tab_read_only_enabled` from manifest
- Made log level configurable via `LOG_LEVEL` env var (defaults to INFO)
- Added `.claude/settings.local.json` to `.gitignore`
- Updated `dotenv` from ~17.3.1 to ^17.4.1
- All 54 tests pass

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
