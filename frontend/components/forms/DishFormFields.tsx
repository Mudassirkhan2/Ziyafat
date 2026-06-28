"use client"

import { z } from "zod"
import { DISH_COURSE_OPTIONS, CUISINE_TYPE_OPTIONS } from "@/lib/constants"
import {
  FormInput,
  FormSelect,
  FormTextarea,
  FormSwitch,
  SectionLabel,
} from "@/components/ui/form-fields"

export const dishCreateSchema = z.object({
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
})

export const dishEditSchema = dishCreateSchema.extend({
  is_active: z.boolean(),
})

export type DishCreateValues = z.infer<typeof dishCreateSchema>
export type DishEditValues = z.infer<typeof dishEditSchema>

interface DishFormFieldsProps {
  showActiveToggle?: boolean
}

export function DishFormFields({ showActiveToggle = false }: DishFormFieldsProps) {
  return (
    <>
      {/* 1 · Basics */}
      <div className="space-y-4 px-[30px] py-[26px]">
        <SectionLabel number={1}>Basics</SectionLabel>
        <div className="grid grid-cols-2 gap-4">
          <FormInput name="name" label="Name *" placeholder="Dish name" />
          <FormInput name="category" label="Category *" placeholder="e.g. Biryani, Starters" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormSelect name="course" label="Course" placeholder="Select course" options={DISH_COURSE_OPTIONS} />
          <FormSelect name="cuisine_type" label="Cuisine" placeholder="Select cuisine" options={CUISINE_TYPE_OPTIONS} />
        </div>
      </div>

      {/* 2 · Pricing */}
      <div className="space-y-4 px-[30px] py-[26px]">
        <SectionLabel number={2}>Pricing</SectionLabel>
        <div className="grid grid-cols-2 gap-4">
          <FormInput name="per_plate_cost" label="Cost per Plate (₹) *" type="number" step="0.01" placeholder="0.00" />
          <FormInput name="selling_price" label="Selling Price (₹) *" type="number" step="0.01" placeholder="0.00" />
        </div>
      </div>

      {/* 3 · Production */}
      <div className="space-y-4 px-[30px] py-[26px]">
        <SectionLabel number={3}>Production</SectionLabel>
        <div className="grid grid-cols-3 gap-4">
          <FormInput name="portion_size" label="Portion Size" placeholder="e.g. 250g" />
          <FormInput name="minimum_order_quantity" label="Min. Order Qty" type="number" placeholder="Min plates" />
          <FormInput name="preparation_time_minutes" label="Prep Time (mins)" type="number" placeholder="Minutes" />
        </div>
      </div>

      {/* 4 · Details */}
      <div className="space-y-4 px-[30px] py-[26px]">
        <SectionLabel number={4}>Details</SectionLabel>
        <FormTextarea name="description" label="Description" placeholder="Dish description" rows={2} />
        <FormTextarea name="notes_for_kitchen" label="Kitchen Notes" placeholder="Preparation notes for kitchen staff" rows={2} />
      </div>

      {/* 5 · Settings */}
      <div className="space-y-3 px-[30px] py-[26px]">
        <SectionLabel number={5}>Settings</SectionLabel>
        <div className="flex gap-6">
          <FormSwitch name="is_veg" label="Vegetarian" />
          {showActiveToggle && <FormSwitch name="is_active" label="Active" />}
          <FormSwitch name="is_available_for_storefront" label="Show on Storefront" />
        </div>
      </div>
    </>
  )
}
