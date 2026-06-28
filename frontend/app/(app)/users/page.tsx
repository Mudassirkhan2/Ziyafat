"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { useUsers } from "@/lib/users-api";
import { useDataTableState } from "@/lib/use-data-table-state";
import type { StaffUser, UserRole } from "@/lib/types";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { FiEdit2, FiPlus } from "react-icons/fi";

const ROLE_COLORS: Record<UserRole, string> = {
  owner: "bg-amber-900/30 text-amber-400 border-amber-800",
  manager: "bg-blue-900/30 text-blue-400 border-blue-800",
  kitchen: "bg-green-900/30 text-green-400 border-green-800",
  viewer: "border-outline text-on-surface-medium",
};

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getColumns(router: ReturnType<typeof useRouter>): ColumnDef<StaffUser>[] {
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
      id: "email",
      header: "Email",
      accessorKey: "email",
      meta: { sortable: true },
      cell: ({ row }) => (
        <span className="text-on-surface-medium">{row.original.email}</span>
      ),
    },
    {
      id: "role",
      header: "Role",
      accessorKey: "role",
      meta: { sortable: true },
      cell: ({ row }) => (
        <Badge variant="outline" className={ROLE_COLORS[row.original.role as UserRole]}>
          {capitalize(row.original.role)}
        </Badge>
      ),
    },
    {
      id: "is_active",
      header: "Status",
      accessorKey: "is_active",
      cell: ({ row }) =>
        row.original.is_active ? (
          <Badge className="bg-green-900/30 text-green-400 border-green-800 border">Active</Badge>
        ) : (
          <Badge variant="outline" className="text-on-surface-low">Deactivated</Badge>
        ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(`/users/${row.original.id}/edit`)}
          title="Edit"
        >
          <FiEdit2 className="h-4 w-4" />
        </Button>
      ),
    },
  ];
}

function UsersContent() {
  const router = useRouter();
  const ts = useDataTableState({ defaultSortBy: "name", defaultSortDir: "asc" });

  const { data, isLoading, isError } = useUsers({
    search: ts.search || undefined,
    page: ts.page,
    pageSize: ts.pageSize,
    sortBy: ts.sortBy,
    sortDir: ts.sortDir,
  });

  const columns = getColumns(router);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-on-surface">Users</h1>
        <Button onClick={() => router.push("/users/new")}>
          <FiPlus className="h-4 w-4 mr-1" /> Add User
        </Button>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Search name, email…"
          value={ts.search}
          onChange={(e) => ts.setSearch(e.target.value)}
          className="max-w-xs bg-surface border-outline text-on-surface"
        />
      </div>

      {isError && (
        <p className="text-destructive text-sm mb-4">Failed to load users. Please try again.</p>
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
            variant="users"
            title="No users found"
            description="Add team members to manage access."
          />
        }
      />
    </div>
  );
}

export default function UsersPage() {
  return (
    <Suspense fallback={null}>
      <UsersContent />
    </Suspense>
  );
}
