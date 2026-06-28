"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useCreateDish } from "@/lib/dishes-api";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  dishCreateSchema,
  type DishCreateValues,
  DishFormFields,
} from "@/components/forms/DishFormFields";

export default function NewDishPage() {
  const router = useRouter();
  const createDish = useCreateDish();

  const form = useForm<DishCreateValues>({
    resolver: zodResolver(dishCreateSchema),
    defaultValues: {
      name: "",
      category: "",
      description: "",
      per_plate_cost: "",
      selling_price: "",
      is_veg: true,
      course: "",
      cuisine_type: "",
      portion_size: "",
      minimum_order_quantity: "",
      preparation_time_minutes: "",
      notes_for_kitchen: "",
      is_available_for_storefront: true,
    },
  });

  function onSubmit(values: DishCreateValues) {
    createDish.mutate(
      {
        name: values.name,
        category: values.category,
        description: values.description || undefined,
        per_plate_cost: parseFloat(values.per_plate_cost),
        selling_price: parseFloat(values.selling_price),
        is_veg: values.is_veg,
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
      { onSuccess: () => router.push("/dishes") },
    );
  }

  return (
    <div className="p-6">
      <button
        type="button"
        onClick={() => router.push("/dishes")}
        className="text-on-surface-medium hover:text-on-surface text-sm mb-6 flex items-center gap-1"
      >
        ← Back to Dishes
      </button>

      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-on-surface mb-6">New Dish</h1>

        <div className="rounded-lg border border-outline bg-surface-high p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <DishFormFields />

              {createDish.isError && (
                <p className="text-sm text-red-400">Failed to create dish. Please try again.</p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => router.push("/dishes")}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createDish.isPending}>
                  {createDish.isPending ? "Saving…" : "Save Dish"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
