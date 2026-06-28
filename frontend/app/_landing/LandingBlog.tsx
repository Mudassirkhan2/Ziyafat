import Link from "next/link";
import s from "../landing.module.css";
import { Reveal } from "./Reveal";

const posts = [
  {
    slug: "best-free-catering-software-india-2025",
    tag: "Guide",
    date: "June 2025",
    readTime: "5 min read",
    title: "Best Free Catering Software in India (2025)",
    excerpt:
      "A complete guide to free catering software for small businesses in India — what to look for, what to avoid, and why Ziyafat is the top pick.",
  },
  {
    slug: "best-catering-management-app-small-business",
    tag: "Buyers Guide",
    date: "June 2025",
    readTime: "6 min read",
    title: "Best Catering Management App for Small Business",
    excerpt:
      "From booking to invoice, here's how to pick the right catering management app for your small catering business without overpaying.",
  },
  {
    slug: "best-catering-software-hyderabad",
    tag: "Local",
    date: "June 2025",
    readTime: "4 min read",
    title: "Best Catering Software for Hyderabad Caterers",
    excerpt:
      "Hyderabad's catering industry is unique — weddings with 1,000+ guests, multi-day events, biryani at scale. Here's the software built for it.",
  },
  {
    slug: "jucas-flex-spoonfed-catering-software-alternatives",
    tag: "Comparison",
    date: "June 2025",
    readTime: "7 min read",
    title: "Jucas, Flex & Spoonfed Alternatives — Why Caterers Switch",
    excerpt:
      "Comparing Jucas, Flex catering, Spoonfed and other popular catering software programs — and the free alternative caterers are switching to.",
  },
];

export default function LandingBlog() {
  return (
    <section className={s.blogSec} id="blog">
      <div className={s.wrap}>
        <Reveal className={s.secHead}>
          <span className={s.eyebrow}>
            <span className={s.eyebrowDot} /> Catering Software Guides
          </span>
          <h2>Resources for caterers.</h2>
          <p>
            Practical guides on choosing and using catering management software
            — from free tools to full systems.
          </p>
        </Reveal>

        <div className={s.blogGrid}>
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className={s.blogCard}>
              <div className={s.blogThumb}>
                <span className={s.blogTag}>{post.tag}</span>
              </div>
              <div className={s.blogBody}>
                <div className={s.blogMeta}>
                  {post.date} · {post.readTime}
                </div>
                <h3 className={s.blogH3}>{post.title}</h3>
                <p className={s.blogExcerpt}>{post.excerpt}</p>
                <span className={s.blogReadMore}>
                  Read article
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 12h14M13 6l6 6-6 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 40 }}>
          <Link href="/blog" className={`${s.btn} ${s.btnGhost}`}>
            View all articles
          </Link>
        </div>
      </div>
    </section>
  );
}
