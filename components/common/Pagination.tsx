'use client';

interface PaginationProps {
  page: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
}

const DEFAULT_SIZE_OPTIONS = [10, 20, 50, 100];

export function Pagination({
  page,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_SIZE_OPTIONS,
}: PaginationProps) {
  const from = totalElements === 0 ? 0 : page * pageSize + 1;
  const to = Math.min((page + 1) * pageSize, totalElements);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50 text-sm">
      {/* Left: showing X-Y of Z */}
      <div className="flex items-center gap-4">
        <span className="text-gray-500">
          {totalElements === 0 ? 'No results' : `${from}–${to} of ${totalElements}`}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-gray-400 text-xs">Rows:</span>
          <select
            value={pageSize}
            onChange={(e) => { onPageSizeChange(Number(e.target.value)); onPageChange(0); }}
            className="px-2 py-1 rounded border border-gray-200 text-xs text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            {pageSizeOptions.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Right: page navigation */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(0)}
          disabled={page === 0}
          className="px-2 py-1 rounded border border-gray-200 text-gray-600 disabled:opacity-40 hover:bg-white text-xs"
          title="First page"
        >
          «
        </button>
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
          className="px-3 py-1 rounded border border-gray-200 text-gray-600 disabled:opacity-40 hover:bg-white"
        >
          Previous
        </button>
        <span className="text-gray-600 px-1">
          Page {page + 1} of {Math.max(1, totalPages)}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages - 1}
          className="px-3 py-1 rounded border border-gray-200 text-gray-600 disabled:opacity-40 hover:bg-white"
        >
          Next
        </button>
        <button
          onClick={() => onPageChange(totalPages - 1)}
          disabled={page >= totalPages - 1}
          className="px-2 py-1 rounded border border-gray-200 text-gray-600 disabled:opacity-40 hover:bg-white text-xs"
          title="Last page"
        >
          »
        </button>
      </div>
    </div>
  );
}
