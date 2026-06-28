"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useCreateLead } from "@/lib/leads-api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  leadSchema,
  type LeadFormValues,
  LeadFormFields,
} from "@/components/forms/LeadFormFields";

export default function NewLeadPage() {
  const router = useRouter();
  const createLead = useCreateLead();

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      event_type: "",
      approx_date: "",
      approx_guest_count: "",
      source: "",
      notes: "",
      budget: "",
      budget_per_person: "",
      ceremony_type: "",
      food_preference: "",
      service_style: "",
      venue_type: "",
      meal_type: "",
      tentative_venue: "",
      preferred_contact_time: "",
      dietary_notes: "",
      follow_up_date: "",
      number_of_events: "",
    },
  });

  function onSubmit(values: LeadFormValues) {
    createLead.mutate(
      {
        name: values.name,
        phone: values.phone,
        event_type: values.event_type,
        email: values.email || undefined,
        approx_date: values.approx_date || undefined,
        approx_guest_count: values.approx_guest_count ? parseInt(values.approx_guest_count, 10) : undefined,
        source: values.source || undefined,
        notes: values.notes || undefined,
        budget: values.budget ? parseFloat(values.budget) : undefined,
        budget_per_person: values.budget_per_person ? parseFloat(values.budget_per_person) : undefined,
        ceremony_type: (values.ceremony_type as never) || undefined,
        food_preference: (values.food_preference as never) || undefined,
        service_style: (values.service_style as never) || undefined,
        venue_type: values.venue_type || undefined,
        meal_type: values.meal_type || undefined,
        tentative_venue: values.tentative_venue || undefined,
        preferred_contact_time: values.preferred_contact_time || undefined,
        dietary_notes: values.dietary_notes || undefined,
        follow_up_date: values.follow_up_date || undefined,
        number_of_events: values.number_of_events ? parseInt(values.number_of_events, 10) : undefined,
      },
      {
        onSuccess: () => { toast.success("Lead created."); router.push("/leads"); },
        onError: () => toast.error("Failed to create lead. Please try again."),
      },
    );
  }

  return (
    <div className="p-6">
      <button
        type="button"
        onClick={() => router.push("/leads")}
        className="text-sm text-on-surface-medium hover:text-on-surface mb-6 flex items-center gap-1"
      >
        ← Back to Leads
      </button>

      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-on-surface mb-6">New Lead</h1>

        <div className="rounded-lg border border-outline bg-surface-high p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <LeadFormFields />

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => router.push("/leads")}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createLead.isPending}>
                  {createLead.isPending ? "Saving…" : "Save Lead"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
