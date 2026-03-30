import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import esmock from 'esmock';

describe('appHomeOpenedCallback', () => {
  const loadModule = () =>
    esmock('../listeners/events/app-home-opened.js', {});

  it('publishes the home tab view for home tab events', async () => {
    const { appHomeOpenedCallback } = await loadModule();
    const publishMock = mock.fn(async () => ({}));
    const client = { views: { publish: publishMock } };
    const event = { tab: 'home', user: 'U123' };
    const logger = { error: mock.fn() };

    await appHomeOpenedCallback({ client, event, logger });

    assert.equal(publishMock.mock.calls.length, 1);
    const call = publishMock.mock.calls[0].arguments[0];
    assert.equal(call.user_id, 'U123');
    assert.equal(call.view.type, 'home');
    assert.ok(call.view.blocks.length > 0);
  });

  it('skips non-home tab events', async () => {
    const { appHomeOpenedCallback } = await loadModule();
    const publishMock = mock.fn(async () => ({}));
    const client = { views: { publish: publishMock } };
    const event = { tab: 'messages', user: 'U123' };
    const logger = { error: mock.fn() };

    await appHomeOpenedCallback({ client, event, logger });

    assert.equal(publishMock.mock.calls.length, 0);
  });

  it('includes header block with app title', async () => {
    const { appHomeOpenedCallback } = await loadModule();
    const publishMock = mock.fn(async () => ({}));
    const client = { views: { publish: publishMock } };
    const event = { tab: 'home', user: 'U123' };
    const logger = { error: mock.fn() };

    await appHomeOpenedCallback({ client, event, logger });

    const blocks = publishMock.mock.calls[0].arguments[0].view.blocks;
    const header = blocks.find((b) => b.type === 'header');
    assert.ok(header);
    assert.equal(header.text.text, 'Team Retrospectives');
  });

  it('logs errors from views.publish', async () => {
    const { appHomeOpenedCallback } = await loadModule();
    const error = new Error('publish failed');
    const client = { views: { publish: mock.fn(async () => { throw error; }) } };
    const event = { tab: 'home', user: 'U123' };
    const logger = { error: mock.fn() };

    await appHomeOpenedCallback({ client, event, logger });

    assert.equal(logger.error.mock.calls.length, 1);
  });
});
