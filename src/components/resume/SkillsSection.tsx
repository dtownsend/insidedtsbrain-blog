import { ChevronDown } from 'lucide-react';
import { SkillEntry } from '@/lib/contentful';
import { SKILL_COLORS } from '@/lib/constants';

interface SkillsSectionProps {
  skills: SkillEntry[];
}

// Render order. Categories that exist in Contentful but aren't listed here
// are appended after these, unstyled, so a retag typo shows up instead of
// disappearing silently.
const CATEGORY_ORDER: readonly string[] = [
  'Sensor & AR/VR Validation',
  'Lab Environments',
  'Automation & CI',
  'QA Methodology',
  'Creative Tools',
  'Platforms & Code',
  'Tools',
];

// How many categories start open on desktop. Phones start fully collapsed.
const OPEN_BY_DEFAULT = 2;

// Runs while the HTML is still parsing, before hydration, so phones never
// flash the expanded lists. 767px is just under Tailwind's md breakpoint.
const COLLAPSE_ON_MOBILE =
  "if(window.matchMedia('(max-width: 767px)').matches){document.querySelectorAll('[data-skills] details[open]').forEach(function(d){d.removeAttribute('open')})}";

export default function SkillsSection({ skills }: SkillsSectionProps) {
  const groupedSkills = skills.reduce((acc, skill) => {
    const category = skill.fields.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(skill.fields.name);
    return acc;
  }, {} as Record<string, string[]>);

  const categories = [
    ...CATEGORY_ORDER.filter((c) => groupedSkills[c]),
    ...Object.keys(groupedSkills).filter((c) => !CATEGORY_ORDER.includes(c)),
  ];

  return (
    <div className="space-y-3" data-skills>
      <h2 className="font-semibold text-gray-900">Skills</h2>
      {categories.map((category, index) => {
        const categorySkills = groupedSkills[category];

        return (
          <details
            key={category}
            open={index < OPEN_BY_DEFAULT}
            suppressHydrationWarning
            className={`group/skill ${index === 0 ? '' : 'border-t border-gray-100 pt-3'}`}
          >
            <summary className="flex items-center justify-between gap-2 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden">
              <span className="text-xs text-gray-500 uppercase tracking-wide">
                {category}{' '}
                <span className="normal-case tracking-normal">
                  ({categorySkills.length})
                </span>
              </span>
              <ChevronDown
                size={16}
                className="flex-shrink-0 text-gray-400 transition-transform group-open/skill:rotate-180"
                aria-hidden="true"
              />
            </summary>
            <ul className="flex flex-wrap gap-2 mt-2">
              {categorySkills.map((skill) => (
                <li
                  key={skill}
                  className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                    SKILL_COLORS[category] || 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {skill}
                </li>
              ))}
            </ul>
          </details>
        );
      })}
      <script dangerouslySetInnerHTML={{ __html: COLLAPSE_ON_MOBILE }} />
    </div>
  );
}
