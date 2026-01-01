import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Mail, ArrowRight } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/constants';
import { getAbout, AboutEntry } from '@/lib/contentful';
import RichTextRenderer from '@/components/shared/RichTextRenderer';

export const metadata: Metadata = {
  title: 'About',
  description: `Learn more about ${SITE_CONFIG.author} and this blog.`,
};

export default async function AboutPage() {
  let about: AboutEntry | null = null;

  try {
    about = await getAbout();
  } catch (error) {
    console.error('Failed to fetch about data:', error);
  }

  const profilePictureUrl = about?.fields?.profilePicture?.fields?.file?.url
    ? about.fields.profilePicture.fields.file.url.startsWith('//')
      ? `https:${about.fields.profilePicture.fields.file.url}`
      : about.fields.profilePicture.fields.file.url
    : null;

  const emailSubject = encodeURIComponent(`Hello from ${SITE_CONFIG.name}`);
  const mailtoLink = `mailto:${SITE_CONFIG.social.email}?subject=${emailSubject}`;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
        About
      </h1>

      <div className="prose prose-lg max-w-none">
        {/* Profile Section */}
        <div className="flex flex-col sm:flex-row gap-6 items-start mb-8 not-prose">
          <div className="w-32 h-32 flex-shrink-0 rounded-full bg-gray-200 overflow-hidden relative">
            {profilePictureUrl ? (
              <Image
                src={profilePictureUrl}
                alt={about?.fields?.headline || SITE_CONFIG.author}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl font-bold">
                {SITE_CONFIG.author.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {about?.fields?.headline || `Hi, I'm ${SITE_CONFIG.author}`}
            </h2>
            <p className="text-gray-600">
              {about?.fields?.introduction || 'Welcome to my corner of the internet where I share my thoughts, stories, artwork, and occasionally some tech musings.'}
            </p>
          </div>
        </div>

        {/* Story - Rich Text from Contentful */}
        {about?.fields?.story ? (
          <RichTextRenderer content={about.fields.story} />
        ) : (
          <>
            <h2>The Story</h2>
            <p>
              This blog is my creative outlet—a place to document ideas, share 
              projects, and explore topics that interest me. Whether it&apos;s 
              technology, art, or just random thoughts, you&apos;ll find a bit of 
              everything here.
            </p>

            <p>
              I believe in learning in public and sharing the journey, not just 
              the destination. Expect posts about things I&apos;m building, lessons 
              I&apos;m learning, and occasional deep dives into topics I find 
              fascinating.
            </p>

            <h2>What You&apos;ll Find Here</h2>
            <ul>
              <li><strong>Thoughts</strong> — Random musings and reflections</li>
              <li><strong>Stories</strong> — Personal narratives and experiences</li>
              <li><strong>Ideas</strong> — Concepts I&apos;m exploring</li>
              <li><strong>Projects</strong> — Things I&apos;m building</li>
              <li><strong>Tech</strong> — Technical posts and tutorials</li>
            </ul>

            <h2>Get in Touch</h2>
            <p>
              I love connecting with readers. Whether you have a question, want to 
              collaborate, or just want to say hi, feel free to reach out.
            </p>
          </>
        )}
      </div>

      {/* Contact CTA */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <a
          href={mailtoLink}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Mail size={20} />
          Send me an email
        </a>
        <Link
          href="/subscribe"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          Subscribe to updates
          <ArrowRight size={20} />
        </Link>
      </div>
    </div>
  );
}
