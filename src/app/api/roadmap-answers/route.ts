import { NextResponse } from 'next/server';
import {
  ANSWER_FIELDS,
  EMPTY_ANSWERS,
  MAX_FIELD_LENGTH,
  readAnswers,
  writeAnswers,
  type Answers,
} from '@/lib/roadmapAnswers';

export const dynamic = 'force-dynamic';

const MAX_BODY_BYTES = 20_000;

export async function GET() {
  try {
    return NextResponse.json(await readAnswers());
  } catch {
    return NextResponse.json({ error: 'Could not load answers' }, { status: 502 });
  }
}

export async function POST(request: Request) {
  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'Body too large' }, { status: 413 });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  // Allowlist. Anything not in ANSWER_FIELDS is dropped here and never reaches
  // Contentful — this endpoint is public, so the body is untrusted input.
  const body = parsed as Record<string, unknown>;
  const answers: Answers = { ...EMPTY_ANSWERS };
  for (const field of ANSWER_FIELDS) {
    const value = body[field];
    if (value === undefined) continue;
    if (typeof value !== 'string') {
      return NextResponse.json({ error: `${field} must be text` }, { status: 400 });
    }
    if (value.length > MAX_FIELD_LENGTH) {
      return NextResponse.json({ error: `${field} is too long` }, { status: 400 });
    }
    answers[field] = value;
  }

  try {
    await writeAnswers(answers);
  } catch {
    return NextResponse.json({ error: 'Could not save answers' }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
