"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { TrendingUp } from "lucide-react";
import { useCreateLead } from "@/lib/leads-api";
import { toast } from "sonner";
import { Form } from "@/components/ui/form";
import { FormPageShell, FormStickyFooter } from "@/components/layout/FormPageShell";
import {
  leadSchema,
  type LeadFormValues,
  LeadFormFields,
} from "@/components/forms/LeadFormFields";

function guessMealType(): string {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 11) return "breakfast";
  if (hour >= 11 && hour < 16) return "lunch";
  return "dinner";
}

export default function NewLeadPage() {
  const router = useRouter();
  const createLead = useCreateLead();

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: "", phone: "", email: "", event_type: "",
      approx_date: undefined, approx_guest_count: "", source: "",
      notes: "", budget: "", budget_per_person: "", ceremony_type: "",
      food_preference: "", service_style: "", venue_type: "", meal_type: guessMealType(),
      tentative_venue: "", preferred_contact_time: "", dietary_notes: "",
      follow_up_date: undefined, number_of_events: "",
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
    <FormPageShell
      backHref="/leads"
      backLabel="Back to Leads"
      icon={<TrendingUp className="h-5 w-5" />}
      title="New Lead"
      subtitle="Capture a new enquiry or prospect."
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="rounded-[20px] border border-outline-low overflow-hidden divide-y divide-outline-low shadow-[0_1px_2px_rgba(0,0,0,0.04),0_18px_40px_-28px_rgba(0,0,0,0.15)] bg-surface-high">
            <LeadFormFields />
          </div>
          <FormStickyFooter
            cancelHref="/leads"
            isPending={createLead.isPending}
            saveLabel="Save Lead"
          />
        </form>
      </Form>
    </FormPageShell>
  );
}
