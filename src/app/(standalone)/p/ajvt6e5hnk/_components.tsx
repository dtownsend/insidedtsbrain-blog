import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';

export const SECTIONS = [
  { id: 'start', label: 'Start here' },
  { id: 'domain', label: 'Domain' },
  { id: 'email', label: 'Email' },
  { id: 'platform', label: 'Platform' },
  { id: 'examples', label: 'Examples' },
  { id: 'found', label: 'Getting found' },
  { id: 'compliance', label: 'Compliance' },
  { id: 'next', label: 'To think about' },
  { id: 'thoughts', label: 'Your thoughts' },
] as const;

// Screenshots are all captured at the same size; see the spec's capture method.
export const SHOT_W = 1170;
export const SHOT_H = 1560;

const SHOT_SIZES = '(max-width: 576px) 100vw, 536px';

export function SectionNav() {
  return (
    // A 3-column grid so all nine are visible at once. Deliberately NOT sticky:
    // nine pills stand ~175px tall, and giving up a fifth of a 390x844 phone
    // permanently is worse than the horizontal scroller this replaced.
    // Gray-100 card, matching Card, rather than a full-bleed band with rules:
    // straight hairlines across a rounded corner read as broken, and a
    // full-bleed radius puts its own corners off the edge of the screen.
    <nav
      aria-label="Sections"
      className="mt-8 grid grid-cols-3 gap-2 rounded-xl bg-gray-100 p-3"
    >
      {SECTIONS.map((section, index) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          className="flex min-h-[44px] items-center justify-center rounded-xl border border-green-200 bg-green-100 px-2 py-1.5 text-center text-[13px] font-medium leading-tight text-green-800 transition-[transform,background-color] duration-150 ease-out active:scale-[0.97] [@media(hover:hover)]:hover:bg-green-200"
        >
          {/* Non-breaking space keeps the number with the first word when a
              long label wraps to two lines. */}
          <span>
            <span className="font-semibold">{index + 1}</span>
            {'\u00A0'}
            {section.label}
          </span>
        </a>
      ))}
    </nav>
  );
}

export function Section({
  id,
  number,
  title,
  children,
}: {
  id: string;
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      // Space alone separates sections: 56px plus the numbered badge already
      // marks the start, so a border-t would be a third signal doing the same
      // job. scroll-mt is now just breathing room on arrival — there is no
      // sticky bar left to clear.
      className="mt-14 scroll-mt-8 first-of-type:mt-8"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-700 text-sm font-semibold text-white">
          {number}
        </span>
        <h2 className="text-xl font-semibold tracking-tight text-gray-900">
          {title}
        </h2>
      </div>
      <div className="mt-4 space-y-5">{children}</div>
    </section>
  );
}

export function Card({
  title,
  children,
  onGroup = false,
}: {
  title: string;
  children: React.ReactNode;
  onGroup?: boolean;
}) {
  return (
    // Fill only, no border: fifteen bordered boxes on one page flattened the
    // hierarchy against the callouts, which do keep a border. Inside a
    // CardGroup the group carries the gray, so the card flips to white.
    <div
      className={`rounded-xl px-4 pb-[18px] pt-4 ${onGroup ? 'bg-white' : 'bg-gray-100'}`}
    >
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <div className="mt-2 space-y-3 text-gray-700">{children}</div>
    </div>
  );
}

// Wraps the two platforms the section-5 examples actually use. No text label —
// the grouping is carried by fill and border alone (Deviation 18). The group
// takes the card gray and the cards inside it flip to white, so the nesting
// reads; a 16px radius against the cards' 12px keeps it a level above a plain
// Card without competing with a Callout.
export function CardGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-4 rounded-2xl border border-green-200 bg-gray-100 p-4">
      {children}
    </div>
  );
}

const CALLOUT_TONE = {
  note: 'border-green-200 bg-green-50 text-green-900',
  warning: 'border-amber-300 bg-amber-50 text-amber-900',
} as const;

export function Callout({
  tone = 'note',
  children,
}: {
  tone?: keyof typeof CALLOUT_TONE;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-xl border p-4 leading-relaxed ${CALLOUT_TONE[tone]}`}>
      {children}
    </div>
  );
}

export function SiteCard({
  name,
  href,
  platform,
  note,
  image,
}: {
  name: string;
  href: string;
  platform: string;
  note: string;
  image: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="block overflow-hidden rounded-xl border border-gray-200 bg-white transition-[transform,border-color] duration-150 ease-out active:scale-[0.985] [@media(hover:hover)]:hover:border-gray-300"
    >
      {/* Cropped to 16:9 rather than the native 0.75: four full heroes ran
          ~1870px of image in a ~12,000px page, and these are thumbnails. 16:9
          over 3:2 because kinoko's headline spans nearly the whole capture —
          a 3:2 band sliced horizontally through "Francisco", while the shorter
          band lands in the gap between headline lines. Checked against all
          four; none cuts through text. */}
      <Image
        src={image}
        alt={`The ${name} home page as it looks on a phone`}
        width={SHOT_W}
        height={SHOT_H}
        sizes={SHOT_SIZES}
        className="aspect-[16/9] w-full border-b border-gray-200 object-cover object-top"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
        <p className="mt-1 text-sm text-gray-600">Built on {platform}</p>
        <p className="mt-2 text-gray-700">{note}</p>
        {/* No min-h-[44px] here — the whole card is the tap target, so a 44px
            floor on this line is just dead space inside it. */}
        <p className="mt-3 flex items-center gap-1.5 text-sm font-medium text-green-700">
          Open in a new tab
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </p>
      </div>
    </a>
  );
}
