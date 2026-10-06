"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Client-side pagination over an already-filtered array. Resets to page 1 when the data changes. */
export function usePagination<T>(rows: T[], pageSize = 10) {
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));

  useEffect(() => {
    setPage(1);
  }, [rows]);

  const pageRows = useMemo(() => rows.slice((page - 1) * pageSize, page * pageSize), [rows, page, pageSize]);
  return { page: Math.min(page, pageCount), setPage, pageCount, pageRows, total: rows.length, pageSize };
}

export function Pagination({
  page,
  pageCount,
  total,
  pageSize,
  setPage,
  noun = "results",
}: {
  page: number;
  pageCount: number;
  total: number;
  pageSize: number;
  setPage: (p: number) => void;
  noun?: string;
}) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t px-4 py-3 text-sm sm:flex-row">
      <div className="text-muted-foreground">
        Showing <span className="font-medium text-foreground tabular">{from}</span>–
        <span className="font-medium text-foreground tabular">{to}</span> of{" "}
        <span className="font-medium text-foreground tabular">{total}</span> {noun}
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page <= 1}>
          <ChevronLeft /> Prev
        </Button>
        <span className="px-1 text-muted-foreground tabular">
          Page {page} of {pageCount}
        </span>
        <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page >= pageCount}>
          Next <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
