"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTaxes, useCreateTax, useUpdateTax, useDeleteTax } from "@/lib/taxes-api";
import { toast } from "sonner";
import type { Tax } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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

const taxSchema = z.object({
  name: z.string().min(1, "Name is required"),
  rate: z.string().refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) >= 0, "Must be a valid rate"),
  calculation_method: z.enum(["additive", "inclusive"]),
  is_active: z.boolean(),
});

type TaxFormValues = z.infer<typeof taxSchema>;

function TaxForm({
  defaultValues,
  onSubmit,
  isPending,
  submitLabel,
}: {
  defaultValues: TaxFormValues;
  onSubmit: (values: TaxFormValues) => void;
  isPending: boolean;
  submitLabel: string;
}) {
  const form = useForm<TaxFormValues>({
    resolver: zodResolver(taxSchema),
    defaultValues,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl><Input placeholder="e.g. GST, VAT, Sales Tax" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="rate" render={({ field }) => (
            <FormItem>
              <FormLabel>Rate (%)</FormLabel>
              <FormControl><Input type="number" step="0.01" min="0" placeholder="18" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="calculation_method" render={({ field }) => (
            <FormItem>
              <FormLabel>Calculation Method</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="additive">Additive (added on top)</SelectItem>
                  <SelectItem value="inclusive">Inclusive (already in price)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="is_active" render={({ field }) => (
          <FormItem className="flex items-center gap-3">
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <FormLabel className="!mt-0">Active</FormLabel>
          </FormItem>
        )} />

        <DialogFooter>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving…" : submitLabel}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

export default function TaxesSettingsPage() {
  const { data: taxes = [], isLoading } = useTaxes();
  const createTax = useCreateTax();
  const deleteTax = useDeleteTax();

  const [createOpen, setCreateOpen] = useState(false);
  const [editingTax, setEditingTax] = useState<Tax | null>(null);
  const updateTax = useUpdateTax(editingTax?.id ?? "");

  function handleCreate(values: TaxFormValues) {
    createTax.mutate(
      { name: values.name, rate: parseFloat(values.rate), calculation_method: values.calculation_method, is_active: values.is_active },
      {
        onSuccess: () => { toast.success("Tax rate created."); setCreateOpen(false); },
        onError: () => toast.error("Failed to create tax rate."),
      },
    );
  }

  function handleUpdate(values: TaxFormValues) {
    updateTax.mutate(
      { name: values.name, rate: parseFloat(values.rate), calculation_method: values.calculation_method, is_active: values.is_active },
      {
        onSuccess: () => { toast.success("Tax rate updated."); setEditingTax(null); },
        onError: () => toast.error("Failed to update tax rate."),
      },
    );
  }

  function handleDelete(id: string) {
    deleteTax.mutate(id, {
      onSuccess: () => toast.success("Tax rate deleted."),
      onError: () => toast.error("Failed to delete tax rate."),
    });
  }

  if (isLoading) return <p className="text-on-surface-medium">Loading…</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-on-surface-medium">
            Define tax rates (GST, VAT, Sales Tax) to apply on invoices.
          </p>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          Add Tax Rate
        </Button>
      </div>

      {taxes.length === 0 ? (
        <div className="rounded-lg border border-dashed border-outline-low p-8 text-center">
          <p className="text-sm text-on-surface-medium">No tax rates configured yet.</p>
          <p className="text-xs text-on-surface-low mt-1">
            Add your first tax rate to start applying taxes to invoices.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-outline-low rounded-lg border border-outline-low overflow-hidden">
          {taxes.map((tax) => (
            <div key={tax.id} className="flex items-center justify-between px-4 py-3 bg-surface-high">
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-sm font-medium text-on-surface">{tax.name}</p>
                  <p className="text-xs text-on-surface-low capitalize">
                    {tax.rate}% &middot; {tax.calculation_method}
                  </p>
                </div>
                {!tax.is_active && (
                  <Badge variant="outline" className="text-xs text-on-surface-low border-outline-low">
                    Inactive
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-on-surface-medium"
                  onClick={() => setEditingTax(tax)}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 dark:text-red-400"
                  disabled={deleteTax.isPending}
                  onClick={() => handleDelete(tax.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Tax Rate</DialogTitle>
          </DialogHeader>
          <TaxForm
            defaultValues={{ name: "", rate: "0", calculation_method: "additive", is_active: true }}
            onSubmit={handleCreate}
            isPending={createTax.isPending}
            submitLabel="Create"
          />
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editingTax} onOpenChange={(open) => { if (!open) setEditingTax(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tax Rate</DialogTitle>
          </DialogHeader>
          {editingTax && (
            <TaxForm
              defaultValues={{
                name: editingTax.name,
                rate: String(editingTax.rate),
                calculation_method: editingTax.calculation_method,
                is_active: editingTax.is_active,
              }}
              onSubmit={handleUpdate}
              isPending={updateTax.isPending}
              submitLabel="Save Changes"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
