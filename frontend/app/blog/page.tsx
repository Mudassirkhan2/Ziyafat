import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Catering Software Blog — Guides & Resources for Caterers",
  description:
    "Free guides on catering software, catering management apps, and running a catering business in India. Compare tools, read reviews, and find the best software for caterers.",
  alternates: { canonical: "https://getziyafat.vercel.app/blog" },
};

const posts = [
  {
    slug: "best-free-catering-software-india-2025",
    tag: "Guide",
    date: "June 2025",
    readTime: "5 min read",
    title: "Best Free Catering Software in India (2025)",
    excerpt:
      "A complete guide to free catering software for small businesses in India — what to look for, what to avoid, and why Ziyafat is the top pick for caterers from Hyderabad to Mumbai.",
  },
  {
    slug: "best-catering-management-app-small-business",
    tag: "Buyers Guide",
    date: "June 2025",
    readTime: "6 min read",
    title: "Best Catering Management App for Small Business",
    excerpt:
      "From booking to invoice, here's how to pick the right catering management app for your small catering business without overpaying for features you don't need.",
  },
  {
    slug: "best-catering-software-hyderabad",
    tag: "Local",
    date: "June 2025",
    readTime: "4 min read",
    title: "Best Catering Software for Hyderabad Caterers",
    excerpt:
      "Hyderabad's catering industry is unique — weddings with 1,000+ guests, multi-day events, biryani at scale. Here's the catering software built for these exact needs.",
  },
  {
    slug: "jucas-flex-spoonfed-catering-software-alternatives",
    tag: "Comparison",
    date: "June 2025",
    readTime: "7 min read",
    title: "Jucas, Flex & Spoonfed Alternatives — Why Caterers Switch",
    excerpt:
      "Comparing Jucas catering software, Flex catering, Spoonfed and other catering software programs — and the free alternative caterers are increasingly switching to.",
  },
];

export default function BlogPage() {
  return (
    <div
      style={{
        background: "#06100b",
        minHeight: "100vh",
        color: "#eef3ee",
        fontFamily: "var(--font-sans-pub, system-ui, sans-serif)",
      }}
    >
      {/* Nav */}
      <header style={{ borderBottom: "1px solid rgba(255,255,255,.07)", padding: "0 28px" }}>
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 64,
          }}
        >
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

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "72px 28px" }}>
        <div style={{ marginBottom: 12 }}>
          <Link href="/" style={{ color: "#9bb1a5", fontSize: 13, textDecoration: "none" }}>
            ← Back to home
          </Link>
        </div>
        <h1
          style={{
            fontFamily: "var(--font-serif, Georgia, serif)",
            fontSize: "clamp(34px, 5vw, 52px)",
            fontWeight: 600,
            lineHeight: 1.05,
            marginBottom: 14,
          }}
        >
          Catering Software Guides.
        </h1>
        <p style={{ color: "#9bb1a5", fontSize: 17, lineHeight: 1.6, marginBottom: 60, maxWidth: 560 }}>
          Practical articles on catering management software, booking tools, and running a catering business in India.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 22,
          }}
        >
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              style={{
                background: "rgba(255,255,255,.045)",
                border: "1px solid rgba(255,255,255,.09)",
                borderRadius: 18,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                textDecoration: "none",
                color: "inherit",
                transition: "border-color .22s",
              }}
            >
              <div
                style={{
                  height: 110,
                  background: "linear-gradient(150deg, #0d3a29, #0a1812)",
                  borderBottom: "1px solid rgba(255,255,255,.07)",
                  display: "flex",
                  alignItems: "flex-end",
                  padding: "12px 16px",
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: ".14em",
                    textTransform: "uppercase",
                    color: "#7fe0b6",
                    background: "rgba(127,224,182,.1)",
                    border: "1px solid rgba(127,224,182,.2)",
                    padding: "4px 10px",
                    borderRadius: 100,
                  }}
                >
                  {post.tag}
                </span>
              </div>
              <div style={{ padding: 18, flex: 1, display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: 11, color: "#9bb1a5", marginBottom: 8 }}>
                  {post.date} · {post.readTime}
                </div>
                <h2
                  style={{
                    fontFamily: "var(--font-serif, Georgia, serif)",
                    fontSize: 18,
                    fontWeight: 600,
                    lineHeight: 1.3,
                    color: "#eef3ee",
                    marginBottom: 10,
                  }}
                >
                  {post.title}
                </h2>
                <p style={{ fontSize: 13, color: "#9bb1a5", lineHeight: 1.55, flex: 1, marginBottom: 16 }}>
                  {post.excerpt}
                </p>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: "#7fe0b6", display: "inline-flex", alignItems: "center", gap: 5 }}>
                  Read article
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
