import Link from 'next/link';
import { cn } from '@/lib/utils';
import { BLOG_TAGS } from '@/lib/constants';

interface TagFilterProps {
  activeTag?: string;
}

export default function TagFilter({ activeTag }: TagFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-8">
      <Link
        href="/blog"
        className={cn(
          'px-4 py-2 rounded-full text-sm font-medium transition-colors',
          !activeTag
            ? 'bg-gray-900 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        )}
      >
        All
      </Link>
      {BLOG_TAGS.map((tag) => (
        <Link
          key={tag}
          href={`/blog/tag/${tag}`}
          className={cn(
            'px-4 py-2 rounded-full text-sm font-medium transition-colors capitalize',
            activeTag === tag
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          )}
        >
          {tag}
        </Link>
      ))}
    </div>
  );
}
