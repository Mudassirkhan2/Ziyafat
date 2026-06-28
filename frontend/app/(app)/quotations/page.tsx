"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { format } from "date-fns"
import { useQuotations, useCreateQuotation } from "@/lib/quotations-api";
import { toast } from "sonner";
import { FormDatePicker } from "@/components/ui/form-fields";
import { useBookingsForSelect } from "@/lib/bookings-api";
import { useDataTableState } from "@/lib/use-data-table-state";
import type { Booking, Quotation, QuotationStatus } from "@/lib/types";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/ui/data-table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { FiPlus, FiLoader, FiX, FiEye } from "react-icons/fi";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ALL_STATUSES: QuotationStatus[] = [
  "draft",
  "sent",
  "approved",
  "rejected",
  "superseded",
];

const STATUS_COLORS: Record<QuotationStatus, string> = {
  draft: "border-outline text-on-surface-medium",
  sent: "bg-blue-900/30 text-blue-400 border-blue-800",
  approved: "bg-green-900/30 text-green-400 border-green-800",
  rejected: "bg-red-900/30 text-red-400 border-red-800",
  superseded: "bg-amber-900/30 text-amber-400 border-amber-800",
};

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const quotationSchema = z.object({
  booking_id: z.string().min(1, "Booking is required"),
  valid_until: z.date().optional(),
  notes: z.string().optional(),
  discount: z.string().optional(),
});

type QuotationFormValues = z.infer<typeof quotationSchema>;

// ---------------------------------------------------------------------------
// Line item row type
// ---------------------------------------------------------------------------

interface LineItemRow {
  label: string;
  qty_per_plate: string;
  guest_count: string;
  unit_price: string;
}

