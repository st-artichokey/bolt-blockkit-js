# RetroRun

A Slack Bolt app for running team sprint retrospectives directly in Slack. Built with [Block Kit](https://api.slack.com/block-kit) and the [Slack CLI](https://api.slack.com/automation/cli).

## What it does

Team members open a retrospective form — via global shortcut or the App Home — fill in sprint feedback, and a structured summary is saved to a shared channel canvas for the team to review and discuss.

### App Home

A personalized landing page with a greeting, a **Start Retrospective** button, step-by-step instructions, recent retro activity, and support/pricing disclosures. Shows a limited view when the bot hasn't been added to a channel yet.

### Retrospective form

A Block Kit modal collecting:

- **Retro title** — plain-text input
- **Sprint / Iteration** — static select menu
- **Sprint end date** — datepicker
- **What went well / didn't / action items** — multi-line text inputs
- **Team mood** — radio buttons (Great, OK, Tough)
- **Focus areas** — checkboxes (Communication, Process, Tooling, Team Dynamics)
- **Send me a copy** — opt-in checkbox to receive a personal copy

### Canvas output

On submission, retrospective data is written to a shared channel canvas using `conversations.canvases.create` / `canvases.edit`. Canvases support native commenting for follow-up discussion. If the user opts in, a Block Kit summary is also sent to their App Home Messages tab.

### Auto-channel discovery

When the bot is added to a channel, it automatically uses that channel for retrospectives — no manual `RETRO_CHANNEL_ID` configuration needed (though the env var works as a fallback).

## Getting started

1. **Clone and install**
   ```bash
   git clone https://github.com/st-artichokey/bolt-blockkit-js.git
   cd bolt-blockkit-js
   npm install
   ```

2. **Configure environment**

   Create a `.env` file in the project root with:
   ```
   SLACK_BOT_TOKEN=xoxb-...
   SLACK_APP_TOKEN=xapp-...
   RETRO_CHANNEL_ID=YOUR_CHANNEL_ID
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
│   ├── channel-store.js            # Shared retro channel and bot user state
│   ├── events/
│   │   ├── app-home-opened.js      # App Home tab
│   │   └── member-joined-channel.js # Auto-channel discovery
│   ├── shortcuts/
│   │   └── start-retro.js          # Global shortcut → retro modal
│   ├── views/
│   │   └── retro-submit.js         # Modal submission → canvas write
│   └── actions/
│       └── retro-actions.js        # App Home button actions
└── tests/                          # 54 unit tests (mirrors listeners/ structure)
```

## Tech stack

- **Runtime:** Node.js (ESM)
- **Framework:** [@slack/bolt](https://slack.dev/bolt-js) v4
- **Linter:** [Biome](https://biomejs.dev)
- **Testing:** Node.js built-in test runner + [esmock](https://github.com/iambumblehead/esmock)

## Resources

- [Slack API documentation](https://api.slack.com)
- [Block Kit reference](https://api.slack.com/reference/block-kit)
- [Block Kit Builder](https://app.slack.com/block-kit-builder) — interactive prototyping tool
- [Bolt for JavaScript documentation](https://slack.dev/bolt-js)
- [Interactivity guide](https://docs.slack.dev/interactivity/implementing-shortcuts) — shortcuts, modals, and action handling
- [Slack CLI documentation](https://api.slack.com/automation/cli)
- [App manifest schema](https://api.slack.com/reference/manifests)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, workflow, and guidelines for both AI-assisted and traditional contributors.
