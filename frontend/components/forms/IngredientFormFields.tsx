"use client"

import { z } from "zod"
import { INGREDIENT_CATEGORY_OPTIONS } from "@/lib/constants"
import {
  FormInput,
  FormSelect,
  FormTextarea,
  FormSwitch,
  SectionLabel,
} from "@/components/ui/form-fields"

export const INGREDIENT_UNITS = ["kg", "g", "L", "ml", "pcs", "dozen", "box", "bag"]

const UNIT_OPTIONS = INGREDIENT_UNITS.map((u) => ({ value: u, label: u }))

export const ingredientCreateSchema = z.object({
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
})

export const ingredientEditSchema = ingredientCreateSchema.extend({
  is_active: z.boolean(),
})

export type IngredientCreateValues = z.infer<typeof ingredientCreateSchema>
export type IngredientEditValues = z.infer<typeof ingredientEditSchema>

interface IngredientFormFieldsProps {
  showActiveToggle?: boolean
}

export function IngredientFormFields({ showActiveToggle = false }: IngredientFormFieldsProps) {
  return (
    <>
      {/* 1 · Basics */}
      <div className="space-y-4 px-[30px] py-[26px]">
        <SectionLabel number={1}>Basics</SectionLabel>
        <div className="grid grid-cols-2 gap-4">
          <FormInput name="name" label="Name *" placeholder="Ingredient name" />
          <FormSelect name="category" label="Category" placeholder="Select category" options={INGREDIENT_CATEGORY_OPTIONS} />
        </div>
      </div>

      {/* 2 · Units & Cost */}
      <div className="space-y-4 px-[30px] py-[26px]">
        <SectionLabel number={2}>Units & Cost</SectionLabel>
        <div className="grid grid-cols-3 gap-4">
          <FormSelect name="base_unit" label="Base Unit *" placeholder="Unit" options={UNIT_OPTIONS} />
          <FormInput name="cost_per_unit" label="Cost per Unit (₹) *" type="number" step="0.01" placeholder="0.00" />
          <FormInput name="purchase_unit" label="Purchase Unit" placeholder="e.g. 50kg bag" />
        </div>
      </div>

      {/* 3 · Stock */}
      <div className="space-y-4 px-[30px] py-[26px]">
        <SectionLabel number={3}>Stock</SectionLabel>
        <div className="grid grid-cols-3 gap-4">
          <FormInput name="stock_on_hand" label="Stock on Hand" type="number" step="0.01" />
          <FormInput name="reorder_threshold" label="Reorder Threshold" type="number" step="0.01" />
          <FormInput name="par_level" label="PAR Level" type="number" step="0.01" placeholder="Auto-replenishment" />
        </div>
      </div>

      {/* 4 · Quality */}
      <div className="space-y-4 px-[30px] py-[26px]">
        <SectionLabel number={4}>Quality</SectionLabel>
        <div className="grid grid-cols-3 gap-4">
          <FormInput name="yield_percentage" label="Yield (%)" type="number" step="0.1" />
          <FormInput name="waste_percentage" label="Waste (%)" type="number" step="0.1" />
          <FormInput name="shelf_life_days" label="Shelf Life (days)" type="number" placeholder="Days" />
        </div>
      </div>

      {/* 5 · Storage & Supplier */}
      <div className="space-y-4 px-[30px] py-[26px]">
        <SectionLabel number={5}>Storage & Supplier</SectionLabel>
        <div className="grid grid-cols-2 gap-4">
          <FormInput name="supplier" label="Supplier" placeholder="Supplier name" />
          <FormInput name="storage_location" label="Storage Location" placeholder="e.g. Cold storage A" />
        </div>
      </div>

      {/* 6 · Settings & Notes */}
      <div className="space-y-4 px-[30px] py-[26px]">
        <SectionLabel number={6}>Settings & Notes</SectionLabel>
        <div className="flex gap-6">
          <FormSwitch name="allergen_flag" label="Contains Allergen" />
          {showActiveToggle && <FormSwitch name="is_active" label="Active" />}
        </div>
        <FormTextarea name="notes" label="Notes" placeholder="Any additional notes" rows={2} />
      </div>
    </>
  )
}
