"use client"

import { z } from "zod"
import {
  CONTACT_TYPE_OPTIONS,
  COMMUNICATION_PREFERENCE_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
  REFERRAL_SOURCE_OPTIONS,
} from "@/lib/constants"
import {
  FormInput,
  FormSelect,
  FormTextarea,
  SectionLabel,
} from "@/components/ui/form-fields"

export const customerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  notes: z.string().optional(),
  company_name: z.string().optional(),
  contact_type: z.string().optional(),
  billing_address: z.string().optional(),
  dietary_restrictions: z.string().optional(),
  referral_source: z.string().optional(),
  gstin: z.string().optional(),
  preferred_payment_method: z.string().optional(),
  communication_preference: z.string().optional(),
})

export type CustomerFormValues = z.infer<typeof customerSchema>

export function CustomerFormFields() {
  return (
    <>
      {/* 1 · Identity */}
      <div className="space-y-4 px-[30px] py-[26px]">
        <SectionLabel number={1}>Identity</SectionLabel>
        <div className="grid grid-cols-2 gap-4">
          <FormInput name="name" label="Name *" placeholder="Full name" />
          <FormInput name="company_name" label="Company Name" placeholder="Company (optional)" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormInput name="phone" label="Phone *" placeholder="Phone number" />
          <FormInput name="email" label="Email" type="email" placeholder="Email (optional)" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormSelect name="contact_type" label="Contact Type" placeholder="Select type" options={CONTACT_TYPE_OPTIONS} />
          <FormSelect name="referral_source" label="Referral Source" placeholder="How did they find us?" options={REFERRAL_SOURCE_OPTIONS} />
        </div>
      </div>

      {/* 2 · Address */}
      <div className="space-y-4 px-[30px] py-[26px]">
        <SectionLabel number={2}>Address</SectionLabel>
        <FormInput name="address" label="Address" placeholder="Address (optional)" />
        <FormInput name="billing_address" label="Billing Address" placeholder="Billing address (if different)" />
      </div>

      {/* 3 · Preferences */}
      <div className="space-y-4 px-[30px] py-[26px]">
        <SectionLabel number={3}>Preferences</SectionLabel>
        <div className="grid grid-cols-2 gap-4">
          <FormSelect name="preferred_payment_method" label="Preferred Payment" placeholder="Payment method" options={PAYMENT_METHOD_OPTIONS} />
          <FormSelect name="communication_preference" label="Communication Preference" placeholder="Preferred channel" options={COMMUNICATION_PREFERENCE_OPTIONS} />
        </div>
        <FormInput name="dietary_restrictions" label="Dietary Restrictions" placeholder="e.g. No pork, nut allergy" />
      </div>

      {/* 4 · Notes */}
      <div className="space-y-4 px-[30px] py-[26px]">
        <SectionLabel number={4}>Notes</SectionLabel>
        <FormInput name="gstin" label="GSTIN" placeholder="GST number (optional)" />
        <FormTextarea name="notes" label="Notes" placeholder="Any additional notes…" rows={3} />
      </div>
    </>
  )
}
