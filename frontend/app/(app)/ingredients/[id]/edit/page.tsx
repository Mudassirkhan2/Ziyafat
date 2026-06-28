"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useIngredient, useUpdateIngredient } from "@/lib/ingredients-api";
import { INGREDIENT_CATEGORY_OPTIONS } from "@/lib/constants";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FiLoader } from "react-icons/fi";

const UNITS = ["kg", "g", "L", "ml", "pcs", "dozen", "box", "bag"];

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  base_unit: z.string().min(1, "Unit is required"),
  cost_per_unit: z.string().min(1, "Cost is required"),
  supplier: z.string().optional(),
  stock_on_hand: z.string().optional(),
  reorder_threshold: z.string().optional(),
  category: z.string().optional(),
  yield_percentage: z.string().optional(),
  purchase_unit: z.string().optional(),
  unit_conversion_factor: z.string().optional(),
  allergen_flag: z.boolean(),
  waste_percentage: z.string().optional(),
  storage_location: z.string().optional(),
  shelf_life_days: z.string().optional(),
  par_level: z.string().optional(),
  notes: z.string().optional(),
  is_active: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export default function EditIngredientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const { data: ingredient, isLoading, isError } = useIngredient(id);
  const updateIngredient = useUpdateIngredient(id);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
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

  function onSubmit(values: FormValues) {
    updateIngredient.mutate(
      {
        name: values.name,
        base_unit: values.base_unit,
        cost_per_unit: parseFloat(values.cost_per_unit),
        supplier: values.supplier || undefined,
        stock_on_hand: values.stock_on_hand ? parseFloat(values.stock_on_hand) : 0,
        reorder_threshold: values.reorder_threshold
          ? parseFloat(values.reorder_threshold)
          : 0,
        category: (values.category as never) || undefined,
        yield_percentage: values.yield_percentage
          ? parseFloat(values.yield_percentage)
          : 100,
        purchase_unit: values.purchase_unit || undefined,
        unit_conversion_factor: values.unit_conversion_factor
          ? parseFloat(values.unit_conversion_factor)
          : undefined,
        allergen_flag: values.allergen_flag,
        waste_percentage: values.waste_percentage
          ? parseFloat(values.waste_percentage)
          : 0,
        storage_location: values.storage_location || undefined,
        shelf_life_days: values.shelf_life_days
          ? parseInt(values.shelf_life_days, 10)
          : undefined,
        par_level: values.par_level ? parseFloat(values.par_level) : undefined,
        notes: values.notes || undefined,
        is_active: values.is_active,
      },
      { onSuccess: () => router.push("/ingredients") }
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
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push("/ingredients")}
        >
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
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name *</FormLabel>
                      <FormControl><Input placeholder="Ingredient name" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {INGREDIENT_CATEGORY_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="base_unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base Unit *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Unit" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {UNITS.map((u) => (
                            <SelectItem key={u} value={u}>{u}</SelectItem>
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
                      <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="purchase_unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purchase Unit</FormLabel>
                      <FormControl><Input placeholder="e.g. 50kg bag" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="stock_on_hand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock on Hand</FormLabel>
                      <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
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
                      <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="yield_percentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Yield (%)</FormLabel>
                      <FormControl><Input type="number" step="0.1" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="waste_percentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Waste (%)</FormLabel>
                      <FormControl><Input type="number" step="0.1" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="shelf_life_days"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shelf Life (days)</FormLabel>
                      <FormControl><Input type="number" placeholder="Days" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="supplier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier</FormLabel>
                      <FormControl><Input placeholder="Supplier name" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="storage_location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Storage Location</FormLabel>
                      <FormControl><Input placeholder="e.g. Cold storage A" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="par_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PAR Level</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Periodic Automatic Replenishment level"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-6">
                <FormField
                  control={form.control}
                  name="allergen_flag"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="!mt-0">Contains Allergen</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="!mt-0">Active</FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Any additional notes" rows={2} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {updateIngredient.isError && (
                <p className="text-sm text-destructive">
                  Failed to save ingredient. Please try again.
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/ingredients")}
                >
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
