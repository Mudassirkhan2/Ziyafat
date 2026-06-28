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
  FormDatePicker,
  SectionLabel,
  SectionDivider,
} from "@/components/ui/form-fields"

const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "quoted", label: "Quoted" },
  { value: "negotiating", label: "Negotiating" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
]

export const leadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  event_type: z.string().min(1, "Event type is required"),
  approx_date: z.date().optional(),
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
  follow_up_date: z.date().optional(),
  number_of_events: z.string().optional(),
})

export const leadEditSchema = leadSchema.extend({
  status: z.enum(["new", "quoted", "negotiating", "won", "lost"]),
})

export type LeadFormValues = z.infer<typeof leadSchema>
export type LeadEditValues = z.infer<typeof leadEditSchema>

interface LeadFormFieldsProps {
  showStatusField?: boolean
}

export function LeadFormFields({ showStatusField = false }: LeadFormFieldsProps) {
  return (
    <div className="space-y-0">
      {/* Contact */}
      <div className="space-y-4">
        <SectionLabel>Contact</SectionLabel>
        <div className="grid grid-cols-2 gap-4">
          <FormInput name="name" label="Name *" placeholder="Contact name" />
          <FormInput name="phone" label="Phone *" placeholder="Phone number" />
        </div>
        {showStatusField ? (
          <div className="grid grid-cols-2 gap-4">
            <FormSelect name="status" label="Status" placeholder="Select status" options={STATUS_OPTIONS} />
            <FormInput name="email" label="Email" type="email" placeholder="Email (optional)" />
          </div>
        ) : (
          <FormInput name="email" label="Email" type="email" placeholder="Email (optional)" />
        )}
      </div>

      <SectionDivider />

      {/* Event Details */}
      <div className="space-y-4">
        <SectionLabel>Event Details</SectionLabel>
        <div className="grid grid-cols-2 gap-4">
          <FormInput name="event_type" label="Event Type *" placeholder="e.g. Wedding, Birthday" />
          <FormSelect name="ceremony_type" label="Ceremony Type" placeholder="Select ceremony" options={CEREMONY_TYPE_OPTIONS} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormDatePicker name="approx_date" label="Approximate Date" />
          <FormInput name="approx_guest_count" label="Guest Count" type="number" placeholder="e.g. 200" />
        </div>
        <FormInput name="number_of_events" label="No. of Events" type="number" placeholder="1" />
      </div>

      <SectionDivider />

      {/* Catering Preferences */}
      <div className="space-y-4">
        <SectionLabel>Catering Preferences</SectionLabel>
        <div className="grid grid-cols-2 gap-4">
          <FormSelect name="food_preference" label="Food Preference" placeholder="Veg / Non-veg" options={FOOD_PREFERENCE_OPTIONS} />
          <FormSelect name="service_style" label="Service Style" placeholder="Buffet / Plated…" options={SERVICE_STYLE_OPTIONS} />
        </div>
        <FormInput name="meal_type" label="Meal Type" placeholder="e.g. Lunch, Dinner" />
      </div>

      <SectionDivider />

      {/* Budget */}
      <div className="space-y-4">
        <SectionLabel>Budget</SectionLabel>
        <div className="grid grid-cols-2 gap-4">
          <FormInput name="budget" label="Budget (₹)" type="number" placeholder="Total budget" />
          <FormInput name="budget_per_person" label="Per Person (₹)" type="number" placeholder="Per head" />
        </div>
      </div>

      <SectionDivider />

      {/* Venue & Logistics */}
      <div className="space-y-4">
        <SectionLabel>Venue & Logistics</SectionLabel>
        <div className="grid grid-cols-2 gap-4">
          <FormInput name="tentative_venue" label="Tentative Venue" placeholder="Venue name or area" />
          <FormInput name="venue_type" label="Venue Type" placeholder="e.g. Banquet hall, Outdoor" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormInput name="preferred_contact_time" label="Preferred Contact Time" placeholder="e.g. Evenings after 6pm" />
          <FormInput name="source" label="Source" placeholder="e.g. Referral, Instagram" />
        </div>
        <FormDatePicker name="follow_up_date" label="Follow-up Date" />
      </div>

      <SectionDivider />

      {/* Notes */}
      <div className="space-y-4">
        <SectionLabel>Notes</SectionLabel>
        <FormInput name="dietary_notes" label="Dietary Notes" placeholder="Any dietary requirements" />
        <FormTextarea name="notes" label="Notes" placeholder="Any additional notes…" rows={3} />
      </div>
    </div>
  )
}
