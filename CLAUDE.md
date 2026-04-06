# retrorun

A Slack Bolt app demonstrating Block Kit UI for team retrospectives.

## Commit Conventions

- Update `CHANGELOG.md` with a summary entry **before every commit** — include it in the same commit.
- Update the session log in `claude-notes/logs/session-YYYY-MM-DD.md` in the same commit as the changelog update.
- Session log format follows the template in `claude-notes/logs/session-2026-03-30.md`:
  - H2 sections group related work; each user prompt becomes an H3 header
  - Under each prompt: description of what was done, then a **Sources** section with linked references
  - End with a **Stats** section (branch, commits, test count, files modified)
  - End with a thematic GIF (200px, from Giphy)

## Code Conventions

- ESM modules (`"type": "module"` in package.json)
- JSDoc on all exported functions with `@param` and `@returns` tags
- camelCase for functions, UPPER_SNAKE_CASE for constants
- Biome for linting (`npm run lint`)
- Node.js built-in test runner with `esmock` for mocking
- Listeners organized by type: `listeners/events/`, `listeners/shortcuts/`, `listeners/views/`, `listeners/actions/`

## Tech Stack

- **Runtime:** Node.js (ESM)
- **Framework:** @slack/bolt v4
- **Linter:** Biome
- **Testing:** Node.js test runner + esmock
