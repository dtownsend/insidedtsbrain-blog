import Link from 'next/link';
import Image from 'next/image';
import { formatDate } from '@/lib/utils';
import { PostEntry } from '@/lib/contentful';

interface PostCardProps {
  post: PostEntry;
}

export default function PostCard({ post }: PostCardProps) {
  const { title, slug, excerpt, featuredImage, tags, publishDate } = post.fields;

  const imageUrl = featuredImage?.fields?.file?.url
    ? featuredImage.fields.file.url.startsWith('//')
      ? `https:${featuredImage.fields.file.url}`
      : featuredImage.fields.file.url
    : null;

  return (
    <article className="group">
      <Link href={`/blog/${slug}`} className="block">
        {imageUrl && (
          <div className="relative aspect-[16/9] mb-4 overflow-hidden rounded-lg bg-gray-100">
            <Image
              src={imageUrl}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}
        <div className="space-y-2">
          <time className="text-sm text-gray-500" dateTime={publishDate}>
            {formatDate(publishDate)}
          </time>
          <h2 className="text-xl font-bold text-gray-900 group-hover:text-gray-600 transition-colors">
            {title}
          </h2>
          <p className="text-gray-600 line-clamp-2">{excerpt}</p>
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </article>
  );
}
