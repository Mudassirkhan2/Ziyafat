"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useIngredients, useDeleteIngredient } from "@/lib/ingredients-api";
import { useDataTableState } from "@/lib/use-data-table-state";
import type { Ingredient } from "@/lib/types";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
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
import { FiPlus, FiTrash2, FiLoader, FiX } from "react-icons/fi";

function getColumns(
  onDelete: (ingredient: Ingredient) => void
): ColumnDef<Ingredient>[] {
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
      id: "base_unit",
      header: "Unit",
      accessorKey: "base_unit",
      cell: ({ row }) => (
        <span className="text-on-surface-medium">{row.original.base_unit}</span>
      ),
    },
    {
      id: "cost_per_unit",
      header: "Cost/Unit",
      accessorKey: "cost_per_unit",
      meta: { sortable: true },
      cell: ({ row }) => (
        <span className="text-on-surface-medium">
          ₹{row.original.cost_per_unit.toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      id: "supplier",
      header: "Supplier",
      accessorKey: "supplier",
      cell: ({ row }) => (
        <span className="text-on-surface-medium">{row.original.supplier ?? "—"}</span>
      ),
    },
    {
      id: "stock_on_hand",
      header: "Stock",
      accessorKey: "stock_on_hand",
      meta: { sortable: true },
      cell: ({ row }) => {
        const isLow =
          row.original.stock_on_hand <= row.original.reorder_threshold &&
          row.original.reorder_threshold > 0;
        return (
          <span className={isLow ? "text-destructive font-medium" : "text-on-surface-medium"}>
            {row.original.stock_on_hand} {row.original.base_unit}
          </span>
        );
      },
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

function IngredientsContent() {
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<Ingredient | null>(null);
  const ts = useDataTableState({ defaultSortBy: "name", defaultSortDir: "asc" });
  const deleteIngredient = useDeleteIngredient();

  const { data, isLoading, isError } = useIngredients({
    active_only: true,
    search: ts.search || undefined,
    page: ts.page,
    pageSize: ts.pageSize,
    sortBy: ts.sortBy,
    sortDir: ts.sortDir,
  });

  const columns = getColumns(setDeleteTarget);
  function handleRowClick(ingredient: Ingredient) {
    router.push(`/ingredients/${ingredient.id}/edit`);
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    deleteIngredient.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-on-surface">Ingredients</h1>
        <Button onClick={() => router.push("/ingredients/new")}>
          <FiPlus className="h-4 w-4 mr-1" /> Add Ingredient
        </Button>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Search name, supplier…"
          value={ts.search}
          onChange={(e) => ts.setSearch(e.target.value)}
          className="max-w-xs bg-surface border-outline text-on-surface"
        />
      </div>

      {isError && (
        <p className="text-destructive text-sm mb-4">Failed to load ingredients. Please try again.</p>
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
            variant="ingredients"
            title="No ingredients found"
            description="Add ingredients to build recipes and track stock."
          />
        }
      />

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate {deleteTarget?.name}?</DialogTitle>
            <DialogDescription>
              This will mark the ingredient as inactive.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              <FiX className="h-4 w-4 mr-1" /> Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteIngredient.isPending}
            >
              {deleteIngredient.isPending
                ? <><FiLoader className="h-4 w-4 mr-1 animate-spin" /> Deactivating…</>
                : <><FiTrash2 className="h-4 w-4 mr-1" /> Deactivate</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function IngredientsPage() {
  return (
    <Suspense fallback={null}>
      <IngredientsContent />
    </Suspense>
  );
}
