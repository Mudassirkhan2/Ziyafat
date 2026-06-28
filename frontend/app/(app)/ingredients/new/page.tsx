"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useCreateIngredient } from "@/lib/ingredients-api";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  ingredientCreateSchema,
  type IngredientCreateValues,
  IngredientFormFields,
} from "@/components/forms/IngredientFormFields";

export default function NewIngredientPage() {
  const router = useRouter();
  const createIngredient = useCreateIngredient();

  const form = useForm<IngredientCreateValues>({
    resolver: zodResolver(ingredientCreateSchema),
    defaultValues: {
      name: "", base_unit: "", cost_per_unit: "", supplier: "",
      stock_on_hand: "0", reorder_threshold: "0", category: "",
      yield_percentage: "100", purchase_unit: "", unit_conversion_factor: "",
      allergen_flag: false, waste_percentage: "0", storage_location: "",
      shelf_life_days: "", par_level: "", notes: "",
    },
  });

  function onSubmit(values: IngredientCreateValues) {
    createIngredient.mutate(
      {
        name: values.name,
        base_unit: values.base_unit,
        cost_per_unit: parseFloat(values.cost_per_unit),
        supplier: values.supplier || undefined,
        stock_on_hand: values.stock_on_hand ? parseFloat(values.stock_on_hand) : 0,
        reorder_threshold: values.reorder_threshold ? parseFloat(values.reorder_threshold) : 0,
        category: (values.category as never) || undefined,
        yield_percentage: values.yield_percentage ? parseFloat(values.yield_percentage) : 100,
        purchase_unit: values.purchase_unit || undefined,
        unit_conversion_factor: values.unit_conversion_factor
          ? parseFloat(values.unit_conversion_factor)
          : undefined,
        allergen_flag: values.allergen_flag,
        waste_percentage: values.waste_percentage ? parseFloat(values.waste_percentage) : 0,
        storage_location: values.storage_location || undefined,
        shelf_life_days: values.shelf_life_days ? parseInt(values.shelf_life_days, 10) : undefined,
        par_level: values.par_level ? parseFloat(values.par_level) : undefined,
        notes: values.notes || undefined,
      },
      { onSuccess: () => router.push("/ingredients") },
    );
  }

  return (
    <div className="p-6">
      <button
        type="button"
        onClick={() => router.push("/ingredients")}
        className="text-on-surface-medium hover:text-on-surface text-sm mb-6 flex items-center gap-1"
      >
        ← Back to Ingredients
      </button>

      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-on-surface mb-6">New Ingredient</h1>

        <div className="rounded-lg border border-outline bg-surface-high p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <IngredientFormFields />

              {createIngredient.isError && (
                <p className="text-sm text-red-400">Failed to create ingredient. Please try again.</p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => router.push("/ingredients")}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createIngredient.isPending}>
                  {createIngredient.isPending ? "Saving…" : "Save Ingredient"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
