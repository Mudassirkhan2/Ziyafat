"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useProcurementList } from "@/lib/ingredients-api";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function ProcurementPage({
  params,
}: {
  params: Promise<{ id: string; event_id: string }>;
}) {
  const { id: bookingId, event_id: eventId } = use(params);
  const [wastage, setWastage] = useState(0);

  const { data: items, isPending, isError, refetch } = useProcurementList(bookingId, eventId, wastage);

  const totalCost = (items ?? []).reduce((sum, i) => sum + i.cost, 0);

  // Group by supplier
  const bySupplier: Record<string, typeof items> = {};
  for (const item of items ?? []) {
    const key = item.supplier ?? "Other";
    if (!bySupplier[key]) bySupplier[key] = [];
    bySupplier[key]!.push(item);
  }

  function openPdf() {
    window.open(
      `${API_BASE}/api/v1/bookings/${bookingId}/events/${eventId}/procurement/pdf?wastage_pct=${wastage}`
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link
            href={`/bookings/${bookingId}`}
            className="text-sm text-on-surface-medium hover:text-on-surface mb-1 inline-block"
          >
            ← Back to Booking
          </Link>
          <h1 className="text-2xl font-bold text-on-surface">Procurement List</h1>
        </div>
        <Button onClick={openPdf}>Print PDF</Button>
      </div>

      <div className="flex items-center gap-3 mb-6 p-4 rounded-lg border border-outline bg-surface-high">
        <label className="text-sm text-on-surface-medium whitespace-nowrap">Wastage buffer %</label>
        <Input
          type="number"
          min={0}
          max={50}
          step={1}
          value={wastage}
          onChange={(e) => setWastage(Number(e.target.value))}
          className="w-24"
        />
        <Button variant="outline" onClick={() => refetch()}>Recalculate</Button>
      </div>

      {isPending && <p className="text-on-surface-medium">Calculating…</p>}
      {isError && <p className="text-red-600 dark:text-red-400">Failed to load procurement list.</p>}

      {!isPending && !isError && items && items.length === 0 && (
        <div className="text-center py-12 text-on-surface-medium">
          <p className="text-lg mb-2">No ingredients to procure.</p>
          <p className="text-sm">Set a menu for this event and add recipes to dishes first.</p>
        </div>
      )}

      {!isPending && !isError && Object.entries(bySupplier).map(([supplier, supItems]) => (
        <div key={supplier} className="mb-8">
          <h2 className="text-lg font-semibold text-on-surface mb-3 pb-2 border-b border-outline">
            {supplier}
          </h2>
          <div className="rounded-lg border border-outline overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-surface-high">
                  <TableHead className="text-on-surface-medium">Ingredient</TableHead>
                  <TableHead className="text-on-surface-medium text-right">Quantity</TableHead>
                  <TableHead className="text-on-surface-medium">Unit</TableHead>
                  <TableHead className="text-on-surface-medium text-right">Cost (₹)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(supItems ?? []).map((item) => (
                  <TableRow key={item.ingredient_id} className="border-outline">
                    <TableCell className="text-on-surface">{item.name}</TableCell>
                    <TableCell className="text-right text-on-surface-medium">
                      {item.quantity.toFixed(3)}
                    </TableCell>
                    <TableCell className="text-on-surface-medium">{item.unit}</TableCell>
                    <TableCell className="text-right text-on-surface-medium">
                      ₹{item.cost.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ))}

      {!isPending && !isError && items && items.length > 0 && (
        <div className="flex justify-end pt-4 border-t border-outline">
          <p className="text-lg font-bold text-on-surface">
            Total: ₹{totalCost.toFixed(2)}
          </p>
        </div>
      )}
    </div>
  );
}
