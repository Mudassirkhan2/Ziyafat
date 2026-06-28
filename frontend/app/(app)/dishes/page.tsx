"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  useDishes,
  useCreateDish,
  useUpdateDish,
  useDeleteDish,
} from "@/lib/dishes-api";
import type { Dish } from "@/lib/types";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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
// Types
// ---------------------------------------------------------------------------

type VegFilter = "all" | "veg" | "non-veg";
type SheetMode = { mode: "add" } | { mode: "edit"; dish: Dish };

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const dishSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  per_plate_cost: z.string().min(1, "Cost is required"),
  selling_price: z.string().min(1, "Selling price is required"),
  is_veg: z.boolean(),
  is_active: z.boolean(),
});

type DishFormValues = z.infer<typeof dishSchema>;

// ---------------------------------------------------------------------------
// Dish Sheet (Add / Edit)
// ---------------------------------------------------------------------------

function DishSheet({
  sheetMode,
  open,
  onOpenChange,
}: {
  sheetMode: SheetMode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isEdit = sheetMode.mode === "edit";
  const dish = isEdit ? (sheetMode as { mode: "edit"; dish: Dish }).dish : undefined;

  const createDish = useCreateDish();
  const updateDish = useUpdateDish(dish?.id ?? "");

  const form = useForm<DishFormValues>({
    resolver: zodResolver(dishSchema),
    defaultValues: {
      name: dish?.name ?? "",
      category: dish?.category ?? "",
      description: dish?.description ?? "",
      per_plate_cost: dish?.per_plate_cost?.toString() ?? "",
      selling_price: dish?.selling_price?.toString() ?? "",
      is_veg: dish?.is_veg ?? true,
      is_active: dish?.is_active ?? true,
    },
  });

  function onSubmit(values: DishFormValues) {
    if (isEdit) {
      updateDish.mutate(
        {
          name: values.name,
          category: values.category,
          description: values.description || undefined,
          per_plate_cost: parseFloat(values.per_plate_cost),
          selling_price: parseFloat(values.selling_price),
          is_veg: values.is_veg,
          is_active: values.is_active,
        },
        {
          onSuccess: () => onOpenChange(false),
        }
      );
    } else {
      createDish.mutate(
        {
          name: values.name,
          category: values.category,
          description: values.description || undefined,
          per_plate_cost: parseFloat(values.per_plate_cost),
          selling_price: parseFloat(values.selling_price),
          is_veg: values.is_veg,
        },
        {
          onSuccess: () => {
            form.reset();
            onOpenChange(false);
          },
        }
      );
    }
  }

  const isMutating = createDish.isPending || updateDish.isPending;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEdit ? "Edit Dish" : "Add Dish"}</SheetTitle>
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
                    <Input placeholder="e.g. Mutton Biryani" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Main Course, Starters, Desserts" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea rows={3} placeholder="Optional description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="per_plate_cost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cost Per Plate (₹) *</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="selling_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Selling Price (₹) *</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_veg"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border border-outline p-3">
                  <div>
                    <FormLabel>Vegetarian</FormLabel>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            {isEdit && (
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border border-outline p-3">
                    <div>
                      <FormLabel>Active</FormLabel>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

            {(createDish.isError || updateDish.isError) && (
              <p className="text-sm text-red-400">
                Failed to {isEdit ? "update" : "create"} dish. Try again.
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

export default function DishesPage() {
  const [vegFilter, setVegFilter] = useState<VegFilter>("all");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<SheetMode>({ mode: "add" });
  const [deleteTarget, setDeleteTarget] = useState<Dish | null>(null);

  const deleteDish = useDeleteDish();

  // Derive query params from current tab
  const queryParams =
    vegFilter === "veg"
      ? { is_veg: true, active_only: true }
      : vegFilter === "non-veg"
      ? { is_veg: false, active_only: true }
      : { active_only: true };

  const { data: dishes, isLoading, isError } = useDishes(queryParams);

  function openAdd() {
    setSheetMode({ mode: "add" });
    setSheetOpen(true);
  }

  function openEdit(dish: Dish) {
    setSheetMode({ mode: "edit", dish });
    setSheetOpen(true);
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    deleteDish.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-on-surface">Dishes</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => window.open("/api/v1/dishes/pdf")}
          >
            Print Dish List
          </Button>
          <Button onClick={openAdd}>+ Add Dish</Button>
        </div>
      </div>

      {/* Veg / Non-Veg Tabs */}
      <Tabs
        value={vegFilter}
        onValueChange={(val) => setVegFilter(val as VegFilter)}
        className="mb-4"
      >
        <TabsList className="bg-surface-high">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="veg">Veg</TabsTrigger>
          <TabsTrigger value="non-veg">Non-Veg</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Loading / Error */}
      {isLoading && <p className="text-on-surface-medium">Loading dishes…</p>}
      {isError && (
        <p className="text-red-400">Failed to load dishes. Please try again.</p>
      )}

      {/* Table */}
      {!isLoading && !isError && dishes && (
        <div className="rounded-lg border border-outline overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-surface-high">
                <TableHead className="text-on-surface-medium">Name</TableHead>
                <TableHead className="text-on-surface-medium">Category</TableHead>
                <TableHead className="text-on-surface-medium">Type</TableHead>
                <TableHead className="text-on-surface-medium">Selling Price</TableHead>
                <TableHead className="text-on-surface-medium">Active</TableHead>
                <TableHead className="text-on-surface-medium text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dishes.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-on-surface-low py-8"
                  >
                    No dishes found.
                  </TableCell>
                </TableRow>
              )}
              {dishes.map((dish) => (
                <TableRow
                  key={dish.id}
                  className="border-outline-low hover:bg-surface-high transition-colors"
                >
                  <TableCell className="font-medium text-on-surface">
                    {dish.name}
                  </TableCell>
                  <TableCell className="text-on-surface-medium">
                    {dish.category}
                  </TableCell>
                  <TableCell>
                    {dish.is_veg ? (
                      <Badge
                        variant="outline"
                        className="bg-green-900/30 text-green-400 border-green-800"
                      >
                        Veg
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-red-900/30 text-red-400 border-red-800"
                      >
                        Non-Veg
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-on-surface-medium">
                    ₹{dish.selling_price.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell
                    className={
                      dish.is_active ? "text-on-surface-medium" : "text-on-surface-low"
                    }
                  >
                    {dish.is_active ? "Active" : "Inactive"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(dish)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-800 text-red-400 hover:bg-red-900/20"
                        onClick={() => setDeleteTarget(dish)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Sheet */}
      <DishSheet
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
              This will mark the dish as inactive and remove it from the active
              catalog.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteDish.isPending}
            >
              {deleteDish.isPending ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