const emptyRow = (): LineItemRow => ({
  label: "",
  qty_per_plate: "",
  guest_count: "",
  unit_price: "",
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function StatusBadge({ status }: { status: QuotationStatus }) {
  return (
    <Badge variant="outline" className={STATUS_COLORS[status]}>
      {capitalize(status)}
    </Badge>
  );
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function rowTotal(row: LineItemRow): number {
  const qty = parseFloat(row.qty_per_plate) || 0;
  const guests = parseFloat(row.guest_count) || 0;
  const price = parseFloat(row.unit_price) || 0;
  return qty * guests * price;
}

// ---------------------------------------------------------------------------
// Create Sheet
// ---------------------------------------------------------------------------

function CreateQuotationSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const createQuotation = useCreateQuotation();
  const { data: bookings } = useBookingsForSelect();

  const [lineItems, setLineItems] = useState<LineItemRow[]>([emptyRow()]);

  const form = useForm<QuotationFormValues>({
    resolver: zodResolver(quotationSchema),
    defaultValues: {
      booking_id: "",
      valid_until: undefined,
      notes: "",
      discount: "0",
    },
  });

  const discountValue = form.watch("discount") ?? "0";
  const subtotal = lineItems.reduce((sum, row) => sum + rowTotal(row), 0);
  const total = subtotal - (parseFloat(discountValue) || 0);

  function updateRow(index: number, field: keyof LineItemRow, value: string) {
    setLineItems((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  }

  function addRow() {
    setLineItems((prev) => [...prev, emptyRow()]);
  }

  function removeRow(index: number) {
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  }

  function resetForm() {
    form.reset();
    setLineItems([emptyRow()]);
  }

  function onSubmit(values: QuotationFormValues) {
    const payload = {
      booking_id: values.booking_id,
      valid_until: values.valid_until ? format(values.valid_until, "yyyy-MM-dd") : undefined,
      notes: values.notes || undefined,
      line_items: lineItems.map((row) => ({
        dish_id: null,
        label: row.label,
        qty_per_plate: parseFloat(row.qty_per_plate) || 0,
        guest_count: parseInt(row.guest_count, 10) || 0,
        unit_price: parseFloat(row.unit_price) || 0,
        total: rowTotal(row),
      })),
      subtotal,
      discount: parseFloat(values.discount ?? "0") || 0,
      total,
    };

    createQuotation.mutate(payload, {
      onSuccess: () => {
        toast.success("Quotation created.");
        resetForm();
        onOpenChange(false);
      },
      onError: () => toast.error("Failed to create quotation. Try again."),
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>New Quotation</SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
            {/* Booking */}
            <FormField
              control={form.control}
              name="booking_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Booking *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a booking" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(bookings?.items ?? []).map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Valid Until */}
            <FormDatePicker name="valid_until" label="Valid Until" />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any notes for the customer…" rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Discount */}
            <FormField
              control={form.control}
              name="discount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Discount (₹)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" defaultValue="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Line Items */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-on-surface">Line Items</p>
              {lineItems.map((row, index) => (
                <div
                  key={index}
                  className="rounded-md border border-outline-low p-3 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Item label (e.g. Biryani)"
                      value={row.label}
                      onChange={(e) => updateRow(index, "label", e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRow(index)}
                      disabled={lineItems.length === 1}
                      className="text-on-surface-low hover:text-red-400 px-2"
                    >
                      ✕
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      type="number"
                      placeholder="Qty/Plate"
                      value={row.qty_per_plate}
                      onChange={(e) => updateRow(index, "qty_per_plate", e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Guests"
                      value={row.guest_count}
                      onChange={(e) => updateRow(index, "guest_count", e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Unit Price ₹"
                      value={row.unit_price}
                      onChange={(e) => updateRow(index, "unit_price", e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-on-surface-medium text-right">
                    Row total: ₹{rowTotal(row).toLocaleString("en-IN")}
                  </p>
                </div>
              ))}

              <Button type="button" variant="outline" size="sm" onClick={addRow}>
                <FiPlus className="h-4 w-4" />
                Add Item
              </Button>

              <div className="rounded-md bg-surface-high border border-outline-low px-4 py-2 text-sm text-on-surface-medium">
                Subtotal:{" "}
                <span className="font-medium text-on-surface">
                  ₹{subtotal.toLocaleString("en-IN")}
                </span>
              </div>
            </div>


            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                <FiX className="h-4 w-4" />
                Cancel
              </Button>
              <Button type="submit" disabled={createQuotation.isPending}>
                {createQuotation.isPending ? (
                  <FiLoader className="h-4 w-4 animate-spin" />
                ) : (
                  <FiPlus className="h-4 w-4" />
                )}
                {createQuotation.isPending ? "Creating…" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------

function getColumns(
  router: ReturnType<typeof useRouter>,
  bookingMap: Map<string, Booking>
): ColumnDef<Quotation>[] {
  return [
    {
      id: "booking",
      header: "Booking",
      cell: ({ row }) => {
        const booking = bookingMap.get(row.original.booking_id);
        return (
          <span className="font-medium text-on-surface">
            {booking ? booking.title : row.original.booking_id}
          </span>
        );
      },
    },
    {
      id: "status",
      header: "Status",
      accessorKey: "status",
      meta: { sortable: true },
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "total",
      header: "Total",
      accessorKey: "total",
      meta: { sortable: true },
      cell: ({ row }) => (
        <span className="text-on-surface-medium">
          ₹{row.original.total.toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      id: "valid_until",
      header: "Valid Until",
      cell: ({ row }) => (
        <span className="text-on-surface-medium">{formatDate(row.original.valid_until)}</span>
      ),
    },
    {
      id: "created_at",
      header: "Created",
      accessorKey: "created_at",
      meta: { sortable: true },
      cell: ({ row }) => (
        <span className="text-on-surface-medium">{formatDate(row.original.created_at)}</span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(`/quotations/${row.original.id}`)}
          title="View"
        >
          <FiEye className="h-4 w-4" />
        </Button>
      ),
    },
  ];
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

function QuotationsContent() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<QuotationStatus | undefined>(undefined);
  const [sheetOpen, setSheetOpen] = useState(false);
  const ts = useDataTableState({ defaultSortBy: "created_at", defaultSortDir: "desc" });

  const { data: bookings } = useBookingsForSelect();

  const { data, isLoading, isError } = useQuotations({
    status: statusFilter,
    page: ts.page,
    pageSize: ts.pageSize,
    sortBy: ts.sortBy,
    sortDir: ts.sortDir,
  });

  const bookingMap = new Map((bookings?.items ?? []).map((b) => [b.id, b]));
  const columns = getColumns(router, bookingMap);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-on-surface">Quotations</h1>
        <Button onClick={() => setSheetOpen(true)}>
          <FiPlus className="h-4 w-4 mr-1" />
          New Quotation
        </Button>
      </div>

      <Tabs
        value={statusFilter ?? "all"}
        onValueChange={(val) => {
          setStatusFilter(val === "all" ? undefined : (val as QuotationStatus));
          ts.setPage(1);
        }}
        className="mb-4"
      >
        <TabsList className="bg-surface-high">
          <TabsTrigger value="all">All</TabsTrigger>
          {ALL_STATUSES.map((s) => (
            <TabsTrigger key={s} value={s}>
              {capitalize(s)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isError && (
        <p className="text-destructive text-sm mb-4">
          Failed to load quotations. Please try again.
        </p>
      )}

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        total={data?.total ?? 0}
        page={ts.page}
        pageSize={ts.pageSize}
        onPageChange={ts.setPage}
        onPageSizeChange={ts.setPageSize}
        onSortChange={ts.setSort}
        sortBy={ts.sortBy}
        sortDir={ts.sortDir}
        isLoading={isLoading}
        emptyState={
          <EmptyState
            variant="quotations"
            title="No quotations found"
            description="Create a quotation for a booking to share with your customer."
          />
        }
      />

      <CreateQuotationSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
}

export default function QuotationsPage() {
  return (
    <Suspense fallback={null}>
      <QuotationsContent />
    </Suspense>
  );
}
