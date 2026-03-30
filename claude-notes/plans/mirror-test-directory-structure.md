# Plan: Mirror source directory structure in tests

## Context
Test files were flat in `tests/` while source files were nested under `listeners/events/`, `listeners/actions/`, `listeners/shortcuts/`, `listeners/views/`. Mirroring the source structure makes it immediately clear which test covers which module.

## Current → Target

| Current path | New path |
|---|---|
| `tests/app-home-opened.spec.js` | `tests/events/app-home-opened.spec.js` |
| `tests/member-joined-channel.spec.js` | `tests/events/member-joined-channel.spec.js` |
| `tests/retro-actions.spec.js` | `tests/actions/retro-actions.spec.js` |
| `tests/start-retro.spec.js` | `tests/shortcuts/start-retro.spec.js` |
| `tests/retro-submit.spec.js` | `tests/views/retro-submit.spec.js` |
| `tests/channel-store.spec.js` | stays (mirrors `listeners/channel-store.js`) |
| `tests/manifest.spec.js` | stays (mirrors root `manifest.json`) |

## Changes per moved file

Each moved file needs its `esmock()` import paths updated — one extra `../` level since they're now one directory deeper. For example:
- `"../listeners/events/app-home-opened.js"` → `"../../listeners/events/app-home-opened.js"`
- `"../listeners/channel-store.js"` → `"../../listeners/channel-store.js"`

## Other updates
- `package.json` test script already uses `tests/**/*.spec.js` glob — no change needed

## Verification
1. `npm test` — all 51 tests pass
2. `npx @biomejs/biome check` — clean
