"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserPlus } from "lucide-react";

import { format } from "date-fns"
import { useCreateBooking } from "@/lib/bookings-api";
import { useCustomers, useCreateCustomer } from "@/lib/customers-api";
import { useCurrencyStore } from "@/lib/currency-store";
import { getCurrencyMeta } from "@/lib/currencies";
import { toast } from "sonner";
import { FormDatePicker } from "@/components/ui/form-fields";

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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const schema = z.object({
  customer_id: z.string().min(1, "Customer is required"),
  title: z.string().min(1, "Title is required"),
  notes: z.string().optional(),
  deposit_amount: z.string().optional(),
  deposit_due_date: z.date().optional(),
  minimum_guarantee: z.string().optional(),
  payment_terms: z.string().optional(),
  cancellation_policy: z.string().optional(),
  special_instructions: z.string().optional(),
});

const newCustomerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  company_name: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;
type NewCustomerValues = z.infer<typeof newCustomerSchema>;

export default function NewBookingPage() {
  const router = useRouter();
  const symbol = getCurrencyMeta(useCurrencyStore((s) => s.currencyCode)).symbol
  const createBooking = useCreateBooking();
  const createCustomer = useCreateCustomer();
  const { data: customersPage } = useCustomers({ pageSize: 100 });
  const customers = customersPage?.items ?? [];
  const [modalOpen, setModalOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      customer_id: "",
      title: "",
      notes: "",
      deposit_amount: "",
      deposit_due_date: undefined,
      minimum_guarantee: "",
      payment_terms: "",
      cancellation_policy: "",
      special_instructions: "",
    },
  });

  const customerForm = useForm<NewCustomerValues>({
    resolver: zodResolver(newCustomerSchema),
    defaultValues: { name: "", phone: "", email: "", company_name: "" },
  });

  function onSubmit(values: FormValues) {
    createBooking.mutate(
      {
        customer_id: values.customer_id,
        title: values.title,
        notes: values.notes || undefined,
        deposit_amount: values.deposit_amount ? parseFloat(values.deposit_amount) : undefined,
        deposit_due_date: values.deposit_due_date ? format(values.deposit_due_date, "yyyy-MM-dd") : undefined,
        minimum_guarantee: values.minimum_guarantee ? parseInt(values.minimum_guarantee, 10) : undefined,
        payment_terms: values.payment_terms || undefined,
        cancellation_policy: values.cancellation_policy || undefined,
        special_instructions: values.special_instructions || undefined,
      },
      {
        onSuccess: (booking) => { toast.success("Booking created."); router.push(`/bookings/${booking.id}`); },
        onError: () => toast.error("Failed to create booking. Try again."),
      },
    );
  }

  function handleCreateCustomer(values: NewCustomerValues) {
    createCustomer.mutate(
      {
        name: values.name,
        phone: values.phone,
        email: values.email || null,
        company_name: values.company_name || null,
      },
      {
        onSuccess: (customer) => {
          toast.success(`Customer "${customer.name}" created.`);
          form.setValue("customer_id", customer.id, { shouldValidate: true });
          setModalOpen(false);
          customerForm.reset();
        },
        onError: () => toast.error("Failed to create customer. Try again."),
      },
    );
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <button
          onClick={() => router.push("/bookings")}
          className="text-on-surface-medium hover:text-on-surface text-sm mb-2 cursor-pointer"
        >
          ← Back to Bookings
        </button>
        <h1 className="text-2xl font-bold text-on-surface">New Booking</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="customer_id"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Customer *</FormLabel>
                  <button
                    type="button"
                    onClick={() => setModalOpen(true)}
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline cursor-pointer"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    New Customer
                  </button>
                </div>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}{c.company_name ? ` — ${c.company_name}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title *</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Ahmed's Wedding" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="deposit_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{`Deposit Amount (${symbol})`}</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Advance deposit" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormDatePicker name="deposit_due_date" label="Deposit Due Date" />
          </div>

          <FormField
            control={form.control}
            name="minimum_guarantee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Guarantee (guests)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Minimum guaranteed headcount" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="payment_terms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Terms</FormLabel>
                <FormControl>
                  <Textarea placeholder="e.g. 50% advance, balance on event day" rows={2} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cancellation_policy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cancellation Policy</FormLabel>
                <FormControl>
                  <Textarea placeholder="e.g. No refund within 7 days of event" rows={2} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="special_instructions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Special Instructions</FormLabel>
                <FormControl>
                  <Textarea placeholder="Any special requirements for this booking" rows={2} {...field} />
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

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={createBooking.isPending}>
              {createBooking.isPending ? "Creating…" : "Create Booking"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/bookings")}>
              Cancel
            </Button>
          </div>
        </form>
      </Form>

      {/* New Customer Modal */}
      <Dialog open={modalOpen} onOpenChange={(open) => { setModalOpen(open); if (!open) customerForm.reset(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Customer</DialogTitle>
          </DialogHeader>
          <Form {...customerForm}>
            <form onSubmit={customerForm.handleSubmit(handleCreateCustomer)} className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={customerForm.control}
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
                  control={customerForm.control}
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
              </div>
              <FormField
                control={customerForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Email (optional)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={customerForm.control}
                name="company_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <Input placeholder="Company name (optional)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => { setModalOpen(false); customerForm.reset(); }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createCustomer.isPending}>
                  {createCustomer.isPending ? "Creating…" : "Create Customer"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
