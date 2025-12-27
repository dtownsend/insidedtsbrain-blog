import { SkillEntry } from '@/lib/contentful';
import { SKILL_COLORS } from '@/lib/constants';

interface SkillsSectionProps {
  skills: SkillEntry[];
}

export default function SkillsSection({ skills }: SkillsSectionProps) {
  const groupedSkills = skills.reduce((acc, skill) => {
    const category = skill.fields.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(skill.fields.name);
    return acc;
  }, {} as Record<string, string[]>);

  const categories = ['Languages', 'Frameworks', 'Tools', 'Software'] as const;

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900">Skills</h3>
      {categories.map((category) => {
        const categorySkills = groupedSkills[category];
        if (!categorySkills || categorySkills.length === 0) return null;

        return (
          <div key={category}>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
              {category}
            </p>
            <div className="flex flex-wrap gap-2">
              {categorySkills.map((skill) => (
                <span
                  key={skill}
                  className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                    SKILL_COLORS[category] || 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
