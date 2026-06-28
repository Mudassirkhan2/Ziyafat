"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useLeads } from "@/lib/leads-api";
import { useDataTableState } from "@/lib/use-data-table-state";
import type { Lead, LeadStatus } from "@/lib/types";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/ui/data-table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { FiEye, FiPlus } from "react-icons/fi";

const ALL_STATUSES: LeadStatus[] = ["new", "quoted", "negotiating", "won", "lost"];

const STATUS_COLORS: Record<LeadStatus, string> = {
  new: "border-outline text-on-surface-medium",
  quoted: "bg-blue-900/30 text-blue-400 border-blue-800",
  negotiating: "bg-amber-900/30 text-amber-400 border-amber-800",
  won: "bg-green-900/30 text-green-400 border-green-800",
  lost: "bg-red-900/30 text-red-400 border-red-800",
};

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getColumns(router: ReturnType<typeof useRouter>): ColumnDef<Lead>[] {
  return [
    {
      id: "name",
      header: "Name",
      accessorKey: "name",
      meta: { sortable: true },
      cell: ({ row }) => (
        <span className="font-medium text-on-surface">{row.original.name}</span>
      ),
    },
    {
      id: "phone",
      header: "Phone",
      accessorKey: "phone",
      cell: ({ row }) => (
        <span className="text-on-surface-medium">{row.original.phone}</span>
      ),
    },
    {
      id: "event_type",
      header: "Event Type",
      accessorKey: "event_type",
      cell: ({ row }) => (
        <span className="text-on-surface-medium">{row.original.event_type}</span>
      ),
    },
    {
      id: "approx_date",
      header: "Date",
      accessorKey: "approx_date",
      meta: { sortable: true },
      cell: ({ row }) => (
        <span className="text-on-surface-medium">{formatDate(row.original.approx_date)}</span>
      ),
    },
    {
      id: "status",
      header: "Status",
      accessorKey: "status",
      meta: { sortable: true },
      cell: ({ row }) => (
        <Badge variant="outline" className={STATUS_COLORS[row.original.status as LeadStatus]}>
          {capitalize(row.original.status)}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(`/leads/${row.original.id}`)}
          title="View"
        >
          <FiEye className="h-4 w-4" />
        </Button>
      ),
    },
  ];
}

function LeadsContent() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<LeadStatus | undefined>(undefined);
  const ts = useDataTableState({ defaultSortBy: "created_at", defaultSortDir: "desc" });

  const { data, isLoading, isError } = useLeads({
    status: statusFilter,
    search: ts.search || undefined,
    page: ts.page,
    pageSize: ts.pageSize,
    sortBy: ts.sortBy,
    sortDir: ts.sortDir,
  });

  const columns = getColumns(router);

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-4 md:mb-6 gap-3">
        <h1 className="text-xl md:text-2xl font-bold text-on-surface">Leads</h1>
        <Button onClick={() => router.push("/leads/new")} className="shrink-0">
          <FiPlus className="h-4 w-4" />
          <span className="hidden sm:inline ml-1">Add Lead</span>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 mb-4">
        <Input
          placeholder="Search name, phone, email…"
          value={ts.search}
          onChange={(e) => ts.setSearch(e.target.value)}
          className="w-full sm:max-w-xs bg-surface border-outline text-on-surface"
        />
        <div className="overflow-x-auto pb-0.5">
          <Tabs
            value={statusFilter ?? "all"}
            onValueChange={(v) =>
              setStatusFilter(v === "all" ? undefined : (v as LeadStatus))
            }
          >
            <TabsList className="bg-surface-high whitespace-nowrap">
              <TabsTrigger value="all">All</TabsTrigger>
              {ALL_STATUSES.map((s) => (
                <TabsTrigger key={s} value={s}>
                  {capitalize(s)}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {isError && (
        <p className="text-destructive text-sm mb-4">Failed to load leads. Please try again.</p>
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
        emptyState={
          <EmptyState
            variant="leads"
            title="No leads found"
            description="Track enquiries and prospects by adding your first lead."
          />
        }
      />
    </div>
  );
}

export default function LeadsPage() {
  return (
    <Suspense fallback={null}>
      <LeadsContent />
    </Suspense>
  );
}
