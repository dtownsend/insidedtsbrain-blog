import type { Metadata } from 'next';
import { Section, SECTIONS, SectionNav } from './_components';

export const metadata: Metadata = {
  title: 'A roadmap for your real estate website',
  description: 'A private working document. Not published, not listed.',
  robots: { index: false, follow: false, nocache: true },
};

export default function PrivateRoadmapPage() {
  return (
    <main
      id="roadmap-page"
      className="mx-auto max-w-xl px-5 pb-24 text-[17px] leading-relaxed text-gray-700"
    >
      {/* globals.css sets scroll-behavior: smooth on html site-wide. This page
          is ~12,000px, so a section-1-to-9 jump animates for most of a second
          and can't be interrupted by tapping another pill. Scoped back to
          instant here without affecting any other page. */}
      <style>{`html:has(#roadmap-page){scroll-behavior:auto}`}</style>
      <h1 className="pt-10 text-center text-2xl font-semibold tracking-tight text-gray-900">
        A roadmap for your real estate website
      </h1>
      <SectionNav />
      {SECTIONS.map((section, index) => (
        <Section
          key={section.id}
          id={section.id}
          number={index + 1}
          title={section.label}
        >
          <p>Placeholder — filled in by a later task.</p>
        </Section>
      ))}
    </main>
  );
}
