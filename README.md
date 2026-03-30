# bolt-blockkit-js

A Slack Bolt app that demonstrates [Block Kit](https://api.slack.com/block-kit) UI capabilities through an interactive team retrospective workflow. Built for use with the [Slack CLI](https://api.slack.com/automation/cli).

## What it does

Teams use a global shortcut to open a retrospective form, fill in sprint feedback, and save a structured summary to a shared channel canvas. The app showcases a wide range of Block Kit elements:

- **Plain-text inputs** — single-line and multi-line
- **Static select menu** — sprint/iteration picker
- **Datepicker** — sprint end date
- **Radio buttons** — team mood selector
- **Checkboxes** — focus area categories and personal copy opt-in
- **Modals** — form collection with submission handling
- **Actions block** — buttons for starting retrospectives
- **Canvas markdown** — rich retrospective summaries with native commenting
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
   # Create a .env file with your Slack tokens and channel ID
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
│   │   └── retro-submit.js         # Modal submission → canvas write
│   └── actions/
│       └── retro-actions.js        # App Home button actions
└── tests/                          # Unit tests (Node.js test runner + esmock)
```

## Tech stack

- **Runtime:** Node.js (ESM)
- **Framework:** [@slack/bolt](https://slack.dev/bolt-js) v4
- **Linter:** [Biome](https://biomejs.dev)
- **Testing:** Node.js built-in test runner + [esmock](https://github.com/iambumblehead/esmock)
