"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UtensilsCrossed } from "lucide-react";

import { useDish, useUpdateDish, useUploadDishImage, useDeleteDishImage } from "@/lib/dishes-api";
import { toast } from "sonner";
import {
  useIngredients,
  useDishRecipe,
  useReplaceDishRecipe,
  useClearDishRecipe,
} from "@/lib/ingredients-api";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FiPlus, FiTrash2, FiLoader } from "react-icons/fi";
import { FormPageShell, FormStickyFooter } from "@/components/layout/FormPageShell";
import {
  dishEditSchema,
  type DishEditValues,
  DishFormFields,
} from "@/components/forms/DishFormFields";

interface RecipeRow {
  ingredient_id: string;
  ingredient_name: string;
  qty_per_100_guests: string;
  unit: string;
}

export default function EditDishPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const imageInputRef = useRef<HTMLInputElement>(null);

  const { data: dish, isLoading, isError } = useDish(id);
  const updateDish = useUpdateDish(id);
  const uploadImage = useUploadDishImage(id);
  const deleteImage = useDeleteDishImage(id);

  const { data: recipe } = useDishRecipe(id);
  const replaceRecipe = useReplaceDishRecipe(id);
  const clearRecipe = useClearDishRecipe(id);

  const { data: ingredientsData } = useIngredients({
    pageSize: 200,
    sortBy: "name",
    sortDir: "asc",
  });
  const allIngredients = ingredientsData?.items ?? [];

  const [recipeRows, setRecipeRows] = useState<RecipeRow[]>([]);

  const form = useForm<DishEditValues>({
    resolver: zodResolver(dishEditSchema),
    defaultValues: {
      name: "", category: "", description: "",
      per_plate_cost: "", selling_price: "",
      is_veg: true, is_active: true, course: "", cuisine_type: "",
      portion_size: "", minimum_order_quantity: "",
      preparation_time_minutes: "", notes_for_kitchen: "",
      is_available_for_storefront: true,
    },
  });

  useEffect(() => {
    if (dish) {
      form.reset({
        name: dish.name,
        category: dish.category,
        description: dish.description ?? "",
        per_plate_cost: String(dish.per_plate_cost),
        selling_price: String(dish.selling_price),
        is_veg: dish.is_veg,
        is_active: dish.is_active,
        course: dish.course ?? "",
        cuisine_type: dish.cuisine_type ?? "",
        portion_size: dish.portion_size ?? "",
        minimum_order_quantity: dish.minimum_order_quantity?.toString() ?? "",
        preparation_time_minutes: dish.preparation_time_minutes?.toString() ?? "",
        notes_for_kitchen: dish.notes_for_kitchen ?? "",
        is_available_for_storefront: dish.is_available_for_storefront,
      });
    }
  }, [dish, form]);

  useEffect(() => {
    if (recipe) {
      setRecipeRows(
        recipe.ingredients.map((ing) => ({
          ingredient_id: ing.ingredient_id,
          ingredient_name: ing.ingredient_name,
          qty_per_100_guests: String(ing.quantity_per_100_guests),
          unit: ing.unit,
        }))
      );
    }
  }, [recipe]);

  function onSubmit(values: DishEditValues) {
    updateDish.mutate(
      {
        name: values.name,
        category: values.category,
        description: values.description || undefined,
        per_plate_cost: parseFloat(values.per_plate_cost),
        selling_price: parseFloat(values.selling_price),
        is_veg: values.is_veg,
        is_active: values.is_active,
        course: (values.course as never) || undefined,
        cuisine_type: (values.cuisine_type as never) || undefined,
        portion_size: values.portion_size || undefined,
        minimum_order_quantity: values.minimum_order_quantity
          ? parseInt(values.minimum_order_quantity, 10)
          : undefined,
        preparation_time_minutes: values.preparation_time_minutes
          ? parseInt(values.preparation_time_minutes, 10)
          : undefined,
        notes_for_kitchen: values.notes_for_kitchen || undefined,
        is_available_for_storefront: values.is_available_for_storefront,
      },
      {
        onSuccess: () => { toast.success("Dish saved."); router.push("/dishes"); },
        onError: () => toast.error("Failed to save dish. Please try again."),
      }
    );
  }

  function addRecipeRow() {
    setRecipeRows((prev) => [
      ...prev,
      { ingredient_id: "", ingredient_name: "", qty_per_100_guests: "0", unit: "" },
    ]);
  }

  function removeRecipeRow(index: number) {
    setRecipeRows((prev) => prev.filter((_, i) => i !== index));
  }

  function updateRecipeRow(index: number, field: keyof RecipeRow, value: string) {
    setRecipeRows((prev) =>
      prev.map((row, i) => {
        if (i !== index) return row;
        if (field === "ingredient_id") {
          const ing = allIngredients.find((a) => a.id === value);
          return {
            ...row,
            ingredient_id: value,
            ingredient_name: ing?.name ?? "",
            unit: ing?.base_unit ?? row.unit,
          };
        }
        return { ...row, [field]: value };
      })
    );
  }

  function onSaveRecipe() {
    const validRows = recipeRows.filter(
      (r) => r.ingredient_id && parseFloat(r.qty_per_100_guests) > 0
    );
    replaceRecipe.mutate(
      validRows.map((r) => ({
        ingredient_id: r.ingredient_id,
        quantity_per_100_guests: parseFloat(r.qty_per_100_guests),
        unit: r.unit,
      })),
      {
        onSuccess: () => toast.success("Recipe saved."),
        onError: () => toast.error("Failed to save recipe. Please try again."),
      }
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 flex items-center gap-2 text-on-surface-medium">
        <FiLoader className="h-4 w-4 animate-spin" /> Loading…
      </div>
    );
  }

  if (isError || !dish) {
    return (
      <div className="p-6">
        <p className="text-destructive">Failed to load dish.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/dishes")}>
          ← Back to Dishes
        </Button>
      </div>
    );
  }

  return (
    <FormPageShell
      backHref="/dishes"
      backLabel="Back to Dishes"
      icon={<UtensilsCrossed className="h-5 w-5" />}
      title="Edit Dish"
      subtitle={`Editing ${dish.name}`}
    >
      <Tabs defaultValue="details">
        <TabsList className="bg-surface-high mb-6">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="recipe">Recipe</TabsTrigger>
        </TabsList>

        {/* ── Details Tab ── */}
        <TabsContent value="details">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="rounded-[20px] border border-outline-low overflow-hidden divide-y divide-outline-low shadow-[0_1px_2px_rgba(0,0,0,0.04),0_18px_40px_-28px_rgba(0,0,0,0.15)] bg-surface-high">
                <DishFormFields showActiveToggle />
              </div>
              <FormStickyFooter
                cancelHref="/dishes"
                isPending={updateDish.isPending}
                saveLabel="Save Changes"
              />
            </form>
          </Form>

          {/* Dish Image */}
          <section className="mt-6 rounded-[20px] border border-outline-low p-6 space-y-3 bg-surface-high shadow-[0_1px_2px_rgba(0,0,0,0.04),0_18px_40px_-28px_rgba(0,0,0,0.15)]">
            <div>
              <h2 className="text-base font-semibold text-on-surface">Dish Photo</h2>
              <p className="text-sm text-on-surface-medium mt-0.5">
                Shown on the public storefront and dish catalog. Upload a clear, appetising photo of the dish.
              </p>
              <p className="text-xs text-on-surface-low mt-1">
                Recommended: <strong>800 × 600 px</strong> · JPEG or PNG · Max 5 MB
              </p>
            </div>
            {dish.image_url && (
              <img
                src={dish.image_url}
                alt={dish.name}
                className="h-40 w-full max-w-xs object-cover rounded-lg border border-outline-low"
              />
            )}
            <div className="flex gap-2">
              <input
                ref={imageInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    uploadImage.mutate(file, {
                      onSuccess: () => toast.success("Photo uploaded."),
                      onError: () => toast.error("Photo upload failed. Try again."),
                    });
                    e.target.value = "";
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                disabled={uploadImage.isPending || deleteImage.isPending}
                onClick={() => imageInputRef.current?.click()}
              >
                {uploadImage.isPending ? "Uploading…" : dish.image_url ? "Replace Photo" : "Upload Photo"}
              </Button>
              {dish.image_url && (
                <Button
                  type="button"
                  variant="ghost"
                  disabled={uploadImage.isPending || deleteImage.isPending}
                  onClick={() => deleteImage.mutate(undefined, {
                    onSuccess: () => toast.success("Photo removed."),
                    onError: () => toast.error("Failed to remove photo. Try again."),
                  })}
                >
                  {deleteImage.isPending ? "Removing…" : "Remove"}
                </Button>
              )}
            </div>
          </section>
        </TabsContent>

        {/* ── Recipe Tab ── */}
        <TabsContent value="recipe">
          <div className="rounded-[20px] border border-outline-low overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.04),0_18px_40px_-28px_rgba(0,0,0,0.15)] bg-surface-high p-[30px] space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-on-surface-medium">
                Quantities are per 100 guests.
                {recipe && (
                  <span className="ml-2 font-medium text-on-surface">
                    Recipe cost: ₹{recipe.recipe_cost_per_plate.toFixed(2)}/plate
                  </span>
                )}
              </p>
            </div>

            {recipeRows.length === 0 && (
              <p className="text-sm text-on-surface-low py-4 text-center">
                No recipe yet. Add ingredients below.
              </p>
            )}

            <div className="space-y-2">
              {recipeRows.map((row, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[1fr_120px_120px_40px] gap-2 items-center"
                >
                  <Select
                    value={row.ingredient_id}
                    onValueChange={(val) => val && updateRecipeRow(index, "ingredient_id", val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select ingredient" />
                    </SelectTrigger>
                    <SelectContent>
                      {allIngredients.map((ing) => (
                        <SelectItem key={ing.id} value={ing.id}>
                          {ing.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Qty"
                    value={row.qty_per_100_guests}
                    onChange={(e) => updateRecipeRow(index, "qty_per_100_guests", e.target.value)}
                  />
                  <Input
                    placeholder="Unit"
                    value={row.unit}
                    onChange={(e) => updateRecipeRow(index, "unit", e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => removeRecipeRow(index)}
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <Button type="button" variant="outline" size="sm" onClick={addRecipeRow}>
              <FiPlus className="h-4 w-4 mr-1" /> Add Ingredient
            </Button>
          </div>

          <div
            className="sticky bottom-0 border-t border-outline-low px-8 py-4 mt-0"
            style={{
              background: "color-mix(in srgb, var(--surface), transparent 12%)",
              backdropFilter: "blur(12px)",
            }}
          >
            <div className="max-w-[880px] mx-auto flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => clearRecipe.mutate(undefined, {
                  onSuccess: () => toast.success("Recipe cleared."),
                  onError: () => toast.error("Failed to clear recipe."),
                })}
                disabled={clearRecipe.isPending || recipeRows.length === 0}
                className="inline-flex items-center justify-center h-[44px] px-5 rounded-[11px] text-sm font-semibold border border-outline text-on-surface-medium hover:bg-surface-high hover:text-on-surface transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {clearRecipe.isPending ? "Clearing…" : "Clear Recipe"}
              </button>
              <button
                type="button"
                onClick={onSaveRecipe}
                disabled={replaceRecipe.isPending}
                className="inline-flex items-center justify-center h-[44px] px-6 rounded-[11px] text-sm font-bold transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed hover:-translate-y-px"
                style={{
                  background:
                    "linear-gradient(180deg, color-mix(in oklab, var(--secondary), #fff 12%), var(--secondary))",
                  color: "var(--secondary-foreground)",
                  boxShadow: "0 8px 22px -10px var(--secondary)",
                }}
              >
                {replaceRecipe.isPending ? (
                  <><FiLoader className="h-4 w-4 mr-1 animate-spin" /> Saving…</>
                ) : (
                  "Save Recipe"
                )}
              </button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </FormPageShell>
  );
}
