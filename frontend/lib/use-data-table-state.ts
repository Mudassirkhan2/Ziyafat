"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

interface DataTableStateOptions {
  defaultSortBy: string;
  defaultSortDir?: "asc" | "desc";
  defaultPageSize?: number;
}

export function useDataTableState(opts: DataTableStateOptions) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("page_size") ?? String(opts.defaultPageSize ?? 20));
  const sortBy = searchParams.get("sort_by") ?? opts.defaultSortBy;
  const sortDir = (searchParams.get("sort_dir") ?? (opts.defaultSortDir ?? "desc")) as "asc" | "desc";
  const search = searchParams.get("search") ?? "";

  const push = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [k, v] of Object.entries(updates)) {
        if (v === "") params.delete(k);
        else params.set(k, v);
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const setPage = useCallback((n: number) => push({ page: String(n) }), [push]);
  const setPageSize = useCallback(
    (n: number) => push({ page_size: String(n), page: "1" }),
    [push]
  );
  const setSort = useCallback(
    (by: string, dir: "asc" | "desc") => push({ sort_by: by, sort_dir: dir, page: "1" }),
    [push]
  );
  const setSearch = useCallback(
    (q: string) => push({ search: q, page: "1" }),
    [push]
  );

  return { page, pageSize, sortBy, sortDir, search, setPage, setPageSize, setSort, setSearch };
}
