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
import type { Customer, Booking } from "@/lib/types";

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ---------------------------------------------------------------------------
// Bookings Section
// ---------------------------------------------------------------------------

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
              <TableCell className="text-on-surface font-medium">
                {booking.title}
              </TableCell>
              <TableCell className="text-on-surface-medium capitalize">
                {booking.status}
              </TableCell>
              <TableCell className="text-on-surface-medium">
                {formatDate(booking.created_at)}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/bookings/${booking.id}`)}
                >
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

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

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
    },
  });

  // Pre-fill form once customer data loads
  useEffect(() => {
    if (customer) {
      form.reset({
        name: customer.name,
        phone: customer.phone,
        email: customer.email ?? "",
        address: customer.address ?? "",
        notes: customer.notes ?? "",
      });
    }
  }, [customer, form]);

  function onSubmit(values: FormValues) {
    const payload: Partial<Customer> = {
      name: values.name,
      phone: values.phone,
      email: values.email || null,
      address: values.address || null,
      notes: values.notes || null,
    };

    updateCustomer.mutate(payload, {
      onSuccess: () => router.push("/customers"),
    });
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <p className="text-on-surface-medium">Loading…</p>
      </div>
    );
  }

  if (isError || !customer) {
    return (
      <div className="p-6">
        <p className="text-red-400">Failed to load customer. Please try again.</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push("/customers")}
        >
          ← Back to Customers
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Back link */}
      <button
        type="button"
        onClick={() => router.push("/customers")}
        className="text-on-surface-medium hover:text-on-surface text-sm mb-6 flex items-center gap-1"
      >
        ← Back to Customers
      </button>

      <div className="max-w-2xl mx-auto space-y-8">
        {/* Edit Form */}
        <div>
          <h1 className="text-2xl font-bold text-on-surface mb-6">Edit Customer</h1>

          <div className="rounded-lg border border-outline bg-surface-high p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Full name" {...field} />
                      </FormControl>
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
                      <FormControl>
                        <Input placeholder="Phone number" {...field} />
                      </FormControl>
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
                      <FormControl>
                        <Input type="email" placeholder="optional@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Address (optional)" {...field} />
                      </FormControl>
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
                      <FormControl>
                        <Textarea placeholder="Any additional notes…" rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {updateCustomer.isError && (
                  <p className="text-sm text-red-400">
                    Failed to update customer. Please try again.
                  </p>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/customers")}
                  >
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

        {/* Bookings Section */}
        <div>
          <h2 className="text-lg font-semibold text-on-surface mb-4">Bookings</h2>
          <BookingsSection customerId={id} />
        </div>
      </div>
    </div>
  );
}
