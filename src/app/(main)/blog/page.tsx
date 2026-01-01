import { Metadata } from 'next';
import { getPosts } from '@/lib/contentful';
import PostCard from '@/components/blog/PostCard';
import Pagination from '@/components/blog/Pagination';
import TagFilter from '@/components/blog/TagFilter';
import { POSTS_PER_PAGE } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Read my latest thoughts, stories, ideas, projects, and tech posts.',
};

interface BlogPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const skip = (currentPage - 1) * POSTS_PER_PAGE;

  let posts: Awaited<ReturnType<typeof getPosts>>['posts'] = [];
  let total = 0;

  try {
    const result = await getPosts(false, undefined, POSTS_PER_PAGE, skip);
    posts = result.posts;
    total = result.total;
  } catch (error) {
    console.error('Failed to fetch posts:', error);
  }

  const totalPages = Math.ceil(total / POSTS_PER_PAGE);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">Blog</h1>
      
      <TagFilter />

      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No posts yet. Check back soon!</p>
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
            basePath="/blog"
          />
        </>
      )}
    </div>
  );
}
