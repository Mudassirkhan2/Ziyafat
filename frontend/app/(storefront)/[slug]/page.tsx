"use client";

import { use } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type PublicDish = {
  id: string; name: string; category: string; description: string | null;
  selling_price: number; per_plate_cost: number; is_veg: boolean; image_url: string | null;
  cuisine_type: string | null; portion_size: string | null; minimum_order_quantity: number | null;
};

type PublicOrg = {
  name: string; slug: string; logo_url: string | null; banner_url: string | null;
  address: string | null; phone: string | null; email: string | null; tagline: string | null;
  primary: string; on_primary: string;
  storefront_sections: Array<{ type: string; enabled: boolean; order: number }>;
};

type StorefrontData = { org: PublicOrg; dishes: PublicDish[] };

async function fetchStorefront(slug: string): Promise<StorefrontData> {
  const res = await fetch(`${API_BASE}/api/v1/public/storefront/${slug}`);
  if (!res.ok) throw new Error("Storefront not found");
  return res.json();
}

function groupByCategory(dishes: PublicDish[]): Record<string, PublicDish[]> {
  return dishes.reduce<Record<string, PublicDish[]>>((acc, d) => {
    (acc[d.category] = acc[d.category] ?? []).push(d);
    return acc;
  }, {});
}

export default function StorefrontPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  const { data, isPending, isError } = useQuery<StorefrontData>({
    queryKey: ["storefront", slug],
    queryFn: () => fetchStorefront(slug),
  });

  if (isPending) {
    return <div className="flex items-center justify-center min-h-screen text-gray-500">Loading…</div>;
  }

  if (isError || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        <div className="text-center">
          <p className="text-2xl font-bold mb-2">Storefront not found</p>
          <p className="text-gray-400">Check the URL and try again.</p>
        </div>
      </div>
    );
  }

  const { org, dishes } = data;
  const activeSections = [...org.storefront_sections]
    .filter((s) => s.enabled)
    .sort((a, b) => a.order - b.order);

  const sectionOrder =
    activeSections.length > 0
      ? activeSections.map((s) => s.type)
      : ["hero", "dish_grid", "about"];

  const grouped = groupByCategory(dishes);

  // Deduplicate contact sections — "about" and "contact" render identical UI
  const dedupedSections = sectionOrder.filter((type, idx) => {
    if (type !== "about" && type !== "contact") return true;
    return sectionOrder.findIndex((t) => t === "about" || t === "contact") === idx;
  });

  return (
    <div style={{ "--brand": org.primary, "--on-brand": org.on_primary } as React.CSSProperties}>
      {dedupedSections.map((type) => {
        if (type === "hero") {
          return (
            <section
              key="hero"
              className="relative py-20 px-6 text-center"
              style={{ backgroundColor: org.primary, color: org.on_primary }}
            >
              {org.banner_url && (
                <Image
                  src={org.banner_url}
                  alt="Banner"
                  fill
                  className="object-cover opacity-20"
                />
              )}
              <div className="relative">
                {org.logo_url && (
                  <Image src={org.logo_url} alt={org.name} width={128} height={64} className="mx-auto mb-4 object-contain" />
                )}
                <h1 className="text-4xl font-bold mb-2">{org.name}</h1>
                {org.tagline && <p className="text-lg opacity-80">{org.tagline}</p>}
              </div>
            </section>
          );
        }

        if (type === "dish_grid") {
          return (
            <section key="dish_grid" className="py-12 px-6 max-w-5xl mx-auto">
              <h2 className="text-2xl font-bold text-center mb-8 text-gray-900">Our Menu</h2>
              {Object.entries(grouped).map(([category, items]) => (
                <div key={category} className="mb-10">
                  <h3 className="text-lg font-semibold text-gray-700 border-b border-gray-200 pb-2 mb-4">
                    {category}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {items.map((dish) => (
                      <div key={dish.id} className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                        {dish.image_url ? (
                          <img src={dish.image_url} alt={dish.name} className="w-full h-40 object-cover" />
                        ) : (
                          <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-gray-300 text-4xl">
                            🍽
                          </div>
                        )}
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <p className="font-semibold text-gray-900 text-base leading-snug">{dish.name}</p>
                            <span
                              className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded ${
                                dish.is_veg
                                  ? "bg-green-100 text-green-700 border border-green-300"
                                  : "bg-red-100 text-red-700 border border-red-300"
                              }`}
                            >
                              {dish.is_veg ? "Veg" : "Non-Veg"}
                            </span>
                          </div>
                          {dish.description && (
                            <p className="text-sm text-gray-500 mb-3 leading-snug">{dish.description}</p>
                          )}
                          {(dish.cuisine_type || dish.portion_size || dish.minimum_order_quantity) && (
                            <div className="flex flex-wrap gap-x-3 gap-y-1 mb-3">
                              {dish.cuisine_type && (
                                <span className="text-xs text-gray-500">
                                  <span className="text-gray-400">Cuisine: </span>{dish.cuisine_type}
                                </span>
                              )}
                              {dish.portion_size && (
                                <span className="text-xs text-gray-500">
                                  <span className="text-gray-400">Portion: </span>{dish.portion_size}
                                </span>
                              )}
                              {dish.minimum_order_quantity && (
                                <span className="text-xs text-gray-500">
                                  <span className="text-gray-400">Min. plates: </span>{dish.minimum_order_quantity}
                                </span>
                              )}
                            </div>
                          )}
                          <div className="flex items-baseline justify-between gap-2 mt-auto">
                            <p className="text-lg font-bold" style={{ color: org.primary }}>
                              ₹{dish.selling_price.toLocaleString("en-IN")}
                            </p>
                            {dish.per_plate_cost > 0 && (
                              <p className="text-xs text-gray-400">
                                Cost: ₹{dish.per_plate_cost.toLocaleString("en-IN")}/plate
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          );
        }

        if (type === "about" || type === "contact") {
          if (!org.address && !org.phone && !org.email) return null;
          return (
            <section key={type} className="py-12 px-6 bg-gray-50 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Us</h2>
              <div className="space-y-2 text-gray-600">
                {org.address && <p>{org.address}</p>}
                {org.phone && <p>{org.phone}</p>}
                {org.email && <a href={`mailto:${org.email}`} className="text-blue-600 hover:underline">{org.email}</a>}
              </div>
            </section>
          );
        }

        return null;
      })}

      <footer className="py-6 text-center text-xs text-gray-400 border-t border-gray-100">
        © {new Date().getFullYear()} {org.name}. All rights reserved.
      </footer>
    </div>
  );
}
