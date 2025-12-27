import Link from 'next/link';
import { ArrowRight, Palette, FileText, BookOpen } from 'lucide-react';
import { getPosts } from '@/lib/contentful';
import PostCard from '@/components/blog/PostCard';
import { SITE_CONFIG } from '@/lib/constants';

export default async function Home() {
  let recentPosts: Awaited<ReturnType<typeof getPosts>>['posts'] = [];

  try {
    const { posts } = await getPosts(false, undefined, 3, 0);
    recentPosts = posts;
  } catch (error) {
    console.error('Failed to fetch posts:', error);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      {/* Hero Section */}
      <section className="py-16 md:py-24 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
          Welcome to {SITE_CONFIG.name}
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          A place for thoughts, stories, ideas, and artwork. Join me on this creative journey.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            <BookOpen size={20} />
            Read the Blog
          </Link>
          <Link
            href="/subscribe"
            className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Subscribe
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Featured Sections */}
      <section className="py-12 grid md:grid-cols-3 gap-8">
        <Link
          href="/blog"
          className="group p-6 border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-lg transition-all"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
            <BookOpen className="text-blue-600" size={24} />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Blog</h2>
          <p className="text-gray-600">
            Thoughts, stories, ideas, projects, and tech musings.
          </p>
        </Link>

        <Link
          href="/art"
          className="group p-6 border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-lg transition-all"
        >
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
            <Palette className="text-purple-600" size={24} />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Art Gallery</h2>
          <p className="text-gray-600">
            2D sketches, renderings, and visual explorations.
          </p>
        </Link>

        <Link
          href="/resume"
          className="group p-6 border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-lg transition-all"
        >
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
            <FileText className="text-green-600" size={24} />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Resume</h2>
          <p className="text-gray-600">
            Professional experience, education, and skills.
          </p>
        </Link>
      </section>

      {/* Recent Posts */}
      {recentPosts.length > 0 && (
        <section className="py-12 border-t border-gray-200">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Recent Posts</h2>
            <Link
              href="/blog"
              className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 font-medium"
            >
              View all
              <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {recentPosts.map((post) => (
              <PostCard key={post.sys.id} post={post} />
            ))}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 text-center border-t border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Stay Updated
        </h2>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Subscribe to my newsletter to get notified when I publish new content.
        </p>
        <Link
          href="/subscribe"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
        >
          Subscribe Now
          <ArrowRight size={20} />
        </Link>
      </section>
    </div>
  );
}
