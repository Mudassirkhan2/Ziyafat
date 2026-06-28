"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  useInvoice,
  useUpdateInvoice,
  useDeleteInvoice,
} from "@/lib/invoices-api";
import { useBooking } from "@/lib/bookings-api";
import { useQuotation } from "@/lib/quotations-api";
import type { InvoiceStatus } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATUS_COLORS: Record<InvoiceStatus, string> = {
  draft: "border-outline text-on-surface-medium",
  sent: "bg-blue-900/30 text-blue-400 border-blue-800",
  paid: "bg-green-900/30 text-green-400 border-green-800",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function StatusBadge({ status }: { status: InvoiceStatus }) {
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

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: invoice, isLoading, isError } = useInvoice(id);
  const { data: booking } = useBooking(invoice?.booking_id ?? "");
  const { data: quotation } = useQuotation(invoice?.quotation_id ?? "");

  const updateInvoice = useUpdateInvoice(id);
  const deleteInvoice = useDeleteInvoice();

  // ---------------------------------------------------------------------------
  // Loading / error states
  // ---------------------------------------------------------------------------

  if (isLoading) {
    return <div className="p-6 text-on-surface-medium">Loading invoice…</div>;
  }

  if (isError || !invoice) {
    return <div className="p-6 text-red-400">Invoice not found.</div>;
  }

  // ---------------------------------------------------------------------------
  // Action handlers
  // ---------------------------------------------------------------------------

  function handleMarkSent() {
    updateInvoice.mutate({ status: "sent" });
  }

  function handleMarkPaid() {
    updateInvoice.mutate({ status: "paid" });
  }

  function handleDelete() {
    deleteInvoice.mutate(id, {
      onSuccess: () => {
        router.push("/invoices");
      },
    });
  }

  function handlePrintPDF() {
    window.open(`/api/v1/invoices/${id}/pdf`);
  }

  const isMutating = updateInvoice.isPending || deleteInvoice.isPending;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Back link */}
      <Link
        href="/invoices"
        className="text-sm text-on-surface-medium hover:text-on-surface transition-colors"
      >
        ← Invoices
      </Link>

      {/* Header row */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-on-surface font-mono">
            {invoice.invoice_number}
          </h1>
          <p className="text-sm text-on-surface-medium mt-1">Invoice</p>
        </div>
        <StatusBadge status={invoice.status} />
      </div>

      {/* Meta section */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 rounded-lg border border-outline p-4 bg-surface-high">
        <div>
          <p className="text-xs text-on-surface-low uppercase tracking-wide mb-1">Booking</p>
          <p className="text-sm text-on-surface font-medium">
            {booking ? booking.title : "—"}
          </p>
        </div>
        <div>
          <p className="text-xs text-on-surface-low uppercase tracking-wide mb-1">Status</p>
          <StatusBadge status={invoice.status} />
        </div>
        <div>
          <p className="text-xs text-on-surface-low uppercase tracking-wide mb-1">Total</p>
          <p className="text-sm text-on-surface font-medium">
            ₹{invoice.total.toLocaleString("en-IN")}
          </p>
        </div>
        <div>
          <p className="text-xs text-on-surface-low uppercase tracking-wide mb-1">Due Date</p>
          <p className="text-sm text-on-surface-medium">{formatDate(invoice.due_date)}</p>
        </div>
        <div>
          <p className="text-xs text-on-surface-low uppercase tracking-wide mb-1">
            Linked Quotation
          </p>
          <p className="text-sm text-on-surface-medium">
            {quotation ? `v${quotation.version}` : invoice.quotation_id ? "—" : "—"}
          </p>
        </div>
        <div>
          <p className="text-xs text-on-surface-low uppercase tracking-wide mb-1">Invoice Date</p>
          <p className="text-sm text-on-surface-medium">{formatDate(invoice.invoice_date ?? invoice.created_at)}</p>
        </div>
        <div>
          <p className="text-xs text-on-surface-low uppercase tracking-wide mb-1">Created</p>
          <p className="text-sm text-on-surface-medium">{formatDate(invoice.created_at)}</p>
        </div>
        {invoice.attendees_count && (
          <div>
            <p className="text-xs text-on-surface-low uppercase tracking-wide mb-1">Attendees</p>
            <p className="text-sm text-on-surface-medium">{invoice.attendees_count} pax</p>
          </div>
        )}
        {invoice.payment_method && (
          <div>
            <p className="text-xs text-on-surface-low uppercase tracking-wide mb-1">Payment Method</p>
            <p className="text-sm text-on-surface-medium capitalize">{invoice.payment_method.replace(/_/g, " ")}</p>
          </div>
        )}
        {invoice.payment_received_date && (
          <div>
            <p className="text-xs text-on-surface-low uppercase tracking-wide mb-1">Payment Received</p>
            <p className="text-sm text-on-surface-medium">{formatDate(invoice.payment_received_date)}</p>
          </div>
        )}
        {invoice.gstin_customer && (
          <div>
            <p className="text-xs text-on-surface-low uppercase tracking-wide mb-1">Customer GSTIN</p>
            <p className="text-sm text-on-surface font-mono">{invoice.gstin_customer}</p>
          </div>
        )}
      </div>

      {/* Line items table */}
      <div className="rounded-lg border border-outline overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-surface-high">
              <TableHead className="text-on-surface-medium">Item</TableHead>
              <TableHead className="text-on-surface-medium text-right">Qty/Plate</TableHead>
              <TableHead className="text-on-surface-medium text-right">Guests</TableHead>
              <TableHead className="text-on-surface-medium text-right">Unit Price</TableHead>
              <TableHead className="text-on-surface-medium text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoice.line_items.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-0">
                  <EmptyState variant="line-items" title="No line items" description="Line items will appear here once the invoice is populated." />
                </TableCell>
              </TableRow>
            )}
            {invoice.line_items.map((item, index) => (
              <TableRow key={index} className="border-outline-low">
                <TableCell className="text-on-surface">{item.label}</TableCell>
                <TableCell className="text-on-surface-medium text-right">
                  {item.qty_per_plate}
                </TableCell>
                <TableCell className="text-on-surface-medium text-right">
                  {item.guest_count}
                </TableCell>
                <TableCell className="text-on-surface-medium text-right">
                  ₹{item.unit_price.toLocaleString("en-IN")}
                </TableCell>
                <TableCell className="text-on-surface text-right font-medium">
                  ₹{item.total.toLocaleString("en-IN")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Totals summary */}
        <div className="bg-surface-high border-t border-outline px-4 py-3 space-y-1">
          <div className="flex justify-between text-sm text-on-surface-medium">
            <span>Subtotal</span>
            <span>₹{invoice.subtotal.toLocaleString("en-IN")}</span>
          </div>
          {invoice.discount > 0 && (
            <div className="flex justify-between text-sm text-on-surface-medium">
              <span>Discount</span>
              <span>− ₹{invoice.discount.toLocaleString("en-IN")}</span>
            </div>
          )}
          {(invoice.service_charge_amount ?? 0) > 0 && (
            <div className="flex justify-between text-sm text-on-surface-medium">
              <span>Service Charge</span>
              <span>₹{(invoice.service_charge_amount ?? 0).toLocaleString("en-IN")}</span>
            </div>
          )}
          {(invoice.tax_amount ?? 0) > 0 && (
            <div className="flex justify-between text-sm text-on-surface-medium">
              <span>Tax</span>
              <span>₹{(invoice.tax_amount ?? 0).toLocaleString("en-IN")}</span>
            </div>
          )}
          {(invoice.gratuity_amount ?? 0) > 0 && (
            <div className="flex justify-between text-sm text-on-surface-medium">
              <span>Gratuity</span>
              <span>₹{(invoice.gratuity_amount ?? 0).toLocaleString("en-IN")}</span>
            </div>
          )}
          {(invoice.delivery_fee ?? 0) > 0 && (
            <div className="flex justify-between text-sm text-on-surface-medium">
              <span>Delivery Fee</span>
              <span>₹{(invoice.delivery_fee ?? 0).toLocaleString("en-IN")}</span>
            </div>
          )}
          {(invoice.staffing_fee ?? 0) > 0 && (
            <div className="flex justify-between text-sm text-on-surface-medium">
              <span>Staffing Fee</span>
              <span>₹{(invoice.staffing_fee ?? 0).toLocaleString("en-IN")}</span>
            </div>
          )}
          <Separator className="my-1 border-outline-low" />
          <div className="flex justify-between text-base font-bold text-on-surface">
            <span>Total</span>
            <span>₹{invoice.total.toLocaleString("en-IN")}</span>
          </div>
          {(invoice.amount_paid ?? 0) > 0 && (
            <>
              <div className="flex justify-between text-sm text-green-400">
                <span>Amount Paid</span>
                <span>− ₹{(invoice.amount_paid ?? 0).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold text-on-surface">
                <span>Balance Due</span>
                <span>₹{(invoice.balance_due ?? invoice.total - (invoice.amount_paid ?? 0)).toLocaleString("en-IN")}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Notes */}
      {invoice.notes && (
        <div className="rounded-lg border border-outline-low p-4">
          <p className="text-xs text-on-surface-low uppercase tracking-wide mb-2">Notes</p>
          <p className="text-sm text-on-surface-medium whitespace-pre-wrap">{invoice.notes}</p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 pt-2">
        <Button variant="outline" onClick={handlePrintPDF} disabled={isMutating}>
          Print PDF
        </Button>

        {invoice.status === "draft" && (
          <Button
            variant="outline"
            onClick={handleMarkSent}
            disabled={isMutating}
            className="border-blue-800 text-blue-400 hover:bg-blue-900/20"
          >
            {updateInvoice.isPending ? "Saving…" : "Mark as Sent"}
          </Button>
        )}

        {invoice.status === "sent" && (
          <Button
            variant="outline"
            onClick={handleMarkPaid}
            disabled={isMutating}
            className="border-green-800 text-green-400 hover:bg-green-900/20"
          >
            {updateInvoice.isPending ? "Saving…" : "Mark as Paid"}
          </Button>
        )}

        {invoice.status === "draft" && (
          <Button
            variant="outline"
            onClick={() => setDeleteDialogOpen(true)}
            disabled={isMutating}
            className="border-red-800 text-red-400 hover:bg-red-900/20"
          >
            Delete
          </Button>
        )}
      </div>

      {updateInvoice.isError && (
        <p className="text-sm text-red-400">Action failed. Please try again.</p>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {invoice.invoice_number}?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-on-surface-medium">
            This will permanently delete the invoice. This action cannot be undone.
          </p>
          {deleteInvoice.isError && (
            <p className="text-sm text-red-400">Failed to delete invoice. Try again.</p>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteInvoice.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteInvoice.isPending}
            >
              {deleteInvoice.isPending ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
