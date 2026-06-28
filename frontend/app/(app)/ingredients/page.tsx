"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  useIngredients,
  useCreateIngredient,
  useUpdateIngredient,
  useDeleteIngredient,
} from "@/lib/ingredients-api";
import type { Ingredient } from "@/lib/types";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const UNITS = ["g", "kg", "ml", "L", "pcs", "tsp", "tbsp", "cup"] as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SheetMode = { mode: "add" } | { mode: "edit"; ingredient: Ingredient };

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const ingredientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  base_unit: z.string().min(1, "Base unit is required"),
  cost_per_unit: z.string().min(1, "Cost per unit is required"),
  supplier: z.string().optional(),
  stock_on_hand: z.string(),
  reorder_threshold: z.string(),
});

type IngredientFormValues = z.infer<typeof ingredientSchema>;

// ---------------------------------------------------------------------------
// Ingredient Sheet (Add / Edit)
// ---------------------------------------------------------------------------

function IngredientSheet({
  sheetMode,
  open,
  onOpenChange,
}: {
  sheetMode: SheetMode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isEdit = sheetMode.mode === "edit";
  const ingredient =
    isEdit
      ? (sheetMode as { mode: "edit"; ingredient: Ingredient }).ingredient
      : undefined;

  const createIngredient = useCreateIngredient();
  const updateIngredient = useUpdateIngredient(ingredient?.id ?? "");

  const form = useForm<IngredientFormValues>({
    resolver: zodResolver(ingredientSchema),
    defaultValues: {
      name: ingredient?.name ?? "",
      base_unit: ingredient?.base_unit ?? "",
      cost_per_unit: ingredient?.cost_per_unit?.toString() ?? "",
      supplier: ingredient?.supplier ?? "",
      stock_on_hand: ingredient?.stock_on_hand?.toString() ?? "0",
      reorder_threshold: ingredient?.reorder_threshold?.toString() ?? "0",
    },
  });

  function onSubmit(values: IngredientFormValues) {
    const payload = {
      name: values.name,
      base_unit: values.base_unit,
      cost_per_unit: parseFloat(values.cost_per_unit),
      supplier: values.supplier || undefined,
      stock_on_hand: parseFloat(values.stock_on_hand) || 0,
      reorder_threshold: parseFloat(values.reorder_threshold) || 0,
    };

    if (isEdit) {
      updateIngredient.mutate(payload, {
        onSuccess: () => onOpenChange(false),
      });
    } else {
      createIngredient.mutate(payload, {
        onSuccess: () => {
          form.reset({
            name: "",
            base_unit: "",
            cost_per_unit: "",
            supplier: "",
            stock_on_hand: "0",
            reorder_threshold: "0",
          });
          onOpenChange(false);
        },
      });
    }
  }

  const isMutating = createIngredient.isPending || updateIngredient.isPending;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {isEdit ? "Edit Ingredient" : "Add Ingredient"}
          </SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Basmati Rice" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="base_unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Base Unit *</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {UNITS.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cost_per_unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cost per Unit (₹) *</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.001" min="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="supplier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supplier</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Al-Madina Wholesale" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="stock_on_hand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock on Hand</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.001" min="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reorder_threshold"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reorder Threshold</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.001" min="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {(createIngredient.isError || updateIngredient.isError) && (
              <p className="text-sm text-red-400">
                Failed to {isEdit ? "update" : "create"} ingredient. Try again.
              </p>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isMutating}>
                {isMutating
                  ? isEdit
                    ? "Saving…"
                    : "Creating…"
                  : isEdit
                  ? "Save"
                  : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function IngredientsPage() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<SheetMode>({ mode: "add" });
  const [deleteTarget, setDeleteTarget] = useState<Ingredient | null>(null);

  const deleteIngredient = useDeleteIngredient();

  const { data: ingredients, isLoading, isError } = useIngredients({ active_only: true });

  function openAdd() {
    setSheetMode({ mode: "add" });
    setSheetOpen(true);
  }

  function openEdit(ingredient: Ingredient) {
    setSheetMode({ mode: "edit", ingredient });
    setSheetOpen(true);
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    deleteIngredient.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-on-surface">Ingredients</h1>
        <Button onClick={openAdd}>+ Add Ingredient</Button>
      </div>

      {/* Loading / Error */}
      {isLoading && (
        <p className="text-on-surface-medium">Loading ingredients…</p>
      )}
      {isError && (
        <p className="text-red-400">
          Failed to load ingredients. Please try again.
        </p>
      )}

      {/* Table */}
      {!isLoading && !isError && ingredients && (
        <div className="rounded-lg border border-outline overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-surface-high">
                <TableHead className="text-on-surface-medium">Name</TableHead>
                <TableHead className="text-on-surface-medium">
                  Base Unit
                </TableHead>
                <TableHead className="text-on-surface-medium">
                  Cost/Unit
                </TableHead>
                <TableHead className="text-on-surface-medium">
                  Supplier
                </TableHead>
                <TableHead className="text-on-surface-medium">Stock</TableHead>
                <TableHead className="text-on-surface-medium text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ingredients.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-on-surface-low py-8"
                  >
                    No ingredients found. Add your first ingredient to get
                    started.
                  </TableCell>
                </TableRow>
              )}
              {ingredients.map((ingredient) => {
                const lowStock =
                  ingredient.reorder_threshold > 0 &&
                  ingredient.stock_on_hand <= ingredient.reorder_threshold;
                return (
                  <TableRow
                    key={ingredient.id}
                    className="border-outline-low hover:bg-surface-high transition-colors"
                  >
                    <TableCell className="font-medium text-on-surface">
                      {ingredient.name}
                    </TableCell>
                    <TableCell className="text-on-surface-medium">
                      {ingredient.base_unit}
                    </TableCell>
                    <TableCell className="text-on-surface-medium">
                      ₹{ingredient.cost_per_unit.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 3,
                      })}
                    </TableCell>
                    <TableCell className="text-on-surface-medium">
                      {ingredient.supplier ?? "—"}
                    </TableCell>
                    <TableCell
                      className={
                        lowStock ? "text-red-400 font-medium" : "text-on-surface-medium"
                      }
                    >
                      {ingredient.stock_on_hand}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEdit(ingredient)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-800 text-red-400 hover:bg-red-900/20"
                          onClick={() => setDeleteTarget(ingredient)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Sheet */}
      <IngredientSheet
        sheetMode={sheetMode}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {deleteTarget?.name}?</DialogTitle>
            <DialogDescription>
              This will mark the ingredient as inactive and remove it from the
              active catalog.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteIngredient.isPending}
            >
              {deleteIngredient.isPending ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
