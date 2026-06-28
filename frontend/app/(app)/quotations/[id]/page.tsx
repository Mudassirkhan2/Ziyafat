"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  useQuotation,
  useUpdateQuotation,
  useDeleteQuotation,
  useDuplicateQuotation,
} from "@/lib/quotations-api";
import { toast } from "sonner";
import { useBooking } from "@/lib/bookings-api";
import type { QuotationStatus } from "@/lib/types";

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

const STATUS_COLORS: Record<QuotationStatus, string> = {
  draft: "border-outline text-on-surface-medium",
  sent: "bg-blue-900/30 text-blue-400 border-blue-800",
  approved: "bg-green-900/30 text-green-400 border-green-800",
  rejected: "bg-red-900/30 text-red-400 border-red-800",
  superseded: "bg-amber-900/30 text-amber-400 border-amber-800",
};

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

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function QuotationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const {
    data: quotation,
    isLoading,
    isError,
  } = useQuotation(id);

  const { data: booking } = useBooking(quotation?.booking_id ?? "");

  const updateQuotation = useUpdateQuotation(id);
  const deleteQuotation = useDeleteQuotation();
  const duplicateQuotation = useDuplicateQuotation();

  // ---------------------------------------------------------------------------
  // Loading / error states
  // ---------------------------------------------------------------------------

  if (isLoading) {
    return <div className="p-6 text-on-surface-medium">Loading quotation…</div>;
  }

  if (isError || !quotation) {
    return <div className="p-6 text-red-400">Quotation not found.</div>;
  }

  // ---------------------------------------------------------------------------
  // Action handlers
  // ---------------------------------------------------------------------------

  function handleMarkSent() {
    updateQuotation.mutate({ status: "sent" }, {
      onSuccess: () => toast.success("Quotation marked as sent."),
      onError: () => toast.error("Action failed. Please try again."),
    });
  }

  function handleMarkApproved() {
    updateQuotation.mutate({ status: "approved" }, {
      onSuccess: () => toast.success("Quotation marked as approved."),
      onError: () => toast.error("Action failed. Please try again."),
    });
  }

  function handleDuplicate() {
    duplicateQuotation.mutate(id, {
      onSuccess: (data) => {
        toast.success("Quotation duplicated.");
        router.push(`/quotations/${data.id}`);
      },
      onError: () => toast.error("Failed to duplicate quotation. Try again."),
    });
  }

  function handleDelete() {
    deleteQuotation.mutate(id, {
      onSuccess: () => {
        toast.success("Quotation deleted.");
        router.push("/quotations");
      },
      onError: () => toast.error("Failed to delete quotation. Try again."),
    });
  }

  function handlePrintPDF() {
    window.open(`/api/v1/quotations/${id}/pdf`);
  }

  const isMutating =
    updateQuotation.isPending ||
    deleteQuotation.isPending ||
    duplicateQuotation.isPending;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Back link */}
      <Link
        href="/quotations"
        className="text-sm text-on-surface-medium hover:text-on-surface transition-colors"
      >
        ← Quotations
      </Link>

      {/* Header row */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Quotation</h1>
          <p className="text-sm text-on-surface-medium mt-1">Version {quotation.version}</p>
        </div>
        <StatusBadge status={quotation.status} />
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
          <StatusBadge status={quotation.status} />
        </div>
        <div>
          <p className="text-xs text-on-surface-low uppercase tracking-wide mb-1">Total</p>
          <p className="text-sm text-on-surface font-medium">
            ₹{quotation.total.toLocaleString("en-IN")}
          </p>
        </div>
        <div>
          <p className="text-xs text-on-surface-low uppercase tracking-wide mb-1">Valid Until</p>
          <p className="text-sm text-on-surface-medium">{formatDate(quotation.valid_until)}</p>
        </div>
        <div>
          <p className="text-xs text-on-surface-low uppercase tracking-wide mb-1">Created</p>
          <p className="text-sm text-on-surface-medium">{formatDate(quotation.created_at)}</p>
        </div>
        {quotation.per_person_price && (
          <div>
            <p className="text-xs text-on-surface-low uppercase tracking-wide mb-1">Per Person</p>
            <p className="text-sm text-on-surface font-medium">₹{quotation.per_person_price.toLocaleString("en-IN")}</p>
          </div>
        )}
        {quotation.minimum_guarantee_count && (
          <div>
            <p className="text-xs text-on-surface-low uppercase tracking-wide mb-1">Min. Guarantee</p>
            <p className="text-sm text-on-surface-medium">{quotation.minimum_guarantee_count} pax</p>
          </div>
        )}
        {quotation.client_signature_status && (
          <div>
            <p className="text-xs text-on-surface-low uppercase tracking-wide mb-1">Signature</p>
            <p className="text-sm text-on-surface-medium capitalize">{quotation.client_signature_status.replace(/_/g, " ")}</p>
          </div>
        )}
        {quotation.signed_date && (
          <div>
            <p className="text-xs text-on-surface-low uppercase tracking-wide mb-1">Signed On</p>
            <p className="text-sm text-on-surface-medium">{formatDate(quotation.signed_date)}</p>
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
            {quotation.line_items.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-0">
                  <EmptyState variant="line-items" title="No line items" description="Line items will appear here once the quotation is populated." />
                </TableCell>
              </TableRow>
            )}
            {quotation.line_items.map((item, index) => (
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
            <span>₹{quotation.subtotal.toLocaleString("en-IN")}</span>
          </div>
          {quotation.discount > 0 && (
            <div className="flex justify-between text-sm text-on-surface-medium">
              <span>Discount</span>
              <span>− ₹{quotation.discount.toLocaleString("en-IN")}</span>
            </div>
          )}
          {(quotation.service_charge_amount ?? 0) > 0 && (
            <div className="flex justify-between text-sm text-on-surface-medium">
              <span>Service Charge{quotation.service_charge_percentage ? ` (${quotation.service_charge_percentage}%)` : ""}</span>
              <span>₹{(quotation.service_charge_amount ?? 0).toLocaleString("en-IN")}</span>
            </div>
          )}
          {(quotation.tax_amount ?? 0) > 0 && (
            <div className="flex justify-between text-sm text-on-surface-medium">
              <span>Tax{quotation.tax_percentage ? ` (${quotation.tax_percentage}%)` : ""}</span>
              <span>₹{(quotation.tax_amount ?? 0).toLocaleString("en-IN")}</span>
            </div>
          )}
          {(quotation.gratuity_amount ?? 0) > 0 && (
            <div className="flex justify-between text-sm text-on-surface-medium">
              <span>Gratuity{quotation.gratuity_percentage ? ` (${quotation.gratuity_percentage}%)` : ""}</span>
              <span>₹{(quotation.gratuity_amount ?? 0).toLocaleString("en-IN")}</span>
            </div>
          )}
          {(quotation.delivery_fee ?? 0) > 0 && (
            <div className="flex justify-between text-sm text-on-surface-medium">
              <span>Delivery Fee</span>
              <span>₹{(quotation.delivery_fee ?? 0).toLocaleString("en-IN")}</span>
            </div>
          )}
          {(quotation.setup_fee ?? 0) > 0 && (
            <div className="flex justify-between text-sm text-on-surface-medium">
              <span>Setup Fee</span>
              <span>₹{(quotation.setup_fee ?? 0).toLocaleString("en-IN")}</span>
            </div>
          )}
          <Separator className="my-1 border-outline-low" />
          <div className="flex justify-between text-base font-bold text-on-surface">
            <span>Total</span>
            <span>₹{quotation.total.toLocaleString("en-IN")}</span>
          </div>
          {(quotation.deposit_amount ?? 0) > 0 && (
            <>
              <Separator className="my-1 border-outline-low" />
              <div className="flex justify-between text-sm text-on-surface-medium">
                <span>Deposit Required{quotation.deposit_percentage ? ` (${quotation.deposit_percentage}%)` : ""}</span>
                <span>₹{(quotation.deposit_amount ?? 0).toLocaleString("en-IN")}</span>
              </div>
              {quotation.deposit_due_date && (
                <div className="flex justify-between text-xs text-on-surface-low">
                  <span>Deposit Due</span>
                  <span>{formatDate(quotation.deposit_due_date)}</span>
                </div>
              )}
              {quotation.final_balance_due_date && (
                <div className="flex justify-between text-xs text-on-surface-low">
                  <span>Balance Due</span>
                  <span>{formatDate(quotation.final_balance_due_date)}</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Notes */}
      {quotation.notes && (
        <div className="rounded-lg border border-outline-low p-4">
          <p className="text-xs text-on-surface-low uppercase tracking-wide mb-2">Notes</p>
          <p className="text-sm text-on-surface-medium whitespace-pre-wrap">{quotation.notes}</p>
        </div>
      )}

      {/* Payment Terms */}
      {quotation.payment_terms_text && (
        <div className="rounded-lg border border-outline-low p-4">
          <p className="text-xs text-on-surface-low uppercase tracking-wide mb-2">Payment Terms</p>
          <p className="text-sm text-on-surface-medium whitespace-pre-wrap">{quotation.payment_terms_text}</p>
        </div>
      )}

      {/* Cancellation Policy */}
      {quotation.cancellation_policy_text && (
        <div className="rounded-lg border border-outline-low p-4">
          <p className="text-xs text-on-surface-low uppercase tracking-wide mb-2">Cancellation Policy</p>
          <p className="text-sm text-on-surface-medium whitespace-pre-wrap">{quotation.cancellation_policy_text}</p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 pt-2">
        <Button variant="outline" onClick={handlePrintPDF} disabled={isMutating}>
          Print PDF
        </Button>

        <Button
          variant="outline"
          onClick={handleDuplicate}
          disabled={isMutating}
        >
          {duplicateQuotation.isPending ? "Duplicating…" : "Duplicate"}
        </Button>

        {quotation.status === "draft" && (
          <Button
            variant="outline"
            onClick={handleMarkSent}
            disabled={isMutating}
            className="border-blue-800 text-blue-400 hover:bg-blue-900/20"
          >
            {updateQuotation.isPending ? "Saving…" : "Mark as Sent"}
          </Button>
        )}

        {quotation.status === "sent" && (
          <Button
            variant="outline"
            onClick={handleMarkApproved}
            disabled={isMutating}
            className="border-green-800 text-green-400 hover:bg-green-900/20"
          >
            {updateQuotation.isPending ? "Saving…" : "Mark as Approved"}
          </Button>
        )}

        {quotation.status === "draft" && (
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


      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Quotation</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-on-surface-medium">
            Are you sure you want to delete this quotation? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteQuotation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteQuotation.isPending}
            >
              {deleteQuotation.isPending ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
