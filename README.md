# bolt-blockkit-js

A Slack Bolt app that demonstrates [Block Kit](https://api.slack.com/block-kit) UI capabilities through an interactive team retrospective workflow. Built for use with the [Slack CLI](https://api.slack.com/automation/cli).

## What it does

Teams use a global shortcut to open a retrospective form, fill in sprint feedback, and post a structured summary to a channel. The app showcases a wide range of Block Kit elements:

- **Plain-text inputs** — single-line and multi-line
- **Static select menu** — sprint/iteration picker
- **Datepicker** — sprint end date
- **Radio buttons** — team mood selector
- **Checkboxes** — focus area categories
- **Modals** — form collection with submission handling
- **Chained modals** — "Add Comment" opens a secondary modal
- **Actions block** — buttons and overflow menus
- **Header, section, divider, and context blocks** — rich message layout

## Getting started

1. **Clone and install**
   ```bash
   git clone <repo-url>
   cd bolt-blockkit-js
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Fill in your Slack tokens and channel ID
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
│       └── retro-actions.js        # Button and overflow actions
└── tests/                          # Unit tests (Node.js test runner + esmock)
```

## Tech stack

- **Runtime:** Node.js (ESM)
- **Framework:** [@slack/bolt](https://slack.dev/bolt-js) v4
- **Linter:** [Biome](https://biomejs.dev)
- **Testing:** Node.js built-in test runner + [esmock](https://github.com/iambumblehead/esmock)
