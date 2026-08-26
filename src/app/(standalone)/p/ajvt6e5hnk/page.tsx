import type { Metadata } from 'next';
import Image from 'next/image';
import AnswersForm from './_AnswersForm';
import {
  Callout,
  Card,
  CardGroup,
  Section,
  SectionNav,
  SiteCard,
} from './_components';

const SITES = [
  {
    name: 'ruthkrishnan.com',
    href: 'https://ruthkrishnan.com',
    platform: 'WordPress (nginx, PHP, Plesk)',
    note: 'The site describes them as the #1 ranked San Francisco agents by MLS volume \u2014 their claim, not my verification of it. It opens on an 88-second background video, which is by far the heaviest thing on the page.',
    image: '/roadmap/ruthkrishnan.webp',
  },
  {
    name: 'kinokorealestate.com',
    href: 'https://kinokorealestate.com',
    platform: 'Luxury Presence',
    note: 'Polished and firmly seller-focused, with big display type doing most of the work. Worth looking at for how little it puts on the first screen.',
    image: '/roadmap/kinoko.webp',
  },
  {
    name: 'siliconvalleyandbeyond.com',
    href: 'https://siliconvalleyandbeyond.com',
    platform: 'WordPress (with Site Kit by Google)',
    note: 'The Silicon Valley benchmark. Brokerage-affiliated and leaning into it \u2014 the Engel & V\u00F6lkers mark sits beside her own.',
    image: '/roadmap/svandbeyond.webp',
  },
  {
    name: 'pacificedgesf.com',
    href: 'https://pacificedgesf.com',
    platform: 'Luxury Presence',
    note: 'Built around the agents themselves rather than the inventory, and it leads with awards. The closest of the four to a personal brand.',
    image: '/roadmap/pacificedge.webp',
  },
];

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


      <Section id="platform" number={4} title="Website platform options">
        <Card title="Squarespace or Wix">
          <p>
            The easiest path. Genuinely good templates, drag-and-drop editing,
            nothing to maintain, roughly $16–25 a month.
          </p>
          <p>
            The cost is control: the real-estate-specific pieces — MLS listing
            feeds, IDX search, lead routing — are either bolted on through
            third-party add-ons or not available at all.
          </p>
        </Card>

        <CardGroup>
          <Card title="WordPress with a real estate theme" onGroup>
            <p>
              The most flexible option and the most common one in this industry.
              Themes and plugins exist for everything, and you can host it
              anywhere.
            </p>
            <p>
              The maintenance is yours. One of the sites in section 5,
              ruthkrishnan.com, is currently served by PHP 7.4 — which stopped
              receiving security fixes in November 2022. That isn&apos;t a swipe
              at them. It is what happens when keeping the site current is
              nobody&apos;s actual job.
            </p>
            <p className="text-sm text-gray-600">
              Two of the four examples:{' '}
              <a
                href="#examples"
                className="font-medium text-green-700 underline"
              >
                ruthkrishnan.com and siliconvalleyandbeyond.com
              </a>
              .
            </p>
          </Card>

          <Card title="Realtor-specific platforms" onGroup>
            <p>
              Built for this industry, so IDX search, listing pages, lead
              capture and a CRM come as standard rather than as add-ons. The
              three worth looking at:{' '}
              <a
                href="https://placester.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-green-700 underline"
              >
                Placester
              </a>
              ,{' '}
              <a
                href="https://luxurypresence.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-green-700 underline"
              >
                Luxury Presence
              </a>{' '}
              and{' '}
              <a
                href="https://sierrainteractive.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-green-700 underline"
              >
                Sierra Interactive
              </a>
              .
            </p>
            <p className="text-sm text-gray-600">
              Two of the four examples:{' '}
              <a
                href="#examples"
                className="font-medium text-green-700 underline"
              >
                kinokorealestate.com and pacificedgesf.com
              </a>
              .
            </p>
          </Card>

          {/* Inside the group, directly under the card it warns about. */}
          <Callout tone="warning">
            <p className="font-semibold">These are ongoing subscriptions.</p>
            <p className="mt-2">
              Typically several hundred dollars a month, often with a setup fee
              on top and an annual contract underneath. Over three years that is
              the largest number on this page by a wide margin. Get a written
              quote before you fall in love with a demo.
            </p>
          </Callout>
        </CardGroup>

        <Card title="A custom build">
          <p>
            Someone builds a custom site. Highest upfront cost, lowest running
            cost, and no template to fight.
          </p>
          {/* Weight rather than underline: underline is the web's link
              affordance and this section has green underlined links above. */}
          <p className="font-semibold text-gray-900">
            It only works if there is someone to maintain it afterwards. That
            ongoing relationship is the real commitment, not the build.
          </p>
        </Card>
      </Section>

      <Section id="examples" number={5} title="Bay Area examples">
        <p>
          These were pulled from a quick search of the most popular realtors in
          the Bay Area. It was not scientific.
        </p>
        <div className="space-y-6">
          {SITES.map((site) => (
            <SiteCard key={site.name} {...site} />
          ))}
        </div>
        {/* Gray-100 to match the cards, so the tie back to section 4 introduces
            no new colour. Full-width bar rather than an inline chip: at 390px
            the sentence wraps and fills the column anyway. */}
        <p className="rounded-md bg-gray-100 px-2 py-1">
          All four websites were built on either WordPress or a
          realtor-specific platform.
        </p>
      </Section>


      <Section id="found" number={6} title="Getting found">
        <Card title="Search">
          <p>
            Title pages after what people actually search for: &ldquo;Homes for
            sale in Noe Valley&rdquo; beats &ldquo;Listings&rdquo;. One page per
            neighborhood you genuinely work, each with something on it only a
            local would know to write.
          </p>
          <p>
            Register the site with{' '}
            <a
              href="https://search.google.com/search-console"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-green-700 underline"
            >
              Google Search Console
            </a>
            . It is free, and it is how you find out you are invisible before
            six months have gone by.
          </p>
        </Card>

        <Card title="Everything pointing back">
          <p>
            Your brokerage profile, Zillow, Realtor.com, LinkedIn, Instagram —
            every one of them has a website field. Put your domain in all of
            them.
          </p>
        </Card>
      </Section>

      <Section id="compliance" number={7} title="Compliance">
        <Callout tone="note">
          From what I understand, these are things strongly recommended to have
          on your website.
        </Callout>

        <Card title="IDX and MLS listings">
          <p>
            Live MLS listings on your own site means an IDX feed, and IDX comes
            with rules: your MLS has to approve it, your brokerage has to permit
            it, and there is usually a monthly fee plus a display agreement.
          </p>
          <p>
            Ask your broker before you choose a platform. That one question
            rules some options out on its own.
          </p>
        </Card>

        <Card title="Fair Housing">
          <p>
            The Equal Housing Opportunity logo belongs in your footer. So does
            the Realtor® mark if you are a NAR member, and NAR has rules about
            exactly how that mark is written.
          </p>
          <p>
            Fair Housing law also constrains the words on the site. Describing
            who a neighborhood suits, rather than what a property is, is where
            agents get into trouble.
          </p>
        </Card>

        <Card title="License and brokerage identification">
          <p>
            California requires your license number and your brokerage&apos;s
            identification on your marketing. A sitewide footer is the minimum.
          </p>
          <figure className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="relative aspect-[1170/380]">
              <Image
                src="/roadmap/svandbeyond.webp"
                alt="The top of siliconvalleyandbeyond.com: a bar reading DAWN THOMAS, DRE number 01460529, sitting above a header with the Engel and Völkers logo next to the Dawn Thomas Team logo"
                fill
                sizes="(max-width: 576px) 100vw, 536px"
                className="object-cover object-top"
              />
            </div>
            <figcaption className="border-t border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-600">
              siliconvalleyandbeyond.com puts the license number in a bar above
              the header, with the brokerage mark sized equal to her own.
            </figcaption>
          </figure>
          <p>
            Confirm the exact wording with your broker — brokerages usually have
            a required format.
          </p>
        </Card>

        <Card title="Accessibility (WCAG 2.1 AA)">
          <p>
            Real estate sites are a frequent target for ADA website claims.
            Building the site accessibly from the start costs very little.
            Retrofitting one costs a lot.
          </p>
          <p>
            Two of the four example sites run a third-party accessibility
            overlay. These are widely criticized by accessibility practitioners
            and by disabled users, they do not by themselves make a site
            conformant, and they have not reliably prevented claims. Do not
            treat one as the solution.
          </p>
        </Card>
      </Section>

      <Section id="next" number={8} title="Things to start to think about">
        <Card title="What pages the site actually needs">
          <p>
            Home. About. Listings, active and sold. Buyers. Sellers. The
            neighborhoods you work. Testimonials. Contact. That is the whole
            list, and the first version can ship with six of them.
          </p>
          <p>
            The commonest mistake is planning fifteen pages and publishing
            three. Every page you add is a page you have to keep true.
          </p>
        </Card>

        <Card title="Lead capture, and where the leads go">
          <p>
            A form, and a decision about where what it collects ends up — your
            inbox, a spreadsheet, or a CRM. Pick one before the site is live,
            not after the first lead is lost.
          </p>
          <p>
            Both Luxury Presence sites in section 5 do the simplest version of
            this well: a call button and an email button floating above the
            page, staying put as you scroll. On a phone that is close to the
            whole lead-capture strategy, and it works.
          </p>
          <p>
            The moment you collect a name and an email you need a privacy
            policy.
          </p>
        </Card>
      </Section>

      <Section id="thoughts" number={9} title="Your thoughts">
        <Callout tone="note">
          Whatever you type here is saved so you can close the page and come
          back to it.
        </Callout>
        <AnswersForm />
      </Section>
    </main>
  );
}
