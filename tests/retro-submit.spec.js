import { describe, it, mock, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import esmock from 'esmock';

/** Builds a fake view.state.values object matching the retro modal structure. */
const buildFakeValues = (overrides = {}) => ({
  retro_title_block: { retro_title: { value: 'Sprint 4 Retro' } },
  sprint_block: { sprint_select: { selected_option: { text: { text: 'Sprint 4' }, value: 'sprint_4' } } },
  date_block: { sprint_date: { selected_date: '2026-03-28' } },
  went_well_block: { went_well: { value: 'Shipped on time' } },
  went_wrong_block: { went_wrong: { value: 'Too many meetings' } },
  action_items_block: { action_items: { value: 'Reduce sync meetings' } },
  mood_block: { team_mood: { selected_option: { value: 'great', text: { text: 'Great :tada:' } } } },
  categories_block: { categories: { selected_options: [{ text: { text: 'Process' }, value: 'process' }] } },
  ...overrides,
});

describe('parseRetroValues', () => {
  const loadModule = () =>
    esmock('../listeners/views/retro-submit.js', {});

  it('extracts all fields from modal values', async () => {
    const { parseRetroValues } = await loadModule();
    const result = parseRetroValues(buildFakeValues());

    assert.equal(result.title, 'Sprint 4 Retro');
    assert.equal(result.sprint, 'Sprint 4');
    assert.equal(result.date, '2026-03-28');
    assert.equal(result.wentWell, 'Shipped on time');
    assert.equal(result.wentWrong, 'Too many meetings');
    assert.equal(result.actionItems, 'Reduce sync meetings');
    assert.equal(result.mood, 'great');
    assert.deepEqual(result.categories, ['Process']);
  });

  it('handles empty categories', async () => {
    const { parseRetroValues } = await loadModule();
    const values = buildFakeValues({
      categories_block: { categories: { selected_options: [] } },
    });
    const result = parseRetroValues(values);
    assert.deepEqual(result.categories, []);
  });
});

describe('buildRetroSummaryBlocks', () => {
  const loadModule = () =>
    esmock('../listeners/views/retro-submit.js', {});

  it('returns blocks with header, sections, dividers, actions, and context', async () => {
    const { buildRetroSummaryBlocks, parseRetroValues } = await loadModule();
    const retro = parseRetroValues(buildFakeValues());
    const blocks = buildRetroSummaryBlocks(retro, 'U456');

    const types = blocks.map((b) => b.type);
    assert.ok(types.includes('header'));
    assert.ok(types.includes('section'));
    assert.ok(types.includes('divider'));
    assert.ok(types.includes('actions'));
    assert.ok(types.includes('context'));
  });

  it('includes the submitter in the context block', async () => {
    const { buildRetroSummaryBlocks, parseRetroValues } = await loadModule();
    const retro = parseRetroValues(buildFakeValues());
    const blocks = buildRetroSummaryBlocks(retro, 'U456');

    const context = blocks.find((b) => b.type === 'context');
    assert.ok(context.elements[0].text.includes('<@U456>'));
  });

  it('shows "None selected" when no categories are chosen', async () => {
    const { buildRetroSummaryBlocks, parseRetroValues } = await loadModule();
    const retro = parseRetroValues(buildFakeValues({
      categories_block: { categories: { selected_options: [] } },
    }));
    const blocks = buildRetroSummaryBlocks(retro, 'U456');

    const fieldsBlock = blocks.find(
      (b) => b.fields && b.fields.some((f) => f.text.includes('Focus Areas'))
    );
    assert.ok(fieldsBlock.fields.some((f) => f.text.includes('None selected')));
  });
});

describe('retroSubmitCallback', () => {
  const originalEnv = process.env.RETRO_CHANNEL_ID;

  beforeEach(() => {
    process.env.RETRO_CHANNEL_ID = 'C999';
  });

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.RETRO_CHANNEL_ID;
    } else {
      process.env.RETRO_CHANNEL_ID = originalEnv;
    }
  });

  const loadModule = () =>
    esmock('../listeners/views/retro-submit.js', {});

  it('acknowledges and posts a message to the retro channel', async () => {
    const { retroSubmitCallback } = await loadModule();
    const ack = mock.fn(async () => {});
    const postMock = mock.fn(async () => ({}));
    const client = { chat: { postMessage: postMock } };
    const view = { state: { values: buildFakeValues() } };
    const body = { user: { id: 'U456' } };
    const logger = { error: mock.fn() };

    await retroSubmitCallback({ ack, view, body, client, logger });

    assert.equal(ack.mock.calls.length, 1);
    assert.equal(postMock.mock.calls.length, 1);
    assert.equal(postMock.mock.calls[0].arguments[0].channel, 'C999');
  });

  it('logs error when RETRO_CHANNEL_ID is not set', async () => {
    delete process.env.RETRO_CHANNEL_ID;
    const { retroSubmitCallback } = await loadModule();
    const ack = mock.fn(async () => {});
    const postMock = mock.fn(async () => ({}));
    const client = { chat: { postMessage: postMock } };
    const view = { state: { values: buildFakeValues() } };
    const body = { user: { id: 'U456' } };
    const logger = { error: mock.fn() };

    await retroSubmitCallback({ ack, view, body, client, logger });

    assert.equal(postMock.mock.calls.length, 0);
    assert.equal(logger.error.mock.calls.length, 1);
  });
});
