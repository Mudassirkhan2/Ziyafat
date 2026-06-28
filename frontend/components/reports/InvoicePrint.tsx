"use client";

import { ReportHeader, type OrgSettings } from "@/components/reports/ReportHeader";
import type { Invoice, Booking } from "@/lib/types";

export function InvoicePrint({
  invoice,
  booking,
  org,
}: {
  invoice: Invoice;
  booking: Booking;
  org: OrgSettings;
}) {
  return (
    <div className="hidden print:block bg-white text-gray-900 p-8 text-sm">
      <ReportHeader org={org} />

      <div className="flex justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold">Invoice #{invoice.invoice_number}</h2>
          <p className="text-gray-600">Booking: {booking.title}</p>
          {invoice.quotation_id && (
            <p className="text-gray-600">Quotation: {invoice.quotation_id}</p>
          )}
        </div>
        <div className="text-right">
          <p>
            <span className="font-medium">Status:</span> {invoice.status}
          </p>
          <p>
            <span className="font-medium">Date:</span>{" "}
            {new Date(invoice.created_at).toLocaleDateString("en-IN")}
          </p>
          {invoice.due_date && (
            <p>
              <span className="font-medium">Due Date:</span>{" "}
              {new Date(invoice.due_date).toLocaleDateString("en-IN")}
            </p>
          )}
        </div>
      </div>

      <table className="w-full border-collapse mb-6">
        <thead>
          <tr className="border-b-2 border-gray-300">
            <th className="text-left py-2">Item</th>
            <th className="text-right py-2">Qty/Plate</th>
            <th className="text-right py-2">Guests</th>
            <th className="text-right py-2">Unit Price</th>
            <th className="text-right py-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {invoice.line_items.map((item, i) => (
            <tr key={i} className="border-b border-gray-100">
              <td className="py-1.5">{item.label}</td>
              <td className="text-right py-1.5">{item.qty_per_plate}</td>
              <td className="text-right py-1.5">{item.guest_count}</td>
              <td className="text-right py-1.5">
                ₹{item.unit_price.toLocaleString("en-IN")}
              </td>
              <td className="text-right py-1.5">
                ₹{item.total.toLocaleString("en-IN")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end mb-6">
        <div className="w-48">
          <div className="flex justify-between py-1">
            <span>Subtotal</span>
            <span>₹{invoice.subtotal.toLocaleString("en-IN")}</span>
          </div>
          {invoice.discount > 0 && (
            <div className="flex justify-between py-1 text-gray-600">
              <span>Discount</span>
              <span>- ₹{invoice.discount.toLocaleString("en-IN")}</span>
            </div>
          )}
          <div className="flex justify-between py-1 font-bold border-t-2 border-gray-300 mt-1">
            <span>Total</span>
            <span>₹{invoice.total.toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>

      {invoice.notes && (
        <div className="border-t pt-4 text-gray-600 text-sm mb-6">
          <p className="font-medium mb-1">Notes</p>
          <p>{invoice.notes}</p>
        </div>
      )}

      <div className="border-t pt-4 text-center text-gray-600">
        <p className="font-medium">Thank you for your business.</p>
      </div>
    </div>
  );
}
