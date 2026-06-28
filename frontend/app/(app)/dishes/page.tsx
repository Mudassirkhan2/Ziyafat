"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  useDishes,
  useCreateDish,
  useUpdateDish,
  useDeleteDish,
} from "@/lib/dishes-api";
import { useUploadDishImage } from "@/lib/organisation-api";
import { useIngredients, useDishRecipe, useReplaceDishRecipe, useClearDishRecipe } from "@/lib/ingredients-api";
import type { Dish } from "@/lib/types";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { TableSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiLoader,
  FiX,
  FiPrinter,
  FiUpload,
} from "react-icons/fi";
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
// Recipe Editor
// ---------------------------------------------------------------------------

const DISH_UNITS = ["g", "kg", "ml", "L", "pcs", "tsp", "tbsp", "cup"] as const;

function RecipeEditor({
  dishId,
  recipeRows,
  onAdd,
  onRemove,
  onUpdate,
  onSave,
  onClear,
  recipeCost,
  isSaving,
  isClearing,
  isError,
}: {
  dishId: string;
  recipeRows: Array<{ ingredient_id: string; quantity_per_100_guests: string; unit: string }>;
  onAdd: () => void;
  onRemove: (i: number) => void;
  onUpdate: (i: number, field: string, value: string) => void;
  onSave: () => void;
  onClear: () => void;
  recipeCost?: number;
  isSaving: boolean;
  isClearing: boolean;
  isError: boolean;
}) {
  const { data: ingredients } = useIngredients();

  return (
    <div className="space-y-4 mt-4">
      {recipeCost !== undefined && recipeCost > 0 && (
        <p className="text-sm text-on-surface-medium">
          Computed cost: <strong className="text-on-surface">₹{recipeCost.toFixed(2)} / plate</strong>
        </p>
      )}

      <div className="space-y-2">
        {recipeRows.map((row, idx) => (
          <div key={idx} className="flex gap-2 items-center">
            <Select
              value={row.ingredient_id}
              onValueChange={(v) => onUpdate(idx, "ingredient_id", v)}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select ingredient" />
              </SelectTrigger>
              <SelectContent>
                {(ingredients ?? []).map((ing) => (
                  <SelectItem key={ing.id} value={ing.id}>{ing.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              step="0.001"
              placeholder="Qty / 100 guests"
              className="w-36"
              value={row.quantity_per_100_guests}
              onChange={(e) => onUpdate(idx, "quantity_per_100_guests", e.target.value)}
            />
            <Select
              value={row.unit}
              onValueChange={(v) => onUpdate(idx, "unit", v)}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DISH_UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button type="button" variant="outline" size="sm" onClick={() => onRemove(idx)}>✕</Button>
          </div>
        ))}
      </div>

      <Button type="button" variant="outline" size="sm" onClick={onAdd}>
        + Add Ingredient
      </Button>

      {isError && <p className="text-sm text-red-400">Failed to save recipe.</p>}

      <div className="flex justify-between pt-2">
        <Button
          type="button" variant="outline" size="sm"
          className="text-red-400 border-red-800"
          onClick={onClear}
          disabled={isClearing || recipeRows.length === 0}
        >
          {isClearing ? "Clearing…" : "Clear Recipe"}
        </Button>
        <Button type="button" onClick={onSave} disabled={isSaving}>
          {isSaving ? "Saving…" : "Save Recipe"}
        </Button>
      </div>
    </div>
  );
}

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
  const imageUpload = useUploadDishImage(dish?.id ?? "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const recipe = useDishRecipe(isEdit ? (dish?.id ?? "") : "");
  const replaceRecipe = useReplaceDishRecipe(dish?.id ?? "");
  const clearRecipe = useClearDishRecipe(dish?.id ?? "");

  const [recipeRows, setRecipeRows] = useState<
    Array<{ ingredient_id: string; quantity_per_100_guests: string; unit: string }>
  >([]);

  useEffect(() => {
    if (recipe.data) {
      setRecipeRows(
        recipe.data.ingredients.map((ri) => ({
          ingredient_id: ri.ingredient_id,
          quantity_per_100_guests: ri.quantity_per_100_guests.toString(),
          unit: ri.unit,
        }))
      );
    }
  }, [recipe.data]);

  function addRecipeRow() {
    setRecipeRows((prev) => [...prev, { ingredient_id: "", quantity_per_100_guests: "", unit: "kg" }]);
  }
  function removeRecipeRow(idx: number) {
    setRecipeRows((prev) => prev.filter((_, i) => i !== idx));
  }
  function updateRecipeRow(idx: number, field: string, value: string) {
    setRecipeRows((prev) => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
  }
  function saveRecipe() {
    const valid = recipeRows.filter((r) => r.ingredient_id && r.quantity_per_100_guests);
    replaceRecipe.mutate(
      valid.map((r) => ({
        ingredient_id: r.ingredient_id,
        quantity_per_100_guests: parseFloat(r.quantity_per_100_guests),
        unit: r.unit,
      }))
    );
  }

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

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    imageUpload.mutate(file);
    e.target.value = "";
  }

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
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {isEdit ? (
              <Tabs defaultValue="details" className="mt-6">
                <TabsList className="bg-surface-high">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="recipe">Recipe</TabsTrigger>
                </TabsList>
                <TabsContent value="details">
                  <div className="space-y-4 mt-4">
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

                    {dish && (
                      <div className="space-y-2 rounded-lg border border-outline p-3">
                        <p className="text-sm font-medium text-on-surface">Dish Image</p>
                        {dish.image_url && (
                          <img
                            src={dish.image_url}
                            alt={dish.name}
                            className="h-28 w-full rounded object-cover"
                          />
                        )}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={imageUpload.isPending}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {imageUpload.isPending ? "Uploading…" : dish.image_url ? "Replace Image" : "Upload Image"}
                        </Button>
                        {imageUpload.isError && (
                          <p className="text-xs text-red-400">Image upload failed. Try again.</p>
                        )}
                      </div>
                    )}

                    {updateDish.isError && (
                      <p className="text-sm text-red-400">
                        Failed to update dish. Try again.
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
                        {isMutating ? "Saving…" : "Save"}
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="recipe">
                  <RecipeEditor
                    dishId={dish?.id ?? ""}
                    recipeRows={recipeRows}
                    onAdd={addRecipeRow}
                    onRemove={removeRecipeRow}
                    onUpdate={updateRecipeRow}
                    onSave={saveRecipe}
                    onClear={() => clearRecipe.mutate()}
                    recipeCost={recipe.data?.recipe_cost_per_plate}
                    isSaving={replaceRecipe.isPending}
                    isClearing={clearRecipe.isPending}
                    isError={replaceRecipe.isError}
                  />
                </TabsContent>
              </Tabs>
            ) : (
              <div className="mt-6 space-y-4">
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

                {createDish.isError && (
                  <p className="text-sm text-red-400">
                    Failed to create dish. Try again.
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
                    {isMutating ? "Creating…" : "Create"}
                  </Button>
                </div>
              </div>
            )}
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
            <FiPrinter className="h-4 w-4" />
            Print Dish List
          </Button>
          <Button onClick={openAdd}>
            <FiPlus className="h-4 w-4" />
            Add Dish
          </Button>
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
      {isLoading && <TableSkeleton cols={6} />}
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
                  <TableCell colSpan={6} className="py-0">
                    <EmptyState
                      variant="dishes"
                      title="No dishes found"
                      description="Add dishes to build your catering catalog."
                    />
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
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(dish)}
                        title="Edit"
                      >
                        <FiEdit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        onClick={() => setDeleteTarget(dish)}
                        title="Delete"
                      >
                        <FiTrash2 className="h-4 w-4" />
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
              <FiX className="h-4 w-4" />
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteDish.isPending}
            >
              {deleteDish.isPending ? (
                <FiLoader className="h-4 w-4 animate-spin" />
              ) : (
                <FiTrash2 className="h-4 w-4" />
              )}
              {deleteDish.isPending ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
