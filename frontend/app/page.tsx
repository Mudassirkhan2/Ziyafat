import type { Metadata } from "next";
import LandingClient from "./LandingClient";

export const metadata: Metadata = {
  title: "Ziyafat — Catering Management for Every Cuisine & Scale",
  description:
    "Manage leads, bookings, quotations, invoices, and your public menu storefront — built for caterers of every cuisine and scale.",
};

export default function LandingPage() {
  return <LandingClient />;
}
