import { test, expect } from '@playwright/test';

const ROUTE = '/api/roadmap-answers';

// Every test here writes the same singleton entry, so running them in parallel
// races on Contentful's optimistic version lock. Serial is not a workaround for
// flakiness — concurrency is genuinely meaningless against one shared record.
test.describe.configure({ mode: 'serial' });

// Chromium only. These assert an HTTP contract, which does not vary by browser
// engine, and every one of them writes the same singleton entry — running them
// in three projects at once races exactly as running them in parallel does.
test.skip(
  ({ browserName }) => browserName !== 'chromium',
  'writes the shared singleton entry; one project is enough for an API contract',
);

test('rejects a field that is not a string', async ({ request }) => {
  const res = await request.post(ROUTE, { data: { budget: 12345 } });
  expect(res.status()).toBe(400);
});

test('rejects a field over the length cap', async ({ request }) => {
  const res = await request.post(ROUTE, { data: { budget: 'x'.repeat(2001) } });
  expect(res.status()).toBe(400);
});

test('ignores fields that are not on the allowlist', async ({ request }) => {
  const res = await request.post(ROUTE, {
    data: { budget: 'about $2k', sys: { id: 'evil' }, fields: 'nope' },
  });
  expect(res.ok()).toBeTruthy();

  const read = await request.get(ROUTE);
  const body = await read.json();
  expect(body.answers.budget).toBe('about $2k');
  expect(body.answers).not.toHaveProperty('sys');
  expect(body.answers).not.toHaveProperty('fields');
});

test('round-trips an answer', async ({ request }) => {
  const value = `liked the second one ${Date.now()}`;
  const write = await request.post(ROUTE, { data: { liked: value } });
  expect(write.ok()).toBeTruthy();

  const read = await request.get(ROUTE);
  expect((await read.json()).answers.liked).toBe(value);
});
