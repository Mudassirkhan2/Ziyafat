"use client"

import { z } from "zod"
import {
  CEREMONY_TYPE_OPTIONS,
  FOOD_PREFERENCE_OPTIONS,
  SERVICE_STYLE_OPTIONS,
} from "@/lib/constants"
import {
  FormInput,
  FormSelect,
  FormTextarea,
} from "@/components/ui/form-fields"

export const leadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  event_type: z.string().min(1, "Event type is required"),
  approx_date: z.string().optional(),
  approx_guest_count: z.string().optional(),
  source: z.string().optional(),
  notes: z.string().optional(),
  budget: z.string().optional(),
  budget_per_person: z.string().optional(),
  ceremony_type: z.string().optional(),
  food_preference: z.string().optional(),
  service_style: z.string().optional(),
  venue_type: z.string().optional(),
  meal_type: z.string().optional(),
  tentative_venue: z.string().optional(),
  preferred_contact_time: z.string().optional(),
  dietary_notes: z.string().optional(),
  follow_up_date: z.string().optional(),
  number_of_events: z.string().optional(),
})

export type LeadFormValues = z.infer<typeof leadSchema>

export function LeadFormFields() {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <FormInput name="name" label="Name *" placeholder="Contact name" />
        <FormInput name="phone" label="Phone *" placeholder="Phone number" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormInput name="email" label="Email" type="email" placeholder="Email (optional)" />
        <FormInput name="event_type" label="Event Type *" placeholder="e.g. Wedding, Birthday" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormSelect name="ceremony_type" label="Ceremony Type" placeholder="Select ceremony" options={CEREMONY_TYPE_OPTIONS} />
        <FormSelect name="food_preference" label="Food Preference" placeholder="Veg / Non-veg" options={FOOD_PREFERENCE_OPTIONS} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormSelect name="service_style" label="Service Style" placeholder="Buffet / Plated…" options={SERVICE_STYLE_OPTIONS} />
        <FormInput name="approx_guest_count" label="Approx. Guest Count" type="number" placeholder="e.g. 200" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormInput name="budget" label="Budget (₹)" type="number" placeholder="Total budget" />
        <FormInput name="budget_per_person" label="Budget per Person (₹)" type="number" placeholder="Per head" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormInput name="approx_date" label="Approximate Date" type="date" />
        <FormInput name="follow_up_date" label="Follow-up Date" type="date" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormInput name="tentative_venue" label="Tentative Venue" placeholder="Venue name or area" />
        <FormInput name="venue_type" label="Venue Type" placeholder="e.g. Banquet hall, Outdoor" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormInput name="meal_type" label="Meal Type" placeholder="e.g. Lunch, Dinner" />
        <FormInput name="number_of_events" label="No. of Events" type="number" placeholder="1" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormInput name="preferred_contact_time" label="Preferred Contact Time" placeholder="e.g. Evenings after 6pm" />
        <FormInput name="source" label="Source" placeholder="e.g. Referral, Instagram" />
      </div>

      <FormInput name="dietary_notes" label="Dietary Notes" placeholder="Any dietary requirements" />

      <FormTextarea name="notes" label="Notes" placeholder="Any additional notes…" rows={3} />
    </>
  )
}
