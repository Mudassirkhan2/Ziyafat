"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FlaskConical } from "lucide-react";
import { useCreateIngredient } from "@/lib/ingredients-api";
import { toast } from "sonner";
import { Form } from "@/components/ui/form";
import { FormPageShell, FormStickyFooter } from "@/components/layout/FormPageShell";
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
      {
        onSuccess: () => { toast.success("Ingredient saved."); router.push("/ingredients"); },
        onError: () => toast.error("Failed to create ingredient. Please try again."),
      },
    );
  }

  return (
    <FormPageShell
      backHref="/ingredients"
      backLabel="Back to Ingredients"
      icon={<FlaskConical className="h-5 w-5" />}
      title="New Ingredient"
      subtitle="Add a new ingredient to your inventory."
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="rounded-[20px] border border-outline-low overflow-hidden divide-y divide-outline-low shadow-[0_1px_2px_rgba(0,0,0,0.04),0_18px_40px_-28px_rgba(0,0,0,0.15)] bg-surface-high">
            <IngredientFormFields />
          </div>
          <FormStickyFooter
            cancelHref="/ingredients"
            isPending={createIngredient.isPending}
            saveLabel="Save Ingredient"
          />
        </form>
      </Form>
    </FormPageShell>
  );
}
