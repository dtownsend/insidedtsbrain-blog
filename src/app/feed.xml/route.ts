import { getPosts, isContentfulConfigured } from '@/lib/contentful';
import { SITE_CONFIG } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export async function GET() {
  let posts: Awaited<ReturnType<typeof getPosts>>['posts'] = [];

  if (isContentfulConfigured()) {
    try {
      const result = await getPosts(false, undefined, 50, 0);
      posts = result.posts;
    } catch (error) {
      console.error('Failed to fetch posts for RSS:', error);
    }
  }

  const rssItems = posts
    .map((post) => {
      const { title, slug, excerpt, publishDate } = post.fields;
      const url = `${SITE_CONFIG.url}/blog/${slug}`;
      const pubDate = new Date(publishDate).toUTCString();

      return `
    <item>
      <title><![CDATA[${title}]]></title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description><![CDATA[${excerpt}]]></description>
      <pubDate>${pubDate}</pubDate>
    </item>`;
    })
    .join('');

  const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_CONFIG.name}</title>
    <link>${SITE_CONFIG.url}</link>
    <description>${SITE_CONFIG.description}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_CONFIG.url}/feed.xml" rel="self" type="application/rss+xml"/>
    ${rssItems}
  </channel>
</rss>`;

  return new Response(rssFeed, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
