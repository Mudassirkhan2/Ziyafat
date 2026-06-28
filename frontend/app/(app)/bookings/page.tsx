"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { useBookings } from "@/lib/bookings-api";
import { useDataTableState } from "@/lib/use-data-table-state";
import type { Booking, BookingStatus } from "@/lib/types";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { FiPlus } from "react-icons/fi";

const STATUS_COLORS: Record<BookingStatus, string> = {
  confirmed: "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
  in_progress: "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
  completed: "bg-surface-highest text-on-surface-medium border-outline",
  cancelled: "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
};

function statusLabel(s: BookingStatus) {
  return s === "in_progress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getColumns(): ColumnDef<Booking>[] {
  return [
    {
      id: "title",
      header: "Title",
      accessorKey: "title",
      meta: { sortable: true },
      cell: ({ row }) => (
        <span className="font-medium text-on-surface">{row.original.title}</span>
      ),
    },
    {
      id: "customer_name",
      header: "Customer",
      accessorKey: "customer_name",
      cell: ({ row }) => (
        <span className="text-on-surface-medium">{row.original.customer_name}</span>
      ),
    },
    {
      id: "status",
      header: "Status",
      accessorKey: "status",
      meta: { sortable: true },
      cell: ({ row }) => (
        <Badge variant="outline" className={STATUS_COLORS[row.original.status as BookingStatus]}>
          {statusLabel(row.original.status as BookingStatus)}
        </Badge>
      ),
    },
    {
      id: "created_at",
      header: "Created",
      accessorKey: "created_at",
      meta: { sortable: true },
      cell: ({ row }) => (
        <span className="text-on-surface-medium">{formatDate(row.original.created_at)}</span>
      ),
    },
  ];
}

function BookingsContent() {
  const router = useRouter();
  const ts = useDataTableState({ defaultSortBy: "created_at", defaultSortDir: "desc" });

  const { data, isLoading, isError } = useBookings({
    search: ts.search || undefined,
    page: ts.page,
    pageSize: ts.pageSize,
    sortBy: ts.sortBy,
    sortDir: ts.sortDir,
  });

  const columns = getColumns();
  function handleRowClick(booking: Booking) {
    router.push(`/bookings/${booking.id}`);
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-on-surface">Bookings</h1>
        <Button onClick={() => router.push("/bookings/new")}>
          <FiPlus className="h-4 w-4 mr-1" /> New Booking
        </Button>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Search by title…"
          value={ts.search}
          onChange={(e) => ts.setSearch(e.target.value)}
          className="max-w-xs bg-surface border-outline text-on-surface"
        />
      </div>

      {isError && (
        <p className="text-destructive text-sm mb-4">Failed to load bookings. Please try again.</p>
      )}

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        total={data?.total ?? 0}
        page={ts.page}
        pageSize={ts.pageSize}
        onPageChange={ts.setPage}
        onPageSizeChange={ts.setPageSize}
        onSortChange={ts.setSort}
        sortBy={ts.sortBy}
        sortDir={ts.sortDir}
        isLoading={isLoading}
        onRowClick={handleRowClick}
        emptyState={
          <EmptyState
            variant="bookings"
            title="No bookings found"
            description="Create your first booking to get started."
          />
        }
      />
    </div>
  );
}

export default function BookingsPage() {
  return (
    <Suspense fallback={null}>
      <BookingsContent />
    </Suspense>
  );
}
