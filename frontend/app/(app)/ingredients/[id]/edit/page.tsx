"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useIngredient, useUpdateIngredient } from "@/lib/ingredients-api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FiLoader } from "react-icons/fi";
import {
  ingredientEditSchema,
  type IngredientEditValues,
  IngredientFormFields,
} from "@/components/forms/IngredientFormFields";

export default function EditIngredientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const { data: ingredient, isLoading, isError } = useIngredient(id);
  const updateIngredient = useUpdateIngredient(id);

  const form = useForm<IngredientEditValues>({
    resolver: zodResolver(ingredientEditSchema),
    defaultValues: {
      name: "",
      base_unit: "",
      cost_per_unit: "",
      supplier: "",
      stock_on_hand: "0",
      reorder_threshold: "0",
      category: "",
      yield_percentage: "100",
      purchase_unit: "",
      unit_conversion_factor: "",
      allergen_flag: false,
      waste_percentage: "0",
      storage_location: "",
      shelf_life_days: "",
      par_level: "",
      notes: "",
      is_active: true,
    },
  });

  useEffect(() => {
    if (ingredient) {
      form.reset({
        name: ingredient.name,
        base_unit: ingredient.base_unit,
        cost_per_unit: String(ingredient.cost_per_unit),
        supplier: ingredient.supplier ?? "",
        stock_on_hand: String(ingredient.stock_on_hand),
        reorder_threshold: String(ingredient.reorder_threshold),
        category: ingredient.category ?? "",
        yield_percentage: String(ingredient.yield_percentage),
        purchase_unit: ingredient.purchase_unit ?? "",
        unit_conversion_factor: ingredient.unit_conversion_factor != null
          ? String(ingredient.unit_conversion_factor)
          : "",
        allergen_flag: ingredient.allergen_flag,
        waste_percentage: String(ingredient.waste_percentage),
        storage_location: ingredient.storage_location ?? "",
        shelf_life_days: ingredient.shelf_life_days != null
          ? String(ingredient.shelf_life_days)
          : "",
        par_level: ingredient.par_level != null ? String(ingredient.par_level) : "",
        notes: ingredient.notes ?? "",
        is_active: ingredient.is_active,
      });
    }
  }, [ingredient]);

  function onSubmit(values: IngredientEditValues) {
    updateIngredient.mutate(
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
        is_active: values.is_active,
      },
      {
        onSuccess: () => { toast.success("Ingredient saved."); router.push("/ingredients"); },
        onError: () => toast.error("Failed to save ingredient. Please try again."),
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

  if (isError || !ingredient) {
    return (
      <div className="p-6">
        <p className="text-destructive">Failed to load ingredient.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/ingredients")}>
          ← Back to Ingredients
        </Button>
      </div>
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
        <h1 className="text-2xl font-bold text-on-surface mb-6">Edit Ingredient</h1>

        <div className="rounded-lg border border-outline bg-surface-high p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <IngredientFormFields showActiveToggle />


              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => router.push("/ingredients")}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateIngredient.isPending}>
                  {updateIngredient.isPending ? "Saving…" : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
