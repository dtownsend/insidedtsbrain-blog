// Server-only. CONTENTFUL_MANAGEMENT_TOKEN must never reach the client, so this
// module is imported by the API route and nothing else.
const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const MANAGEMENT_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
const LOCALE = 'en-US';

export const CONTENT_TYPE_ID = 'roadmapAnswers';
export const ENTRY_ID = 'roadmapAnswersSingleton';
export const MAX_FIELD_LENGTH = 2000;

export const ANSWER_FIELDS = [
  'liked',
  'disliked',
  'budget',
  'maintenance',
  'bilingual',
  'idx',
  'otherSite',
] as const;

export type AnswerField = (typeof ANSWER_FIELDS)[number];
export type Answers = Record<AnswerField, string>;

export const EMPTY_ANSWERS: Answers = {
  liked: '',
  disliked: '',
  budget: '',
  maintenance: '',
  bilingual: '',
  idx: '',
  otherSite: '',
};

const entryUrl = () =>
  `https://api.contentful.com/spaces/${SPACE_ID}/environments/master/entries/${ENTRY_ID}`;

const authHeaders = () => ({ Authorization: `Bearer ${MANAGEMENT_TOKEN}` });

export async function readAnswers(): Promise<{
  answers: Answers;
  updatedAt: string | null;
}> {
  const res = await fetch(entryUrl(), { headers: authHeaders(), cache: 'no-store' });
  if (res.status === 404) return { answers: EMPTY_ANSWERS, updatedAt: null };
  if (!res.ok) throw new Error(`Contentful read failed: ${res.status}`);

  const entry = await res.json();
  const answers: Answers = { ...EMPTY_ANSWERS };
  for (const field of ANSWER_FIELDS) {
    const value = entry.fields?.[field]?.[LOCALE];
    if (typeof value === 'string') answers[field] = value;
  }
  return { answers, updatedAt: entry.sys?.updatedAt ?? null };
}

async function putAnswers(answers: Answers): Promise<Response> {
  // Read the current version first: a create needs X-Contentful-Content-Type,
  // an update needs X-Contentful-Version. Same PUT either way.
  const existing = await fetch(entryUrl(), { headers: authHeaders(), cache: 'no-store' });
  const version: number | null = existing.ok ? (await existing.json()).sys.version : null;

  const fields: Record<string, Record<string, string>> = {
    title: { [LOCALE]: 'Roadmap answers' },
  };
  for (const field of ANSWER_FIELDS) {
    fields[field] = { [LOCALE]: answers[field] };
  }

  return fetch(entryUrl(), {
    method: 'PUT',
    headers: {
      ...authHeaders(),
      'Content-Type': 'application/vnd.contentful.management.v1+json',
      ...(version === null
        ? { 'X-Contentful-Content-Type': CONTENT_TYPE_ID }
        : { 'X-Contentful-Version': String(version) }),
    },
    body: JSON.stringify({ fields }),
  });
}

export async function writeAnswers(answers: Answers): Promise<void> {
  let res = await putAnswers(answers);

  // 409 means someone wrote between our version read and our PUT — two tabs,
  // two devices, or a double-tapped Save. The version we read is simply stale,
  // so re-reading it and retrying once resolves it. Last write wins, which is
  // the intended semantics for a single shared record.
  if (res.status === 409) {
    res = await putAnswers(answers);
  }

  if (!res.ok) throw new Error(`Contentful write failed: ${res.status}`);

  // Deliberately never published: the answers stay out of the Delivery API, so
  // they cannot surface in a blog query, and a draft read is never CDN-stale.
}
