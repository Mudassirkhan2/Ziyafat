"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useCreateLead } from "@/lib/leads-api";
import {
  CEREMONY_TYPE_OPTIONS,
  FOOD_PREFERENCE_OPTIONS,
  SERVICE_STYLE_OPTIONS,
} from "@/lib/constants";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
});

type FormValues = z.infer<typeof schema>;

export default function NewLeadPage() {
  const router = useRouter();
  const createLead = useCreateLead();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
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

  function onSubmit(values: FormValues) {
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
      { onSuccess: () => router.push("/leads") },
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
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name *</FormLabel>
                      <FormControl><Input placeholder="Contact name" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone *</FormLabel>
                      <FormControl><Input placeholder="Phone number" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl><Input type="email" placeholder="Email (optional)" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="event_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Type *</FormLabel>
                      <FormControl><Input placeholder="e.g. Wedding, Birthday" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="ceremony_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ceremony Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select ceremony" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CEREMONY_TYPE_OPTIONS.map((opt) => (
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
                  name="food_preference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Food Preference</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Veg / Non-veg" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {FOOD_PREFERENCE_OPTIONS.map((opt) => (
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
                  name="service_style"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Style</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Buffet / Plated…" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SERVICE_STYLE_OPTIONS.map((opt) => (
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
                  name="approx_guest_count"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Approx. Guest Count</FormLabel>
                      <FormControl><Input type="number" placeholder="e.g. 200" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget (₹)</FormLabel>
                      <FormControl><Input type="number" placeholder="Total budget" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="budget_per_person"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget per Person (₹)</FormLabel>
                      <FormControl><Input type="number" placeholder="Per head" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="approx_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Approximate Date</FormLabel>
                      <FormControl><Input type="date" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="follow_up_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Follow-up Date</FormLabel>
                      <FormControl><Input type="date" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="tentative_venue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tentative Venue</FormLabel>
                      <FormControl><Input placeholder="Venue name or area" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="venue_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Venue Type</FormLabel>
                      <FormControl><Input placeholder="e.g. Banquet hall, Outdoor" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="meal_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meal Type</FormLabel>
                      <FormControl><Input placeholder="e.g. Lunch, Dinner" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="number_of_events"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>No. of Events</FormLabel>
                      <FormControl><Input type="number" placeholder="1" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="preferred_contact_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Contact Time</FormLabel>
                      <FormControl><Input placeholder="e.g. Evenings after 6pm" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Source</FormLabel>
                      <FormControl><Input placeholder="e.g. Referral, Instagram" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="dietary_notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dietary Notes</FormLabel>
                    <FormControl><Input placeholder="Any dietary requirements" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl><Textarea placeholder="Any additional notes…" rows={3} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {createLead.isError && (
                <p className="text-sm text-red-400">Failed to create lead. Please try again.</p>
              )}

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
