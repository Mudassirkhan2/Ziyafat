"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { useCustomers } from "@/lib/customers-api";
import { useDataTableState } from "@/lib/use-data-table-state";
import type { Customer } from "@/lib/types";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { FiPlus } from "react-icons/fi";

function getColumns(): ColumnDef<Customer>[] {
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
      id: "email",
      header: "Email",
      accessorKey: "email",
      cell: ({ row }) => (
        <span className="text-on-surface-medium">{row.original.email ?? "—"}</span>
      ),
    },
    {
      id: "notes",
      header: "Notes",
      accessorKey: "notes",
      cell: ({ row }) => (
        <span className="text-on-surface-medium line-clamp-1 max-w-xs">
          {row.original.notes ?? "—"}
        </span>
      ),
    },
  ];
}

function CustomersContent() {
  const router = useRouter();
  const ts = useDataTableState({ defaultSortBy: "created_at", defaultSortDir: "desc" });

  const { data, isLoading, isError } = useCustomers({
    search: ts.search || undefined,
    page: ts.page,
    pageSize: ts.pageSize,
    sortBy: ts.sortBy,
    sortDir: ts.sortDir,
  });

  const columns = getColumns();
  function handleRowClick(customer: Customer) {
    router.push(`/customers/${customer.id}`);
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-on-surface">Customers</h1>
        <Button onClick={() => router.push("/customers/new")}>
          <FiPlus className="h-4 w-4 mr-1" /> Add Customer
        </Button>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Search name, phone, email…"
          value={ts.search}
          onChange={(e) => ts.setSearch(e.target.value)}
          className="max-w-xs bg-surface border-outline text-on-surface"
        />
      </div>

      {isError && (
        <p className="text-destructive text-sm mb-4">Failed to load customers. Please try again.</p>
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
            variant="customers"
            title="No customers found"
            description="Add your first customer to begin managing bookings."
          />
        }
      />
    </div>
  );
}

export default function CustomersPage() {
  return (
    <Suspense fallback={null}>
      <CustomersContent />
    </Suspense>
  );
}
