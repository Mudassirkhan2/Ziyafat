"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useInvoices } from "@/lib/invoices-api";
import { useBookingsForSelect } from "@/lib/bookings-api";
import { useDataTableState } from "@/lib/use-data-table-state";
import type { Booking, Invoice, InvoiceStatus } from "@/lib/types";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/ui/data-table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { FiPlus } from "react-icons/fi";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ALL_STATUSES: InvoiceStatus[] = ["draft", "sent", "paid"];

const STATUS_COLORS: Record<InvoiceStatus, string> = {
  draft: "border-outline text-on-surface-medium",
  sent: "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
  paid: "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function StatusBadge({ status }: { status: InvoiceStatus }) {
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

function getColumns(bookingMap: Map<string, Booking>): ColumnDef<Invoice>[] {
  return [
    {
      id: "invoice_number",
      header: "Invoice #",
      accessorKey: "invoice_number",
      cell: ({ row }) => (
        <span className="font-medium text-on-surface font-mono">
          {row.original.invoice_number}
        </span>
      ),
    },
    {
      id: "booking",
      header: "Booking",
      cell: ({ row }) => {
        const booking = bookingMap.get(row.original.booking_id);
        return (
          <span className="text-on-surface-medium">
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
      id: "due_date",
      header: "Due Date",
      cell: ({ row }) => (
        <span className="text-on-surface-medium">{formatDate(row.original.due_date)}</span>
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

function InvoicesContent() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | undefined>(undefined);
  const ts = useDataTableState({ defaultSortBy: "created_at", defaultSortDir: "desc" });

  const { data: bookings } = useBookingsForSelect();

  const { data, isLoading, isError } = useInvoices({
    status: statusFilter,
    page: ts.page,
    pageSize: ts.pageSize,
    sortBy: ts.sortBy,
    sortDir: ts.sortDir,
  });

  const bookingMap = new Map((bookings?.items ?? []).map((b) => [b.id, b]));
  const columns = getColumns(bookingMap);

  function handleRowClick(invoice: Invoice) {
    router.push(`/invoices/${invoice.id}`);
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-on-surface">Invoices</h1>
        <Button onClick={() => router.push("/invoices/new")}>
          <FiPlus className="h-4 w-4 mr-1" />
          New Invoice
        </Button>
      </div>

      <Tabs
        value={statusFilter ?? "all"}
        onValueChange={(val) => {
          setStatusFilter(val === "all" ? undefined : (val as InvoiceStatus));
          ts.setPage(1);
        }}
        className="mb-4"
      >
        <TabsList className="bg-surface-high">
          <TabsTrigger value="all">All</TabsTrigger>
          {ALL_STATUSES.map((s) => (
            <TabsTrigger key={s} value={s}>
              {capitalize(s)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isError && (
        <p className="text-destructive text-sm mb-4">
          Failed to load invoices. Please try again.
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
            variant="invoices"
            title="No invoices found"
            description="Generate an invoice from a booking or quotation."
          />
        }
      />
    </div>
  );
}

export default function InvoicesPage() {
  return (
    <Suspense fallback={null}>
      <InvoicesContent />
    </Suspense>
  );
}
