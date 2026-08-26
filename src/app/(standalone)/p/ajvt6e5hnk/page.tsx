import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'A roadmap for your real estate website',
  description: 'A private working document. Not published, not listed.',
  robots: { index: false, follow: false, nocache: true },
};

export default function PrivateRoadmapPage() {
  return (
    <main className="mx-auto max-w-xl px-5 pb-24">
      <h1 className="pt-10 text-2xl font-semibold tracking-tight text-gray-900">
        A roadmap for your real estate website
      </h1>
    </main>
  );
}
