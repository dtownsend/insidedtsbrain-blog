import Link from 'next/link';
import { FolderGit2, ArrowRight } from 'lucide-react';

// Hardcoded on purpose: no `project` content type exists yet. Convert to
// Contentful only if these need frequent edits.
const PROJECTS = [
  {
    name: 'Playwright E2E Test Suite',
    subtitle: 'github.com/dtownsend/insidedtsbrain-blog',
    subtitleHref: 'https://github.com/dtownsend/insidedtsbrain-blog',
    description:
      "End-to-end suite for the newsletter subscribe flow: happy path, every error branch (400/409/500/503), API contract verification, and an accessibility scan via @axe-core/playwright; built locator-first rather than on CSS or XPath selectors. The suite passed on its first run — then the tests turned out to be exercising self-written mocks rather than the application's route code (mock drift), so a second integration layer was added, running the real route against a local fake service. Runs in CI on every push via GitHub Actions.",
    post: {
      href: '/blog/a_green_checkmark_isnt_proof_of_anything',
      title: "A Green Checkmark Isn't Proof of Anything",
    },
  },
  {
    name: 'Personal Portfolio Site & Blog',
    subtitle: 'React site built with Claude Code',
    description:
      'Includes a long-form post on building an AI-powered to-do widget end-to-end: PRD, design, Tauri vs Electron tradeoff analysis, and the decision to throw away v1 and rebuild.',
    post: {
      href: '/blog/builtaiapp',
      title: 'I Built an AI-Powered To-Do Widget',
    },
  },
];

export default function ProjectsSection() {
  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <FolderGit2 className="text-gray-700" size={24} />
        <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
      </div>

      <div className="space-y-8">
        {PROJECTS.map((project) => (
          <div key={project.name} className="bg-gray-50 rounded-xl shadow-sm p-5">
            <h3 className="font-semibold text-gray-900">{project.name}</h3>
            {project.subtitleHref ? (
              <a
                href={project.subtitleHref}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-700 break-all hover:underline"
              >
                {project.subtitle}
              </a>
            ) : (
              <p className="text-gray-700">{project.subtitle}</p>
            )}

            <p className="mt-3 text-gray-600 text-sm">{project.description}</p>

            <Link
              href={project.post.href}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-green-700 hover:text-green-800"
            >
              Read the write-up: {project.post.title}
              <ArrowRight className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
