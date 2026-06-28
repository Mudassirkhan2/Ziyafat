import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact Ziyafat — Free Catering Software",
  description:
    "Get in touch with the Ziyafat team. Questions about our free catering management software, partnerships, or onboarding help — we're here.",
  alternates: { canonical: "https://getziyafat.vercel.app/contact" },
};

export default function ContactPage() {
  return (
    <div style={{ background: "#06100b", minHeight: "100vh", color: "#eef3ee", fontFamily: "var(--font-sans-pub, system-ui, sans-serif)" }}>
      {/* Nav */}
      <header style={{ borderBottom: "1px solid rgba(255,255,255,.07)", padding: "0 28px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <Link href="/" style={{ textDecoration: "none", color: "#eef3ee", fontWeight: 700, fontSize: 18 }}>
            Ziyafat
          </Link>
          <Link
            href="/signup"
            style={{
              background: "#1c7351",
              color: "#fff",
              padding: "9px 20px",
              borderRadius: 100,
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Get started free
          </Link>
        </div>
      </header>

      <main style={{ maxWidth: 760, margin: "0 auto", padding: "72px 28px" }}>
        <div style={{ marginBottom: 12 }}>
          <Link href="/" style={{ color: "#9bb1a5", fontSize: 13, textDecoration: "none" }}>
            ← Back to home
          </Link>
        </div>

        <h1
          style={{
            fontFamily: "var(--font-serif, Georgia, serif)",
            fontSize: "clamp(36px, 5vw, 54px)",
            fontWeight: 600,
            lineHeight: 1.05,
            marginBottom: 16,
          }}
        >
          Get in touch.
        </h1>
        <p style={{ color: "#9bb1a5", fontSize: 18, lineHeight: 1.6, marginBottom: 56, maxWidth: 560 }}>
          Questions about Ziyafat, partnership inquiries, or want help getting started with our free catering management software — we&apos;d love to hear from you.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Email */}
          <div
            style={{
              background: "rgba(255,255,255,.045)",
              border: "1px solid rgba(255,255,255,.09)",
              borderRadius: 16,
              padding: "22px 24px",
              display: "flex",
              alignItems: "center",
              gap: 18,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "linear-gradient(150deg, #1c7351, #0d3a29)",
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="white" strokeWidth="1.8" strokeLinejoin="round" />
                <path d="M22 6l-10 7L2 6" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "#9bb1a5", marginBottom: 4 }}>Email</div>
              <a href="mailto:mudassir222001@gmail.com" style={{ color: "#eef3ee", fontSize: 16, fontWeight: 600, textDecoration: "none" }}>
                mudassir222001@gmail.com
              </a>
            </div>
          </div>

          {/* Location */}
          <div
            style={{
              background: "rgba(255,255,255,.045)",
              border: "1px solid rgba(255,255,255,.09)",
              borderRadius: 16,
              padding: "22px 24px",
              display: "flex",
              alignItems: "center",
              gap: 18,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "linear-gradient(150deg, #1c7351, #0d3a29)",
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="white" strokeWidth="1.8" strokeLinejoin="round" />
                <circle cx="12" cy="9" r="2.5" stroke="white" strokeWidth="1.8" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "#9bb1a5", marginBottom: 4 }}>Location</div>
              <span style={{ color: "#eef3ee", fontSize: 16, fontWeight: 600 }}>Hyderabad, India</span>
            </div>
          </div>

          {/* X */}
          <div
            style={{
              background: "rgba(255,255,255,.045)",
              border: "1px solid rgba(255,255,255,.09)",
              borderRadius: 16,
              padding: "22px 24px",
              display: "flex",
              alignItems: "center",
              gap: 18,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "linear-gradient(150deg, #1c7351, #0d3a29)",
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M18.9 2H22l-7.3 8.3L23 22h-6.8l-5-6.6L5.4 22H2.3l7.8-8.9L2 2h6.9l4.5 6 5.5-6zm-2.4 18h1.7L7.6 3.8H5.8L16.5 20z" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "#9bb1a5", marginBottom: 4 }}>X (Twitter)</div>
              <a href="https://x.com/Mudassir_222" target="_blank" rel="noopener noreferrer" style={{ color: "#eef3ee", fontSize: 16, fontWeight: 600, textDecoration: "none" }}>
                @Mudassir_222
              </a>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div
          style={{
            marginTop: 56,
            padding: "36px",
            background: "rgba(28,115,81,.12)",
            border: "1px solid rgba(28,115,81,.25)",
            borderRadius: 20,
            textAlign: "center",
          }}
        >
          <h2 style={{ fontFamily: "var(--font-serif, Georgia, serif)", fontSize: 26, fontWeight: 600, marginBottom: 10 }}>
            Ready to try free catering software?
          </h2>
          <p style={{ color: "#9bb1a5", fontSize: 15, marginBottom: 22 }}>
            No credit card, no pricing, no limits during early access.
          </p>
          <Link
            href="/signup"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "#caa463",
              color: "#06100b",
              padding: "12px 24px",
              borderRadius: 100,
              fontSize: 15,
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Create your free account
          </Link>
        </div>
      </main>
    </div>
  );
}
