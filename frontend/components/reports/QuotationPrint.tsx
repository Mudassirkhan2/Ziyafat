"use client";

import { ReportHeader, type OrgSettings } from "@/components/reports/ReportHeader";
import type { Quotation, Booking } from "@/lib/types";

export function QuotationPrint({
  quotation,
  booking,
  org,
}: {
  quotation: Quotation;
  booking: Booking;
  org: OrgSettings;
}) {
  return (
    <div className="hidden print:block bg-white text-gray-900 p-8 text-sm">
      <ReportHeader org={org} />

      <div className="flex justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold">Quotation</h2>
          <p className="text-gray-600">Version {quotation.version}</p>
          <p className="text-gray-600">Booking: {booking.title}</p>
        </div>
        <div className="text-right">
          <p>
            <span className="font-medium">Status:</span> {quotation.status}
          </p>
          <p>
            <span className="font-medium">Date:</span>{" "}
            {new Date(quotation.created_at).toLocaleDateString("en-IN")}
          </p>
          {quotation.valid_until && (
            <p>
              <span className="font-medium">Valid Until:</span>{" "}
              {new Date(quotation.valid_until).toLocaleDateString("en-IN")}
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
          {quotation.line_items.map((item, i) => (
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
            <span>₹{quotation.subtotal.toLocaleString("en-IN")}</span>
          </div>
          {quotation.discount > 0 && (
            <div className="flex justify-between py-1 text-gray-600">
              <span>Discount</span>
              <span>- ₹{quotation.discount.toLocaleString("en-IN")}</span>
            </div>
          )}
          <div className="flex justify-between py-1 font-bold border-t-2 border-gray-300 mt-1">
            <span>Total</span>
            <span>₹{quotation.total.toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>

      {quotation.notes && (
        <div className="border-t pt-4 text-gray-600 text-sm">
          <p className="font-medium mb-1">Notes</p>
          <p>{quotation.notes}</p>
        </div>
      )}
    </div>
  );
}
