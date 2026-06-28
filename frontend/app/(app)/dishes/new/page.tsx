"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UtensilsCrossed } from "lucide-react";
import { useCreateDish } from "@/lib/dishes-api";
import { toast } from "sonner";
import { Form } from "@/components/ui/form";
import { FormPageShell, FormStickyFooter } from "@/components/layout/FormPageShell";
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
      name: "", category: "", description: "",
      per_plate_cost: "", selling_price: "",
      is_veg: true, course: "", cuisine_type: "",
      portion_size: "", minimum_order_quantity: "",
      preparation_time_minutes: "", notes_for_kitchen: "",
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
      {
        onSuccess: () => { toast.success("Dish saved."); router.push("/dishes"); },
        onError: () => toast.error("Failed to create dish. Please try again."),
      },
    );
  }

  return (
    <FormPageShell
      backHref="/dishes"
      backLabel="Back to Dishes"
      icon={<UtensilsCrossed className="h-5 w-5" />}
      title="New Dish"
      subtitle="Add a new dish to your catalog."
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="rounded-[20px] border border-outline-low overflow-hidden divide-y divide-outline-low shadow-[0_1px_2px_rgba(0,0,0,0.04),0_18px_40px_-28px_rgba(0,0,0,0.15)] bg-surface-high">
            <DishFormFields />
          </div>
          <FormStickyFooter
            cancelHref="/dishes"
            isPending={createDish.isPending}
            saveLabel="Save Dish"
          />
        </form>
      </Form>
    </FormPageShell>
  );
}
