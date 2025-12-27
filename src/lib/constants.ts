export const SITE_CONFIG = {
  name: 'David\'s Blog',
  title: 'David\'s Blog - Thoughts, Stories, and Art',
  description: 'A personal blog sharing thoughts, stories, ideas, projects, and artwork.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com',
  author: 'David',
  social: {
    twitter: 'https://twitter.com/yourusername',
    linkedin: 'https://linkedin.com/in/yourusername',
    bluesky: 'https://bsky.app/profile/yourusername',
    email: 'hello@example.com',
  },
};

export const NAV_ITEMS = [
  { label: 'Blog', href: '/blog' },
  { label: 'Art', href: '/art' },
  { label: 'Resume', href: '/resume' },
  { label: 'About', href: '/about' },
  { label: 'Subscribe', href: '/subscribe' },
];

export const BLOG_TAGS = ['thoughts', 'stories', 'ideas', 'projects', 'tech'] as const;

export const POSTS_PER_PAGE = 10;

export const SKILL_COLORS: Record<string, string> = {
  Languages: 'bg-blue-100 text-blue-800',
  Frameworks: 'bg-green-100 text-green-800',
  Tools: 'bg-purple-100 text-purple-800',
  Software: 'bg-orange-100 text-orange-800',
};
