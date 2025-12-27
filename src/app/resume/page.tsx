import { Metadata } from 'next';
import { MapPin, Linkedin, Mail, Download } from 'lucide-react';
import { getResumeItems, getSkills } from '@/lib/contentful';
import ResumeSection from '@/components/resume/ResumeSection';
import SkillsSection from '@/components/resume/SkillsSection';
import { SITE_CONFIG } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Resume',
  description: 'View my professional experience, education, and skills.',
};

export default async function ResumePage() {
  let resumeItems: Awaited<ReturnType<typeof getResumeItems>> = [];
  let skills: Awaited<ReturnType<typeof getSkills>> = [];

  try {
    [resumeItems, skills] = await Promise.all([
      getResumeItems(),
      getSkills(),
    ]);
  } catch (error) {
    console.error('Failed to fetch resume data:', error);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex flex-col md:flex-row gap-8 md:gap-12">
        {/* Sidebar */}
        <aside className="md:w-72 flex-shrink-0">
          <div className="sticky top-24 space-y-6">
            {/* Profile */}
            <div className="text-center md:text-left">
              <div className="w-32 h-32 mx-auto md:mx-0 rounded-full bg-gray-200 overflow-hidden mb-4">
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl font-bold">
                  {SITE_CONFIG.author.charAt(0)}
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                {SITE_CONFIG.author}
              </h1>
              <p className="text-gray-600 mt-1">Software Developer</p>
            </div>

            {/* Bio */}
            <p className="text-gray-600 text-sm">
              Passionate about building great software and creating meaningful experiences.
            </p>

            {/* Location */}
            <div className="flex items-center gap-2 text-gray-600 text-sm justify-center md:justify-start">
              <MapPin size={16} />
              <span>San Francisco, CA</span>
            </div>

            {/* Social Links */}
            <div className="flex gap-3 justify-center md:justify-start">
              {SITE_CONFIG.social.linkedin && (
                <a
                  href={SITE_CONFIG.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin size={20} />
                </a>
              )}
              {SITE_CONFIG.social.email && (
                <a
                  href={`mailto:${SITE_CONFIG.social.email}`}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Email"
                >
                  <Mail size={20} />
                </a>
              )}
            </div>

            {/* Skills */}
            {skills.length > 0 && <SkillsSection skills={skills} />}

            {/* Download PDF */}
            <a
              href="/resume.pdf"
              className="flex items-center justify-center gap-2 w-full px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download size={18} />
              Download PDF
            </a>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {resumeItems.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <p className="text-gray-600">Resume content coming soon.</p>
            </div>
          ) : (
            <>
              <ResumeSection items={resumeItems} type="work" />
              <ResumeSection items={resumeItems} type="education" />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
