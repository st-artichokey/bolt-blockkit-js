# Changelog

## docs: Add Resources section to README with Slack API links

- Added links to Slack API docs, Block Kit reference, Block Kit Builder, Bolt docs, CLI docs, and manifest schema

## fix: Untrack machine-specific files

- Removed `.claude/settings.local.json` from git (local Claude Code permissions)
- Removed `.slack/config.json` from git (per-developer project ID, already in `.slack/.gitignore` but was tracked)
- Added `.claude/settings.local.json` to root `.gitignore`

## fix: Add missing @returns {void} JSDoc tags to register functions

- Added `@returns {void}` to all 5 `register()` exports and `registerListeners()`
- Brings all exported functions into compliance with project JSDoc conventions

## fix: Clarify TDD discipline section in CONTRIBUTING.md

- Reworded ambiguous "Don't:" phrasing that made the correct TDD steps read as things to avoid
- Bolded "fails" and "pass" to emphasize the red-green cycle

## refactor: Rename package to retro-recap-app and update dependencies

- Renamed npm package from `bolt-blockkit-js` to `retro-recap-app` in package.json, CLAUDE.md, and README
- Updated `dotenv` from ~17.3.1 to ^17.4.1
- Updated `@biomejs/biome` from ^2.4.4 to ^2.4.10
- All 29 tests pass

## docs: Update README to reflect current app features

- Renamed heading to "Retro Recap App" to match manifest
- Added App Home, retrospective form, and summary post as distinct subsections
- Replaced `.env.example` copy step with inline `.env` variable listing
- Updated project structure to note 29 tests and App Home actions
- Added link to CONTRIBUTING.md

## docs: Add CONTRIBUTING.md with AI and non-AI contributor guidelines

- Created contributing guide covering setup, TDD workflow, code conventions, and PR process
- Added dedicated section for AI-assisted contributors: transparency, review practices, TDD discipline
- Added section for non-AI contributors including tips for reviewing AI-assisted PRs
- Included guidance on adding new Block Kit elements
- Committed untracked `.slack/` config files (`.gitignore`, `apps.json`, `hooks.json`)

## feat: Update manifest for Slack marketplace compliance

- Renamed app from "bolt-blockkit-retro" to "Retro Recap App"
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
