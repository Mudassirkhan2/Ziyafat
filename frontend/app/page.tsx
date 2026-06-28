import type { Metadata } from "next";
import LandingClient from "./LandingClient";

export const metadata: Metadata = {
  title: "Free Catering Software for Caterers in India | Catering Management System",
  description:
    "Ziyafat is free catering software for small businesses in India. Manage leads, bookings, scheduling, quotations, invoices and your public menu — the complete catering management system. No credit card required.",
  alternates: { canonical: "https://getziyafat.vercel.app" },
};

export default function LandingPage() {
  return <LandingClient />;
}
