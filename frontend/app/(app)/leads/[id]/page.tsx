"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { TrendingUp } from "lucide-react";
import { useLead, useUpdateLead, useConvertLead } from "@/lib/leads-api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormPageShell, FormStickyFooter } from "@/components/layout/FormPageShell";
import {
  leadEditSchema,
  type LeadEditValues,
  LeadFormFields,
} from "@/components/forms/LeadFormFields";

export default function EditLeadPage() {
  const router = useRouter();
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : (params.id?.[0] ?? "");

  const { data: lead, isLoading, isError } = useLead(id);
  const updateLead = useUpdateLead(id);
  const convertLead = useConvertLead();

  const form = useForm<LeadEditValues>({
    resolver: zodResolver(leadEditSchema),
    defaultValues: {
      name: "", phone: "", email: "", event_type: "",
      approx_date: undefined, approx_guest_count: "", source: "",
      notes: "", status: "new", budget: "", budget_per_person: "",
      ceremony_type: "", food_preference: "", service_style: "",
      venue_type: "", meal_type: "", tentative_venue: "",
      preferred_contact_time: "", dietary_notes: "",
      follow_up_date: undefined, number_of_events: "",
    },
  });

  useEffect(() => {
    if (lead) {
      form.reset({
        name: lead.name,
        phone: lead.phone,
        email: lead.email ?? "",
        event_type: lead.event_type,
        approx_date: lead.approx_date ? new Date(lead.approx_date) : undefined,
        approx_guest_count: lead.approx_guest_count?.toString() ?? "",
        source: lead.source ?? "",
        notes: lead.notes ?? "",
        status: lead.status,
        budget: lead.budget?.toString() ?? "",
        budget_per_person: lead.budget_per_person?.toString() ?? "",
        ceremony_type: lead.ceremony_type ?? "",
        food_preference: lead.food_preference ?? "",
        service_style: lead.service_style ?? "",
        venue_type: lead.venue_type ?? "",
        meal_type: lead.meal_type ?? "",
        tentative_venue: lead.tentative_venue ?? "",
        preferred_contact_time: lead.preferred_contact_time ?? "",
        dietary_notes: lead.dietary_notes ?? "",
        follow_up_date: lead.follow_up_date ? new Date(lead.follow_up_date) : undefined,
        number_of_events: lead.number_of_events?.toString() ?? "",
      });
    }
  }, [lead, form]);

  function onSubmit(values: LeadEditValues) {
    updateLead.mutate(
      {
        name: values.name,
        phone: values.phone,
        event_type: values.event_type,
        status: values.status,
        email: values.email || null,
        approx_date: values.approx_date ? format(values.approx_date, "yyyy-MM-dd") : null,
        approx_guest_count: values.approx_guest_count ? parseInt(values.approx_guest_count, 10) : null,
        source: values.source || null,
        notes: values.notes || null,
        budget: values.budget ? parseFloat(values.budget) : null,
        budget_per_person: values.budget_per_person ? parseFloat(values.budget_per_person) : null,
        ceremony_type: (values.ceremony_type as never) || null,
        food_preference: (values.food_preference as never) || null,
        service_style: (values.service_style as never) || null,
        venue_type: values.venue_type || null,
        meal_type: values.meal_type || null,
        tentative_venue: values.tentative_venue || null,
        preferred_contact_time: values.preferred_contact_time || null,
        dietary_notes: values.dietary_notes || null,
        follow_up_date: values.follow_up_date ? format(values.follow_up_date, "yyyy-MM-dd") : null,
        number_of_events: values.number_of_events ? parseInt(values.number_of_events, 10) : null,
      },
      {
        onSuccess: () => { toast.success("Lead saved."); router.push("/leads"); },
        onError: () => toast.error("Failed to save lead. Please try again."),
      },
    );
  }

  function handleConvert() {
    if (!lead) return;
    convertLead.mutate(lead.id, {
      onSuccess: () => { toast.success("Lead converted to customer."); router.push("/customers"); },
      onError: () => toast.error("Failed to convert lead. Please try again."),
    });
  }

  const canConvert = lead && lead.status !== "won" && lead.status !== "lost";

  if (isLoading) {
    return <div className="p-6"><p className="text-on-surface-medium">Loading lead…</p></div>;
  }

  if (isError || !lead) {
    return (
      <div className="p-6">
        <p className="text-red-400">Failed to load lead. Please go back and try again.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/leads")}>
          ← Back to Leads
        </Button>
      </div>
    );
  }

  return (
    <FormPageShell
      backHref="/leads"
      backLabel="Back to Leads"
      icon={<TrendingUp className="h-5 w-5" />}
      title="Edit Lead"
      subtitle={`Editing ${lead.name}`}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="rounded-[20px] border border-outline-low overflow-hidden divide-y divide-outline-low shadow-[0_1px_2px_rgba(0,0,0,0.04),0_18px_40px_-28px_rgba(0,0,0,0.15)] bg-surface-high">
            <LeadFormFields showStatusField />
          </div>
          <FormStickyFooter
            cancelHref="/leads"
            isPending={updateLead.isPending}
            saveLabel="Save Changes"
            leftContent={
              canConvert ? (
                <Button
                  type="button"
                  variant="outline"
                  className="border-green-800 text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20"
                  onClick={handleConvert}
                  disabled={convertLead.isPending}
                >
                  {convertLead.isPending ? "Converting…" : "Convert to Customer"}
                </Button>
              ) : undefined
            }
          />
        </form>
      </Form>
    </FormPageShell>
  );
}
