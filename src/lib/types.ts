import { Document } from '@contentful/rich-text-types';

export interface Post {
  title: string;
  slug: string;
  body: Document;
  excerpt: string;
  featuredImage?: {
    url: string;
    width: number;
    height: number;
    title: string;
  };
  tags: string[];
  publishDate: string;
}

export interface Artwork {
  title: string;
  image: {
    url: string;
    width: number;
    height: number;
    title: string;
  };
  description?: string;
  medium?: string;
  createdDate: string;
  tags?: string[];
}

export interface Page {
  title: string;
  slug: string;
  body: Document;
  metaDescription?: string;
}

export interface ResumeItem {
  companyName: string;
  companyLogo?: {
    url: string;
    width: number;
    height: number;
  };
  role: string;
  location: string;
  startDate: string;
  endDate?: string;
  descriptionBullets: string[];
  type: 'work' | 'education';
}

export interface Skill {
  name: string;
  category: 'Languages' | 'Frameworks' | 'Tools' | 'Software';
}

export interface SiteMetadata {
  title: string;
  description: string;
  siteUrl: string;
  author: string;
  social: {
    twitter?: string;
    linkedin?: string;
    bluesky?: string;
    email?: string;
  };
}
