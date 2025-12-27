import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
}

export default function Pagination({ currentPage, totalPages, basePath }: PaginationProps) {
  if (totalPages <= 1) return null;

  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  const prevPath = currentPage === 2 ? basePath : `${basePath}?page=${currentPage - 1}`;
  const nextPath = `${basePath}?page=${currentPage + 1}`;

  return (
    <nav className="flex items-center justify-center gap-4 mt-12" aria-label="Pagination">
      {hasPrev ? (
        <Link
          href={prevPath}
          className="flex items-center gap-1 px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
        >
          <ChevronLeft size={20} />
          Previous
        </Link>
      ) : (
        <span className="flex items-center gap-1 px-4 py-2 text-gray-400 cursor-not-allowed">
          <ChevronLeft size={20} />
          Previous
        </span>
      )}

      <span className="text-gray-600">
        Page {currentPage} of {totalPages}
      </span>

      {hasNext ? (
        <Link
          href={nextPath}
          className="flex items-center gap-1 px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
        >
          Next
          <ChevronRight size={20} />
        </Link>
      ) : (
        <span className="flex items-center gap-1 px-4 py-2 text-gray-400 cursor-not-allowed">
          Next
          <ChevronRight size={20} />
        </span>
      )}
    </nav>
  );
}
