"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useQuotations } from "@/lib/quotations-api";
import { useBookingsForSelect } from "@/lib/bookings-api";
import { useDataTableState } from "@/lib/use-data-table-state";
import type { Booking, Quotation, QuotationStatus } from "@/lib/types";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { FiPlus } from "react-icons/fi";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ALL_STATUSES: QuotationStatus[] = [
  "draft",
  "sent",
  "approved",
  "rejected",
  "superseded",
];

const STATUS_COLORS: Record<QuotationStatus, string> = {
  draft: "border-outline text-on-surface-medium",
  sent: "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
  approved: "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
  rejected: "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
  superseded: "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function StatusBadge({ status }: { status: QuotationStatus }) {
  return (
    <Badge variant="outline" className={STATUS_COLORS[status]}>
      {capitalize(status)}
    </Badge>
  );
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------

function getColumns(bookingMap: Map<string, Booking>): ColumnDef<Quotation>[] {
  return [
    {
      id: "booking",
      header: "Booking",
      cell: ({ row }) => {
        const booking = bookingMap.get(row.original.booking_id);
        return (
          <span className="font-medium text-on-surface">
            {booking ? booking.title : row.original.booking_id}
          </span>
        );
      },
    },
    {
      id: "status",
      header: "Status",
      accessorKey: "status",
      meta: { sortable: true },
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "total",
      header: "Total",
      accessorKey: "total",
      meta: { sortable: true },
      cell: ({ row }) => (
        <span className="text-on-surface-medium">
          ₹{row.original.total.toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      id: "valid_until",
      header: "Valid Until",
      cell: ({ row }) => (
        <span className="text-on-surface-medium">{formatDate(row.original.valid_until)}</span>
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

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

function QuotationsContent() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<QuotationStatus | undefined>(undefined);
  const ts = useDataTableState({ defaultSortBy: "created_at", defaultSortDir: "desc" });

  const { data: bookings } = useBookingsForSelect();

  const { data, isLoading, isError } = useQuotations({
    status: statusFilter,
    page: ts.page,
    pageSize: ts.pageSize,
    sortBy: ts.sortBy,
    sortDir: ts.sortDir,
  });

  const bookingMap = new Map((bookings?.items ?? []).map((b) => [b.id, b]));
  const columns = getColumns(bookingMap);

  function handleRowClick(q: Quotation) {
    router.push(`/quotations/${q.id}`);
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-4 md:mb-6 gap-3">
        <h1 className="text-xl md:text-2xl font-bold text-on-surface">Quotations</h1>
        <Button onClick={() => router.push("/quotations/new")} className="shrink-0">
          <FiPlus className="h-4 w-4" />
          <span className="hidden sm:inline ml-1">New Quotation</span>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 mb-4">
        <div className="overflow-x-auto pb-0.5">
          <ButtonGroup>
            <Button
              size="sm"
              variant="outline"
              onClick={() => { setStatusFilter(undefined); ts.setPage(1); }}
              className={cn(statusFilter === undefined && "bg-secondary text-secondary-foreground border-secondary z-10")}
            >
              All
            </Button>
            {ALL_STATUSES.map((s) => (
              <Button
                key={s}
                size="sm"
                variant="outline"
                onClick={() => { setStatusFilter(s); ts.setPage(1); }}
                className={cn(statusFilter === s && "bg-secondary text-secondary-foreground border-secondary z-10")}
              >
                {capitalize(s)}
              </Button>
            ))}
          </ButtonGroup>
        </div>
      </div>

      {isError && (
        <p className="text-destructive text-sm mb-4">
          Failed to load quotations. Please try again.
        </p>
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
            variant="quotations"
            title="No quotations found"
            description="Create a quotation for a booking to share with your customer."
          />
        }
      />
    </div>
  );
}

export default function QuotationsPage() {
  return (
    <Suspense fallback={null}>
      <QuotationsContent />
    </Suspense>
  );
}
