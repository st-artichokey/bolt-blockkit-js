# Contributing to RetroRun

Thanks for your interest in contributing! This guide covers best practices for all contributors, whether you're writing code by hand or working with AI assistance.

## Getting Set Up

1. Fork and clone the repository
2. Run `npm install`
3. Create a `.env` file with your Slack tokens (see README for details)
4. Run `npm test` to verify everything passes before making changes

## Code Conventions

- **ESM modules** — all files use `import`/`export` (the project sets `"type": "module"`)
- **JSDoc** on all exported functions with `@param` and `@returns` tags
- **Naming** — camelCase for functions and variables, UPPER_SNAKE_CASE for constants
- **Formatting** — Biome handles formatting (2-space indent). Run `npm run lint` before committing
- **Listener organization** — listeners live under `listeners/` grouped by type: `events/`, `shortcuts/`, `views/`, `actions/`. Each category has an `index.js` that registers its handlers

## Development Workflow

### 1. Branch from `main`

Create a descriptive branch name:

```bash
git checkout -b feat/add-emoji-reactions
git checkout -b fix/modal-validation-error
```

### 2. Write tests first (TDD)

This project follows test-driven development:

1. Write or update a test in `tests/` that describes the expected behavior
2. Run `npm test` and confirm the new test fails
3. Implement the code to make the test pass
4. Refactor if needed, keeping tests green

Tests use the Node.js built-in test runner with `esmock` for mocking Bolt dependencies. Test files mirror the `listeners/` directory structure (e.g., `tests/events/`, `tests/views/`). Look at existing test files for patterns.

### 3. Lint your code

```bash
npm run lint          # check for issues
npm run lint:fix      # auto-fix what Biome can
```

### 4. Update the changelog

Add an entry to `CHANGELOG.md` at the top of the file summarizing your changes. Use a conventional-commit-style prefix:

- `feat:` for new features
- `fix:` for bug fixes
- `refactor:` for structural changes
- `docs:` for documentation-only changes
- `test:` for test-only changes

### 5. Commit and open a PR

Write clear, concise commit messages. One logical change per commit.

## For Contributors Using AI

If you're using Claude Code, Copilot, or another AI tool to assist with contributions, follow these additional practices:

### Be transparent

- Include a `Co-Authored-By` trailer in your commit messages to indicate AI assistance
- In your PR description, note which parts were AI-assisted if it's not the entire change

### Review AI output critically

- **Read every line** the AI generates before committing. AI can produce plausible-looking code that has subtle bugs or doesn't match project conventions
- **Verify Block Kit payloads** — AI may generate block structures that look correct but use invalid combinations of fields. Test them in [Block Kit Builder](https://app.slack.com/block-kit-builder) when possible
- **Check imports** — AI sometimes invents module paths or exports that don't exist. Confirm that all imports resolve
- **Watch for hallucinated APIs** — Bolt's API surface is specific. If the AI suggests a method you haven't seen before, verify it in the [Bolt docs](https://slack.dev/bolt-js) or the [interactivity guide](https://docs.slack.dev/interactivity/implementing-shortcuts)

### Maintain TDD discipline

AI tools can make it tempting to skip the "red" phase of red-green-refactor. Don't skip it. Always follow the full cycle:

1. Write the test first (you or the AI)
2. Run `npm test` and confirm the new test **fails**
3. Implement the code to make it pass
4. Run tests again to confirm they **pass**

### Don't over-generate

- Avoid letting AI add features, abstractions, or "improvements" beyond what you're working on
- Keep changes focused on the task. If the AI suggests refactoring unrelated code, skip it
- Don't commit AI-generated comments that just restate what the code already says

## For Contributors Not Using AI

### Standard practices

- Follow the TDD workflow described above — tests first, implementation second
- Use the existing listener files as a reference for style, structure, and JSDoc patterns
- When adding a new listener, create the handler file in the appropriate `listeners/` subdirectory, export the callback, and register it in that directory's `index.js`

### Reviewing AI-assisted PRs

You may review PRs that were written with AI assistance. A few things to watch for:

- **Unnecessary complexity** — AI tends to over-abstract. If a helper function is only called once, the code may be simpler inlined
- **Correct Slack API usage** — verify that `client.*` method calls use real Slack Web API methods with valid parameters
- **Test quality** — make sure tests assert meaningful behavior, not just that functions were called. Check that edge cases are covered
- **Consistent style** — AI-generated code sometimes drifts from project conventions (e.g., using `var` instead of `const`, or CommonJS `require` instead of ESM `import`)

## Adding New Block Kit Elements

When adding new Block Kit elements to the app:

1. Reference the [Block Kit reference docs](https://api.slack.com/reference/block-kit)
2. Add the element to the appropriate listener (modal builder, App Home, or canvas output)
3. If the element collects user input, update the `parseRetroValues` function in `listeners/views/retro-submit.js`
4. Write tests for both the block structure and the parsed values
5. Update the README's Block Kit element list if adding a net-new element type

## Reporting Issues

Open an issue with:

- Steps to reproduce
- Expected vs. actual behavior
- Node.js version and OS
- Relevant error output or logs
