# Retro Recap App

A Slack Bolt app for running team sprint retrospectives directly in Slack. Built with [Block Kit](https://api.slack.com/block-kit) and the [Slack CLI](https://api.slack.com/automation/cli).

## What it does

Team members open a retrospective form — via global shortcut or the App Home — fill in sprint feedback, and a rich summary is posted to a channel for the team to review and discuss.

### App Home

A personalized landing page with a greeting, a **Start Retrospective** button, and step-by-step instructions. Includes an AI disclosure for Slack marketplace compliance.

### Retrospective form

A Block Kit modal collecting:

- **Retro title** — plain-text input
- **Sprint / Iteration** — static select menu
- **Sprint end date** — datepicker
- **What went well / didn't / action items** — multi-line text inputs
- **Team mood** — radio buttons (Great, OK, Tough)
- **Focus areas** — checkboxes (Communication, Process, Tooling, Team Dynamics)

### Summary post

On submission, a rich Block Kit message is posted to a configured channel with all the feedback, mood emoji, and focus area tags. The message includes:

- **Add Comment** button — opens a chained modal that posts a threaded reply
- **Overflow menu** — pin the summary to the channel or bookmark it (sends a DM with a link)

## Getting started

1. **Clone and install**
   ```bash
   git clone <repo-url>
   cd retro-recap-app
   npm install
   ```

2. **Configure environment**

   Create a `.env` file in the project root with:
   ```
   SLACK_BOT_TOKEN=xoxb-...
   SLACK_APP_TOKEN=xapp-...
   RETRO_CHANNEL_ID=C...
   ```

3. **Run locally** (Socket Mode)
   ```bash
   slack run          # via Slack CLI
   # or
   npm run dev        # with hot reload
   ```

4. **Run tests**
   ```bash
   npm test
   ```

5. **Lint**
   ```bash
   npm run lint
   ```

## Project structure

```
├── app.js                          # Entry point (Socket Mode)
├── manifest.json                   # Slack app manifest
├── listeners/
│   ├── index.js                    # Central listener registration
│   ├── events/
│   │   └── app-home-opened.js      # App Home tab
│   ├── shortcuts/
│   │   └── start-retro.js          # Global shortcut → retro modal
│   ├── views/
│   │   ├── retro-submit.js         # Modal submission → channel post
│   │   └── add-comment-submit.js   # Chained modal for comments
│   └── actions/
│       └── retro-actions.js        # Button, overflow, and App Home actions
└── tests/                          # 29 unit tests (Node.js test runner + esmock)
```

## Tech stack

- **Runtime:** Node.js (ESM)
- **Framework:** [@slack/bolt](https://slack.dev/bolt-js) v4
- **Linter:** [Biome](https://biomejs.dev)
- **Testing:** Node.js built-in test runner + [esmock](https://github.com/iambumblehead/esmock)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, workflow, and guidelines for both AI-assisted and traditional contributors.
