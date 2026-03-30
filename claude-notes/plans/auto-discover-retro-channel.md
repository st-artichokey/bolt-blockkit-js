# Plan: Auto-discover retro channel when bot is added

## Context
The app required a hardcoded `RETRO_CHANNEL_ID` env var. This is fragile and not user-friendly — a non-developer can't configure the app. Instead, when a user adds RetroRun to a channel via `/invite @RetroRun` or the channel integrations UI, the app should automatically use that channel as its retro channel.

## Approach

### Use `member_joined_channel` event
When the bot is added to a channel, Slack fires `member_joined_channel` with the channel ID. The app listens for this event, checks if the joining user is the bot itself, and stores the channel ID in a shared module-level variable.

### Channel storage: shared in-memory module
Create a small `channel-store.js` module exporting `getRetroChannel()` and `setRetroChannel(id)`. Both `app-home-opened.js` and `retro-submit.js` import from this instead of reading `process.env.RETRO_CHANNEL_ID`. The env var becomes a fallback for startup (if set, seed the store with it).

### Bot user ID detection
On app startup, call `app.client.auth.test()` to get the bot's own user ID. Pass it to the event handler so it can filter out non-bot join events. Store it in the channel-store module as well.

### Multi-channel handling
If the bot is added to multiple channels, use the **most recently joined** channel. This is the simplest behavior — the admin can move the bot to a different channel at any time.

## Implementation steps (TDD)

### Step 1: Create channel-store module
- **`listeners/channel-store.js`** — Shared state module:
  - `getRetroChannel()` — returns stored channel ID (or `process.env.RETRO_CHANNEL_ID` fallback)
  - `setRetroChannel(channelId)` — stores channel ID
  - `setBotUserId(userId)` / `getBotUserId()` — stores/retrieves bot user ID
- **`tests/channel-store.spec.js`** — Tests for get/set, env fallback

### Step 2: Create member-joined-channel event handler
- **`listeners/events/member-joined-channel.js`** — `memberJoinedChannelCallback`:
  - Check if `event.user` matches the bot user ID (from channel-store)
  - If yes, call `setRetroChannel(event.channel)`
  - If no, ignore (someone else joined)
- **`tests/member-joined-channel.spec.js`** — Tests: bot join stores channel, non-bot join ignored

### Step 3: Update app.js to initialize bot user ID
- **`app.js`** — After `app.start()`, call `app.client.auth.test()` and pass the `user_id` to `setBotUserId()`

### Step 4: Update existing files to use channel-store
- **`listeners/events/app-home-opened.js`** — Replace `process.env.RETRO_CHANNEL_ID` with `getRetroChannel()`
- **`listeners/views/retro-submit.js`** — Replace `process.env.RETRO_CHANNEL_ID` with `getRetroChannel()`
- **`tests/app-home-opened.spec.js`** — Mock channel-store instead of env var
- **`tests/retro-submit.spec.js`** — Mock channel-store instead of env var

### Step 5: Update manifest
- **`manifest.json`** — Add `member_joined_channel` to `bot_events`

## Files created/modified
| File | Action |
|------|--------|
| `listeners/channel-store.js` | Create — shared channel/bot state |
| `listeners/events/member-joined-channel.js` | Create — event handler |
| `listeners/events/index.js` | Register new event |
| `listeners/events/app-home-opened.js` | Use channel-store |
| `listeners/views/retro-submit.js` | Use channel-store |
| `app.js` | Initialize bot user ID on startup |
| `manifest.json` | Add `member_joined_channel` event |
| `tests/channel-store.spec.js` | Create — store tests |
| `tests/member-joined-channel.spec.js` | Create — event handler tests |
| `tests/app-home-opened.spec.js` | Update mocks |
| `tests/retro-submit.spec.js` | Update mocks |

## Verification
1. `npm test` — all tests pass
2. `npm run lint` — clean
3. Manual: add bot to a channel → App Home shows button → submit retro → canvas created in that channel
