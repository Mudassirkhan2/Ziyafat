import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ziyafat — ERP for Hyderabadi catering businesses",
  description:
    "Manage leads, bookings, quotations, invoices, and your public menu storefront. Built for Hyderabadi caterers.",
};

const FEATURES = [
  {
    icon: "👥",
    title: "Lead & Customer Management",
    desc: "Track every enquiry from first call to confirmed booking. Never lose a lead or forget a follow-up.",
  },
  {
    icon: "📅",
    title: "Bookings & Events",
    desc: "Manage multiple events per booking — nikaah, walima, reception — with guest counts and assigned staff.",
  },
  {
    icon: "📄",
    title: "Quotations",
    desc: "Build itemised per-plate quotes from your dish catalog. Version, duplicate, and get sign-off before the kitchen fires up.",
  },
  {
    icon: "🧾",
    title: "Invoices & PDF Export",
    desc: "Auto-numbered invoices with one-click PDF print. Professional documents every time, on any device.",
  },
  {
    icon: "🌐",
    title: "Public Menu Storefront",
    desc: "Share a branded menu page with walk-in customers — no app install, no login required.",
  },
  {
    icon: "🎨",
    title: "Your Brand, Your Colors",
    desc: "Upload your logo, pick your brand colors, and configure your document header — it's all yours.",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Add a Lead",
    desc: "Log the enquiry — event date, guest count, venue, and budget. Set a follow-up reminder so nothing slips through.",
  },
  {
    num: "02",
    title: "Confirm the Booking",
    desc: "Convert to a booking when the customer commits. Add individual events (nikaah, walima, reception) and track them separately.",
  },
  {
    num: "03",
    title: "Send a Quotation",
    desc: "Build a per-plate itemised quote from your dish catalog. Version and revise until the customer approves.",
  },
  {
    num: "04",
    title: "Raise the Invoice",
    desc: "One click converts the approved quotation to a numbered invoice. Print a PDF or share the link.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "We used to track everything in WhatsApp groups and a notebook. Ziyafat cut our booking mistakes to zero.",
    name: "Mohammed Irfan",
    business: "Al-Noor Caterers, Hyderabad",
  },
  {
    quote:
      "The PDF quotations look so professional now. Customers sign off faster because everything is clear.",
    name: "Syed Farhan",
    business: "Royal Feast Catering",
  },
  {
    quote:
      "Finally a system that understands how Hyderabadi catering actually works — multiple events, per-plate pricing, the whole thing.",
    name: "Asma Begum",
    business: "Bismillah Events & Catering",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* ── Nav ── */}
      <nav className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 text-2xl font-bold tracking-tight">
              Ziyafat
            </span>
            <span className="text-gray-500 text-xs uppercase tracking-widest">
              ERP
            </span>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-semibold px-4 py-2 transition-colors"
          >
            Login
          </Link>
        </div>
      </nav>

      <main>
      {/* ── Hero ── */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm px-4 py-1.5 rounded-full mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" aria-hidden="true" />
            Built for Hyderabadi catering businesses
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold leading-tight mb-6 tracking-tight">
            Run your catering business{" "}
            <span className="text-amber-400">without the chaos</span>
          </h1>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Ziyafat manages your leads, bookings, quotations, invoices, and
            public menu — everything a Hyderabadi caterer needs in one place.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-bold text-lg h-14 px-10 transition-colors"
          >
            Go to App <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20 px-6 bg-gray-900/40 border-y border-gray-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3">
            Everything you need
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-xl mx-auto">
            From the first enquiry call to the final invoice — Ziyafat covers
            the full catering workflow.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-amber-500/30 transition-colors"
              >
                <div className="text-3xl mb-3" aria-hidden="true">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3">
            How it works
          </h2>
          <p className="text-gray-400 text-center mb-14 max-w-xl mx-auto">
            Four steps. The same workflow Hyderabadi caterers have always
            followed — now done in software.
          </p>
          <div>
            {STEPS.map((step, i) => (
              <div key={step.num} className="flex gap-6">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xs font-bold flex-shrink-0">
                    {step.num}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="w-px flex-1 bg-gray-800 my-2" />
                  )}
                </div>
                <div className="pb-10">
                  <h3 className="font-semibold text-lg mb-1">{step.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-20 px-6 bg-gray-900/40 border-y border-gray-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3">
            What caterers say
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-xl mx-auto">
            From businesses that replaced spreadsheets and WhatsApp with
            Ziyafat.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col gap-4"
              >
                <p className="text-gray-300 text-sm leading-relaxed flex-1">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-amber-400 text-xs mt-0.5">{t.business}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">
            Ready to bring order to your catering business?
          </h2>
          <p className="text-gray-400 mb-8">
            Log in to your Ziyafat dashboard and start managing your next
            event.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-bold text-lg h-14 px-10 transition-colors"
          >
            Go to App <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-800 py-8 px-6 text-center text-gray-600 text-sm">
        © {new Date().getFullYear()} Ziyafat. Built for Hyderabadi caterers.
      </footer>
    </div>
  );
}
