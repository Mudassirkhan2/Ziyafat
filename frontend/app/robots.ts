import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/blog/", "/contact", "/login", "/signup"],
        disallow: [
          "/dashboard",
          "/bookings/",
          "/customers/",
          "/dishes/",
          "/ingredients/",
          "/invoices/",
          "/leads/",
          "/quotations/",
          "/settings/",
          "/users/",
          "/setup",
          "/api/",
        ],
      },
    ],
    sitemap: "https://getziyafat.vercel.app/sitemap.xml",
  };
}
