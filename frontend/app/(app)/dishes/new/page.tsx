"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useCreateDish } from "@/lib/dishes-api";
import {
  DISH_COURSE_OPTIONS,
  CUISINE_TYPE_OPTIONS,
} from "@/lib/constants";

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

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  per_plate_cost: z.string().min(1, "Cost is required"),
  selling_price: z.string().min(1, "Selling price is required"),
  is_veg: z.boolean(),
  course: z.string().optional(),
  cuisine_type: z.string().optional(),
  portion_size: z.string().optional(),
  minimum_order_quantity: z.string().optional(),
  preparation_time_minutes: z.string().optional(),
  notes_for_kitchen: z.string().optional(),
  is_available_for_storefront: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export default function NewDishPage() {
  const router = useRouter();
  const createDish = useCreateDish();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
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

  function onSubmit(values: FormValues) {
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
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name *</FormLabel>
                      <FormControl><Input placeholder="Dish name" {...field} /></FormControl>
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
                      <FormControl><Input placeholder="e.g. Biryani, Starters" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="course"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {DISH_COURSE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cuisine_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cuisine</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select cuisine" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CUISINE_TYPE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="per_plate_cost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cost per Plate (₹) *</FormLabel>
                      <FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} /></FormControl>
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
                      <FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="portion_size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Portion Size</FormLabel>
                      <FormControl><Input placeholder="e.g. 250g" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="minimum_order_quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Min. Order Qty</FormLabel>
                      <FormControl><Input type="number" placeholder="Min plates" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="preparation_time_minutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prep Time (mins)</FormLabel>
                      <FormControl><Input type="number" placeholder="Minutes" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl><Textarea placeholder="Dish description" rows={2} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes_for_kitchen"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kitchen Notes</FormLabel>
                    <FormControl><Textarea placeholder="Preparation notes for kitchen staff" rows={2} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-6">
                <FormField
                  control={form.control}
                  name="is_veg"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="!mt-0">Vegetarian</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="is_available_for_storefront"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="!mt-0">Show on Storefront</FormLabel>
                    </FormItem>
                  )}
                />
              </div>

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
