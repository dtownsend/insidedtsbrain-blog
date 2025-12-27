import Image from 'next/image';
import { Briefcase, GraduationCap } from 'lucide-react';
import { ResumeItemEntry } from '@/lib/contentful';
import { formatMonthYear } from '@/lib/utils';

interface ResumeSectionProps {
  items: ResumeItemEntry[];
  type: 'work' | 'education';
}

export default function ResumeSection({ items, type }: ResumeSectionProps) {
  const filteredItems = items.filter((item) => item.fields.type === type);

  if (filteredItems.length === 0) return null;

  const Icon = type === 'work' ? Briefcase : GraduationCap;
  const title = type === 'work' ? 'Professional Experience' : 'Educational Experience';

  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <Icon className="text-gray-700" size={24} />
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      </div>

      <div className="space-y-8">
        {filteredItems.map((item) => {
          const logoUrl = item.fields.companyLogo?.fields?.file?.url
            ? item.fields.companyLogo.fields.file.url.startsWith('//')
              ? `https:${item.fields.companyLogo.fields.file.url}`
              : item.fields.companyLogo.fields.file.url
            : null;

          const startDate = formatMonthYear(item.fields.startDate);
          const endDate = item.fields.endDate
            ? formatMonthYear(item.fields.endDate)
            : 'Present';

          return (
            <div key={item.sys.id} className="flex gap-4">
              {/* Company Logo */}
              <div className="flex-shrink-0">
                {logoUrl ? (
                  <div className="w-16 h-16 relative rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={logoUrl}
                      alt={item.fields.companyName}
                      fill
                      className="object-contain p-2"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Icon className="text-gray-400" size={24} />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {item.fields.companyName}
                    </h3>
                    <p className="text-gray-700">{item.fields.role}</p>
                  </div>
                  <div className="text-sm text-gray-500 sm:text-right whitespace-nowrap">
                    <p>{item.fields.location}</p>
                    <p>{startDate} - {endDate}</p>
                  </div>
                </div>

                {item.fields.descriptionBullets && item.fields.descriptionBullets.length > 0 && (
                  <ul className="mt-3 space-y-1.5">
                    {item.fields.descriptionBullets.map((bullet, index) => (
                      <li
                        key={index}
                        className="text-gray-600 text-sm pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-gray-400"
                      >
                        {bullet}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
