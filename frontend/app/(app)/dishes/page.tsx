"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useDishes, useDeleteDish } from "@/lib/dishes-api";
import { API_BASE } from "@/lib/api";
import { useDataTableState } from "@/lib/use-data-table-state";
import type { Dish } from "@/lib/types";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/ui/data-table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { FiPlus, FiTrash2, FiLoader, FiX, FiPrinter } from "react-icons/fi";

type VegFilter = "all" | "veg" | "non-veg";

function getColumns(
  onDelete: (dish: Dish) => void
): ColumnDef<Dish>[] {
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
      id: "category",
      header: "Category",
      accessorKey: "category",
      meta: { sortable: true },
      cell: ({ row }) => (
        <span className="text-on-surface-medium">{row.original.category}</span>
      ),
    },
    {
      id: "is_veg",
      header: "Type",
      accessorKey: "is_veg",
      cell: ({ row }) =>
        row.original.is_veg ? (
          <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
            Veg
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">
            Non-Veg
          </Badge>
        ),
    },
    {
      id: "selling_price",
      header: "Selling Price",
      accessorKey: "selling_price",
      meta: { sortable: true },
      cell: ({ row }) => (
        <span className="text-on-surface-medium">
          ₹{row.original.selling_price.toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      id: "is_active",
      header: "Active",
      accessorKey: "is_active",
      cell: ({ row }) => (
        <span className={row.original.is_active ? "text-on-surface-medium" : "text-on-surface-low"}>
          {row.original.is_active ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={(e) => { e.stopPropagation(); onDelete(row.original); }}
            title="Delete"
          >
            <FiTrash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];
}

function DishesContent() {
  const router = useRouter();
  const [vegFilter, setVegFilter] = useState<VegFilter>("all");
  const [deleteTarget, setDeleteTarget] = useState<Dish | null>(null);
  const ts = useDataTableState({ defaultSortBy: "name", defaultSortDir: "asc" });
  const deleteDish = useDeleteDish();

  const queryParams = {
    is_veg: vegFilter === "all" ? undefined : vegFilter === "veg",
    active_only: true,
    search: ts.search || undefined,
    page: ts.page,
    pageSize: ts.pageSize,
    sortBy: ts.sortBy,
    sortDir: ts.sortDir,
  };

  const { data, isLoading, isError } = useDishes(queryParams);

  const columns = getColumns(setDeleteTarget);
  function handleRowClick(dish: Dish) {
    router.push(`/dishes/${dish.id}/edit`);
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    deleteDish.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-on-surface">Dishes</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => window.open(`${API_BASE}/api/v1/dishes/pdf`)}>
            <FiPrinter className="h-4 w-4 mr-1" /> Print Dish List
          </Button>
          <Button onClick={() => router.push("/dishes/new")}>
            <FiPlus className="h-4 w-4 mr-1" /> Add Dish
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Input
          placeholder="Search name, category…"
          value={ts.search}
          onChange={(e) => ts.setSearch(e.target.value)}
          className="max-w-xs bg-surface border-outline text-on-surface"
        />
        <Tabs
          value={vegFilter}
          onValueChange={(v) => setVegFilter(v as VegFilter)}
        >
          <TabsList className="bg-surface-high">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="veg">Veg</TabsTrigger>
            <TabsTrigger value="non-veg">Non-Veg</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isError && (
        <p className="text-destructive text-sm mb-4">Failed to load dishes. Please try again.</p>
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
            variant="dishes"
            title="No dishes found"
            description="Add dishes to build your catering catalog."
          />
        }
      />

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {deleteTarget?.name}?</DialogTitle>
            <DialogDescription>
              This will mark the dish as inactive and remove it from the active catalog.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              <FiX className="h-4 w-4 mr-1" /> Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteDish.isPending}
            >
              {deleteDish.isPending
                ? <><FiLoader className="h-4 w-4 mr-1 animate-spin" /> Deleting…</>
                : <><FiTrash2 className="h-4 w-4 mr-1" /> Delete</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function DishesPage() {
  return (
    <Suspense fallback={null}>
      <DishesContent />
    </Suspense>
  );
}
