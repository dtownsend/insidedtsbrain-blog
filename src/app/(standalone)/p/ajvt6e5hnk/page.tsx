import type { Metadata } from 'next';
import { Card, Section, SECTIONS, SectionNav } from './_components';

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

      <Section id="start" number={1} title="Start here">
        {/* David's copy, finalised in the canvas 2026-08-26. Rendered as
            separate paragraphs rather than the canvas's <br> breaks: same
            visual rhythm at space-y-5, but semantically correct and consistent
            (the canvas mixes <br>&nbsp;<br> and <br><br> for the same gap). */}
        <p>
          This is a visual representation of the things needed to create a
          realtor website
        </p>
        <p>
          This page is on a non-searchable section of my blog; only people with
          this link will see it. Still, don&apos;t put anything personal or NSFW
          here; it is not secure.
        </p>
        <p>
          I can make something more secure if you decide you want to proceed
          with making a website
        </p>
        <p>I know how much you love organization 🤪</p>
        <p>
          Go through the sections and answer the questions in section 9. They
          will stay on the page even if you close the page
        </p>
      </Section>

      <Section id="domain" number={2} title="Domain name">
        <Card title="Create a Cloudflare account">
          <p>
            Cloudflare sells domains at cost — no markup on the wholesale price,
            and no cheap first year that quadruples on renewal. You also get
            DNS, the switchboard that points your domain at whatever site you
            end up building, in the same account.
          </p>
          <p>
            Signing up is free; you pay only for the domain itself.{' '}
            <a
              href="https://dash.cloudflare.com/sign-up"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-green-700 underline"
            >
              Create an account
            </a>
            .
          </p>
        </Card>

        <Card title="Choose and register the domain">
          <p>
            Your own name is the safest choice —{' '}
            <span className="whitespace-nowrap">yourname.com</span>, or
            yournamerealestate.com / yournamehomes.com if the plain one is
            taken. It survives a change of brokerage, a change of specialty and
            a change of city.
          </p>
          <p>What to avoid:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Hyphens and creative spellings — you will spell it out loud every
              time.
            </li>
            <li>
              Your brokerage&apos;s name. You don&apos;t own it, and it leaves
              with you.
            </li>
            <li>A neighborhood you might not be farming in three years.</li>
            <li>
              <code className="rounded bg-black/5 px-1 py-0.5 text-sm">
                .net
              </code>
              ,{' '}
              <code className="rounded bg-black/5 px-1 py-0.5 text-sm">
                .biz
              </code>
              ,{' '}
              <code className="rounded bg-black/5 px-1 py-0.5 text-sm">
                .info
              </code>{' '}
              — get the{' '}
              <code className="rounded bg-black/5 px-1 py-0.5 text-sm">
                .com
              </code>{' '}
              or pick a different name.
            </li>
          </ul>
          <p className="font-semibold text-gray-900">
            Budget roughly $10–15 a year.
          </p>
        </Card>
      </Section>

      <Section id="email" number={3} title="Professional email">
        <p>
          Would strongly recommend having a professional email using whatever
          domain name you choose.
        </p>

        <Card title="Google Workspace on your domain">
          <p>
            It&apos;s the same Gmail, Calendar and Drive you already use,
            running on your domain. Sign up for{' '}
            <a
              href="https://workspace.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-green-700 underline"
            >
              Google Workspace
            </a>
            .
          </p>
          <p>
            I recommend starting with the Starter plan to see if you like it.
            The first two weeks are free, after which it&apos;s roughly $8 a
            month.
          </p>
          {/* Bold closing cost line — the same pattern §2 uses. In the canvas
              these are <br>-separated inside one <p>; separate paragraphs here,
              matching Deviation 24's reasoning. */}
          <p className="font-semibold text-gray-900">
            Budget roughly $8 a month for 1 user.
          </p>
        </Card>
      </Section>

      {SECTIONS.slice(3).map((section, index) => (
        <Section
          key={section.id}
          id={section.id}
          number={index + 4}
          title={section.label}
        >
          <p>Placeholder — filled in by a later task.</p>
        </Section>
      ))}
    </main>
  );
}
