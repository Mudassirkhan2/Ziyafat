"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  useCustomer,
  useUpdateCustomer,
  useCustomerBookings,
} from "@/lib/customers-api";
import type { Booking } from "@/lib/types";
import {
  CONTACT_TYPE_OPTIONS,
  COMMUNICATION_PREFERENCE_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
  REFERRAL_SOURCE_OPTIONS,
} from "@/lib/constants";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/ui/empty-state";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const schema = z.object({
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
});

type FormValues = z.infer<typeof schema>;

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function BookingsSection({ customerId }: { customerId: string }) {
  const router = useRouter();
  const { data: bookings, isLoading } = useCustomerBookings(customerId);

  if (isLoading) {
    return <p className="text-on-surface-medium text-sm">Loading bookings…</p>;
  }

  if (!bookings || bookings.length === 0) {
    return (
      <EmptyState variant="bookings" title="No bookings yet" description="This customer has no bookings yet." />
    );
  }

  return (
    <div className="rounded-lg border border-outline overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-surface-high">
            <TableHead className="text-on-surface-medium">Title</TableHead>
            <TableHead className="text-on-surface-medium">Status</TableHead>
            <TableHead className="text-on-surface-medium">Created</TableHead>
            <TableHead className="text-on-surface-medium text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((booking: Booking) => (
            <TableRow key={booking.id} className="border-outline-low">
              <TableCell className="text-on-surface font-medium">{booking.title}</TableCell>
              <TableCell className="text-on-surface-medium capitalize">{booking.status}</TableCell>
              <TableCell className="text-on-surface-medium">{formatDate(booking.created_at)}</TableCell>
              <TableCell className="text-right">
                <Button variant="outline" size="sm" onClick={() => router.push(`/bookings/${booking.id}`)}>
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function EditCustomerPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: customer, isLoading, isError } = useCustomer(id);
  const updateCustomer = useUpdateCustomer(id);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      address: "",
      notes: "",
      company_name: "",
      contact_type: "",
      billing_address: "",
      dietary_restrictions: "",
      referral_source: "",
      gstin: "",
      preferred_payment_method: "",
      communication_preference: "",
    },
  });

  useEffect(() => {
    if (customer) {
      form.reset({
        name: customer.name,
        phone: customer.phone,
        email: customer.email ?? "",
        address: customer.address ?? "",
        notes: customer.notes ?? "",
        company_name: customer.company_name ?? "",
        contact_type: customer.contact_type ?? "",
        billing_address: customer.billing_address ?? "",
        dietary_restrictions: customer.dietary_restrictions ?? "",
        referral_source: customer.referral_source ?? "",
        gstin: customer.gstin ?? "",
        preferred_payment_method: customer.preferred_payment_method ?? "",
        communication_preference: customer.communication_preference ?? "",
      });
    }
  }, [customer, form]);

  function onSubmit(values: FormValues) {
    updateCustomer.mutate(
      {
        name: values.name,
        phone: values.phone,
        email: values.email || null,
        address: values.address || null,
        notes: values.notes || null,
        company_name: values.company_name || null,
        contact_type: (values.contact_type as never) || null,
        billing_address: values.billing_address || null,
        dietary_restrictions: values.dietary_restrictions || null,
        referral_source: values.referral_source || null,
        gstin: values.gstin || null,
        preferred_payment_method: values.preferred_payment_method || null,
        communication_preference: values.communication_preference || null,
      },
      { onSuccess: () => router.push("/customers") },
    );
  }

  if (isLoading) {
    return <div className="p-6"><p className="text-on-surface-medium">Loading…</p></div>;
  }

  if (isError || !customer) {
    return (
      <div className="p-6">
        <p className="text-red-400">Failed to load customer. Please try again.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/customers")}>
          ← Back to Customers
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <button
        type="button"
        onClick={() => router.push("/customers")}
        className="text-on-surface-medium hover:text-on-surface text-sm mb-6 flex items-center gap-1"
      >
        ← Back to Customers
      </button>

      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-on-surface mb-6">Edit Customer</h1>

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
                        <FormControl><Input placeholder="Full name" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="company_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl><Input placeholder="Company (optional)" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contact_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CONTACT_TYPE_OPTIONS.map((opt) => (
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
                    name="referral_source"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Referral Source</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger><SelectValue placeholder="How did they find us?" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {REFERRAL_SOURCE_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl><Input placeholder="Address (optional)" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="billing_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Billing Address</FormLabel>
                      <FormControl><Input placeholder="Billing address (if different)" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="preferred_payment_method"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Payment</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger><SelectValue placeholder="Payment method" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PAYMENT_METHOD_OPTIONS.map((opt) => (
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
                    name="communication_preference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Communication Preference</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger><SelectValue placeholder="Preferred channel" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {COMMUNICATION_PREFERENCE_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="gstin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GSTIN</FormLabel>
                      <FormControl><Input placeholder="GST number (optional)" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dietary_restrictions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dietary Restrictions</FormLabel>
                      <FormControl><Input placeholder="e.g. No pork, nut allergy" {...field} /></FormControl>
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

                {updateCustomer.isError && (
                  <p className="text-sm text-red-400">Failed to update customer. Please try again.</p>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => router.push("/customers")}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateCustomer.isPending}>
                    {updateCustomer.isPending ? "Saving…" : "Save Changes"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-on-surface mb-4">Bookings</h2>
          <BookingsSection customerId={id} />
        </div>
      </div>
    </div>
  );
}
