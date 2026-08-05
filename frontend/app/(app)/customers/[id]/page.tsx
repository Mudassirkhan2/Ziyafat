"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  useCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
  useCustomerBookings,
} from "@/lib/customers-api";
import { toast } from "sonner";
import type { Booking } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Form } from "@/components/ui/form";
import { Users } from "lucide-react";
import { FiLoader } from "react-icons/fi";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { FormPageShell, FormStickyFooter } from "@/components/layout/FormPageShell";
import {
  customerSchema,
  type CustomerFormValues,
  CustomerFormFields,
} from "@/components/forms/CustomerFormFields";

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
      <EmptyState
        variant="bookings"
        title="No bookings yet"
        description="This customer has no bookings yet."
      />
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

export default function EditCustomerPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: customer, isLoading, isError } = useCustomer(id);
  const updateCustomer = useUpdateCustomer(id);
  const deleteCustomer = useDeleteCustomer();

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "", phone: "", email: "", address: "", notes: "",
      company_name: "", contact_type: "", billing_address: "",
      dietary_restrictions: "", referral_source: "", gstin: "",
      preferred_payment_method: "", communication_preference: "",
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

  function handleDelete() {
    deleteCustomer.mutate(id, {
      onSuccess: () => {
        toast.success("Customer deleted.");
        router.push("/customers");
      },
      onError: () => toast.error("Failed to delete customer. Please try again."),
    });
  }

  function onSubmit(values: CustomerFormValues) {
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
      {
        onSuccess: () => { toast.success("Customer saved."); router.push("/customers"); },
        onError: () => toast.error("Failed to update customer. Please try again."),
      },
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 flex items-center gap-2 text-on-surface-medium">
        <FiLoader className="h-4 w-4 animate-spin" /> Loading…
      </div>
    );
  }

  if (isError || !customer) {
    return (
      <div className="p-6">
        <p className="text-destructive">Failed to load customer.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/customers")}>
          ← Back to Customers
        </Button>
      </div>
    );
  }

  return (
    <FormPageShell
      backHref="/customers"
      backLabel="Back to Customers"
      icon={<Users className="h-5 w-5" />}
      title="Edit Customer"
      subtitle={`Editing ${customer.name}`}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="rounded-[20px] border border-outline-low overflow-hidden divide-y divide-outline-low shadow-[0_1px_2px_rgba(0,0,0,0.04),0_18px_40px_-28px_rgba(0,0,0,0.15)] bg-surface-high">
            <CustomerFormFields />
          </div>
          <FormStickyFooter
            cancelHref="/customers"
            isPending={updateCustomer.isPending}
            saveLabel="Save Changes"
          />
        </form>
      </Form>

      <div className="mt-10">
        <h2 className="text-lg font-semibold text-on-surface mb-4">Bookings</h2>
        <BookingsSection customerId={id} />
      </div>

      {/* Danger zone */}
      <div className="mt-10 rounded-lg border border-red-200 dark:border-red-900/50 p-5">
        <h2 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">Danger Zone</h2>
        <p className="text-sm text-on-surface-medium mb-4">
          Permanently delete this customer and all associated data. This action cannot be undone.
        </p>
        <Button
          variant="outline"
          className="border-red-600 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
          onClick={() => setDeleteDialogOpen(true)}
        >
          Delete Customer
        </Button>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {customer.name}?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-on-surface-medium">
            This will permanently delete the customer and cannot be undone. Any bookings linked to this customer will lose their customer reference.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteCustomer.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteCustomer.isPending}
            >
              {deleteCustomer.isPending ? "Deleting…" : "Delete Customer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </FormPageShell>
  );
}
