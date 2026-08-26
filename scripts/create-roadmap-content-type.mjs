// One-off. Creates (or updates) the roadmapAnswers content type used by the
// private realtor roadmap page's section 9 form.
//
//   node --env-file=.env.local scripts/create-roadmap-content-type.mjs
//
// The content type is published because entries of an unpublished type cannot
// be created. The entry that holds the answers is never published — see
// src/lib/roadmapAnswers.ts.

const SPACE = process.env.CONTENTFUL_SPACE_ID;
const TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
const ID = 'roadmapAnswers';
const URL_BASE = `https://api.contentful.com/spaces/${SPACE}/environments/master/content_types/${ID}`;

if (!SPACE || !TOKEN) {
  throw new Error('CONTENTFUL_SPACE_ID and CONTENTFUL_MANAGEMENT_TOKEN must be set');
}

// Text, not Symbol: Symbol caps at 256 chars and the field cap is 2000.
const answerFields = [
  'liked', 'disliked', 'budget', 'maintenance', 'bilingual', 'idx', 'otherSite',
].map((id) => ({ id, name: id, type: 'Text', required: false }));

const body = {
  name: 'Roadmap Answers',
  description: 'Answers to section 9 of the private realtor roadmap page.',
  displayField: 'title',
  fields: [{ id: 'title', name: 'Title', type: 'Symbol', required: true }, ...answerFields],
};

const existing = await fetch(URL_BASE, { headers: { Authorization: `Bearer ${TOKEN}` } });
const version = existing.ok ? (await existing.json()).sys.version : null;

const res = await fetch(URL_BASE, {
  method: 'PUT',
  headers: {
    Authorization: `Bearer ${TOKEN}`,
    'Content-Type': 'application/vnd.contentful.management.v1+json',
    ...(version === null ? {} : { 'X-Contentful-Version': String(version) }),
  },
  body: JSON.stringify(body),
});
if (!res.ok) throw new Error(`create failed: ${res.status} ${await res.text()}`);

const created = await res.json();
const pub = await fetch(`${URL_BASE}/published`, {
  method: 'PUT',
  headers: {
    Authorization: `Bearer ${TOKEN}`,
    'X-Contentful-Version': String(created.sys.version),
  },
});
if (!pub.ok) throw new Error(`publish failed: ${pub.status} ${await pub.text()}`);

console.log('roadmapAnswers content type ready');
