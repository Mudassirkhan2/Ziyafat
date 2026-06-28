"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
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
      approx_date: undefined,
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
      follow_up_date: undefined,
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
        approx_date: values.approx_date ? format(values.approx_date, "yyyy-MM-dd") : undefined,
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
        follow_up_date: values.follow_up_date ? format(values.follow_up_date, "yyyy-MM-dd") : undefined,
        number_of_events: values.number_of_events ? parseInt(values.number_of_events, 10) : undefined,
      },
      {
        onSuccess: () => { toast.success("Lead created."); router.push("/leads"); },
        onError: () => toast.error("Failed to create lead. Please try again."),
      },
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <button
        type="button"
        onClick={() => router.push("/leads")}
        className="inline-flex items-center gap-1.5 text-sm text-on-surface-medium hover:text-on-surface mb-8 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Leads
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-on-surface">New Lead</h1>
        <p className="text-sm text-on-surface-medium mt-1">Capture a new enquiry or prospect.</p>
      </div>

      <div className="rounded-xl border border-outline-low bg-surface-high overflow-hidden">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="p-6">
              <LeadFormFields />
            </div>

            <div className="flex justify-end gap-2 px-6 py-4 bg-surface border-t border-outline-low">
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
  );
}
