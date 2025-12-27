import { format, parseISO } from 'date-fns';

export function formatDate(dateString: string, formatStr = 'MMMM d, yyyy'): string {
  return format(parseISO(dateString), formatStr);
}

export function formatYear(dateString: string): string {
  return format(parseISO(dateString), 'yyyy');
}

export function formatMonthYear(dateString: string): string {
  return format(parseISO(dateString), 'MMM yyyy');
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function getImageUrl(url: string, width?: number, quality = 80): string {
  if (!url) return '';
  const baseUrl = url.startsWith('//') ? `https:${url}` : url;
  const params = new URLSearchParams();
  if (width) params.set('w', width.toString());
  params.set('q', quality.toString());
  params.set('fm', 'webp');
  return `${baseUrl}?${params.toString()}`;
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length).trim() + '...';
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
