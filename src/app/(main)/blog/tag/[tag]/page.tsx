import { Metadata } from 'next';
import { getPosts } from '@/lib/contentful';
import PostCard from '@/components/blog/PostCard';
import Pagination from '@/components/blog/Pagination';
import TagFilter from '@/components/blog/TagFilter';
import { POSTS_PER_PAGE, BLOG_TAGS } from '@/lib/constants';
import Link from 'next/link';

interface TagPageProps {
  params: Promise<{ tag: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateStaticParams() {
  return BLOG_TAGS.map((tag) => ({ tag }));
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { tag } = await params;
  const capitalizedTag = tag.charAt(0).toUpperCase() + tag.slice(1);
  
  return {
    title: `${capitalizedTag} Posts`,
    description: `Browse all posts tagged with "${tag}".`,
  };
}

export default async function TagPage({ params, searchParams }: TagPageProps) {
  const { tag } = await params;
  const resolvedSearchParams = await searchParams;
  const currentPage = Number(resolvedSearchParams.page) || 1;
  const skip = (currentPage - 1) * POSTS_PER_PAGE;

  let posts: Awaited<ReturnType<typeof getPosts>>['posts'] = [];
  let total = 0;

  try {
    const result = await getPosts(false, tag, POSTS_PER_PAGE, skip);
    posts = result.posts;
    total = result.total;
  } catch (error) {
    console.error('Failed to fetch posts:', error);
  }

  const totalPages = Math.ceil(total / POSTS_PER_PAGE);
  const capitalizedTag = tag.charAt(0).toUpperCase() + tag.slice(1);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
        {capitalizedTag}
      </h1>
      <p className="text-gray-600 mb-8">
        {total} {total === 1 ? 'post' : 'posts'} tagged with &quot;{tag}&quot;
      </p>

      <TagFilter activeTag={tag} />

      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No posts with this tag yet.</p>
          <Link
            href="/blog"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            View all posts →
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-8">
            {posts.map((post, index) => (
              <PostCard 
                key={post.sys.id} 
                post={post} 
                imagePosition={index === 0 && currentPage === 1 ? 'left' : 'right'} 
              />
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            basePath={`/blog/tag/${tag}`}
          />
        </>
      )}
    </div>
  );
}
