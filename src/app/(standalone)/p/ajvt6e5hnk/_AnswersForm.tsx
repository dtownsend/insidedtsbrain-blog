'use client';

import { useEffect, useState } from 'react';
import {
  EMPTY_ANSWERS,
  MAX_FIELD_LENGTH,
  type AnswerField,
  type Answers,
} from '@/lib/roadmapAnswers';

const QUESTIONS: { field: AnswerField; label: string }[] = [
  {
    field: 'liked',
    label:
      'Which of the four sites in section 5 did you like, and what specifically — the layout, the photography, the tone?',
  },
  {
    field: 'disliked',
    label: 'Which one did you dislike? That is usually the more useful answer.',
  },
  {
    field: 'budget',
    label:
      'What are you comfortable spending, upfront and per month? A range is fine.',
  },
  { field: 'maintenance', label: 'How much do you want to run yourself?' },
  { field: 'bilingual', label: 'Bilingual — yes or no, and which language?' },
  { field: 'idx', label: 'Have you asked your broker about IDX yet?' },
  {
    field: 'otherSite',
    label: 'Is there a site — realtor or not — whose feel you just like?',
  },
];

type Status = 'loading' | 'ready' | 'saving' | 'saved' | 'error';

const STATUS_TEXT: Record<Status, string> = {
  loading: 'Loading your answers…',
  ready: '',
  saving: 'Saving…',
  saved: 'Saved. You can close this and come back to it later.',
  error: 'Something went wrong. Your answers are still in the boxes — try again.',
};

export default function AnswersForm() {
  const [answers, setAnswers] = useState<Answers>(EMPTY_ANSWERS);
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    let cancelled = false;
    fetch('/api/roadmap-answers')
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data) => {
        if (cancelled) return;
        setAnswers(data.answers);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus('saving');
    try {
      const res = await fetch('/api/roadmap-answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answers),
      });
      setStatus(res.ok ? 'saved' : 'error');
    } catch {
      setStatus('error');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {QUESTIONS.map(({ field, label }, index) => (
        <div key={field}>
          <label
            htmlFor={field}
            className="block text-[15px] font-medium leading-snug text-gray-900"
          >
            <span className="text-green-700">{index + 1}.</span> {label}
          </label>
          {/* maxLength mirrors the server cap as a courtesy, not a guard — the
              guard is in the route, because a client cap is trivially bypassed. */}
          <textarea
            id={field}
            name={field}
            rows={3}
            maxLength={MAX_FIELD_LENGTH}
            value={answers[field]}
            disabled={status === 'loading'}
            onChange={(event) =>
              setAnswers((current) => ({ ...current, [field]: event.target.value }))
            }
            className="mt-2 w-full rounded-xl border border-gray-300 bg-white p-3 text-[17px] leading-relaxed text-gray-900 disabled:bg-gray-100"
          />
        </div>
      ))}

      <button
        type="submit"
        disabled={status === 'loading' || status === 'saving'}
        className="flex min-h-[44px] w-full items-center justify-center rounded-xl bg-green-700 px-5 font-medium text-white transition-[transform,background-color] duration-150 ease-out active:scale-[0.98] disabled:bg-gray-500 [@media(hover:hover)]:hover:bg-green-800"
      >
        {status === 'saving' ? 'Saving…' : 'Save my answers'}
      </button>

      {/* aria-live so the outcome reaches a screen reader, not just the eye. */}
      <p aria-live="polite" className="min-h-[24px] text-sm text-gray-600">
        {STATUS_TEXT[status]}
      </p>
    </form>
  );
}
