"use client";

import { ReportHeader, type OrgSettings } from "@/components/reports/ReportHeader";
import type { Dish } from "@/lib/types";

export function DishListPrint({
  dishes,
  org,
}: {
  dishes: Dish[];
  org: OrgSettings;
}) {
  // Group dishes by category
  const grouped = dishes.reduce<Record<string, Dish[]>>((acc, dish) => {
    (acc[dish.category] = acc[dish.category] || []).push(dish);
    return acc;
  }, {});

  return (
    <div className="hidden print:block bg-white text-gray-900 p-8 text-sm">
      <ReportHeader org={org} />
      <h2 className="text-lg font-semibold mb-6 text-center">Our Menu</h2>

      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} className="mb-6">
          <h3 className="text-base font-semibold border-b border-gray-300 pb-1 mb-3">
            {category}
          </h3>
          <div className="space-y-2">
            {items.map((dish) => (
              <div key={dish.id} className="flex justify-between items-start">
                <div className="flex-1">
                  <span className="font-medium">{dish.name}</span>
                  <span
                    className={`ml-2 inline-block w-2.5 h-2.5 rounded-full border ${
                      dish.is_veg
                        ? "bg-green-500 border-green-600"
                        : "bg-red-500 border-red-600"
                    }`}
                  />
                  {dish.description && (
                    <p className="text-gray-500 text-xs mt-0.5">{dish.description}</p>
                  )}
                </div>
                <span className="font-medium ml-4">
                  ₹{dish.selling_price.toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
