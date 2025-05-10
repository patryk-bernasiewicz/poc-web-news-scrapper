import * as React from 'react';

import { Button } from '@/components/ui/Button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number; // how many pages around the current one (default 1)
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  function getPageNumbers() {
    const pages = [];
    const start = Math.max(2, currentPage - siblingCount);
    const end = Math.min(totalPages - 1, currentPage + siblingCount);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  const pageNumbers = getPageNumbers();

  return (
    <nav className="flex justify-center mt-6">
      <ul className="inline-flex items-center gap-1 bg-muted rounded-lg px-2 py-1">
        <li>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            aria-label="First page"
          >
            «
          </Button>
        </li>
        <li>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            ‹
          </Button>
        </li>
        <li>
          <Button
            variant={currentPage === 1 ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onPageChange(1)}
            aria-current={currentPage === 1 ? 'page' : undefined}
          >
            1
          </Button>
        </li>
        {pageNumbers[0] > 2 && <span className="px-1">...</span>}
        {pageNumbers.map((page) => (
          <li key={page}>
            <Button
              variant={currentPage === page ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onPageChange(page)}
              aria-current={currentPage === page ? 'page' : undefined}
            >
              {page}
            </Button>
          </li>
        ))}
        {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
          <span className="px-1">...</span>
        )}
        {totalPages > 1 && (
          <li>
            <Button
              variant={currentPage === totalPages ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onPageChange(totalPages)}
              aria-current={currentPage === totalPages ? 'page' : undefined}
            >
              {totalPages}
            </Button>
          </li>
        )}
        <li>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Next page"
          >
            ›
          </Button>
        </li>
        <li>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            aria-label="Last page"
          >
            »
          </Button>
        </li>
      </ul>
    </nav>
  );
}
