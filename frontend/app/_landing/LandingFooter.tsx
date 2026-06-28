import Link from "next/link";
import s from "../landing.module.css";
import { LogoMark } from "./icons";

export default function LandingFooter() {
  return (
    <footer className={s.footer}>
      <div className={s.wrap}>
        <div className={s.foot}>
          <div>
            <Link href="/" className={s.brand} style={{ marginBottom: 14, display: "inline-flex" }}>
              <LogoMark gradId="foot-grad" />
              Ziyafat
            </Link>
            <p className={s.footDesc}>The operating system for catering — from the first inquiry to the final invoice.</p>
          </div>
          <div className={s.fCol}>
            <h4>Platform</h4>
            <a href="#">Leads &amp; Inquiries</a>
            <a href="#">Bookings &amp; Events</a>
            <a href="#">Quotations</a>
            <a href="#">Invoices &amp; PDF</a>
            <a href="#">Public Storefront</a>
          </div>
          <div className={s.fCol}>
            <h4>Company</h4>
            <a href="#">About</a>
            <a href="#">Customers</a>
            <a href="#">Blog</a>
            <a href="#">Contact</a>
          </div>
          <div className={s.fCol}>
            <h4>Resources</h4>
            <a href="#">Help center</a>
            <a href="#">Onboarding</a>
            <a href="#">API docs</a>
            <a href="#">Security</a>
          </div>
        </div>
        <div className={s.footBottom}>
          <div>© {new Date().getFullYear()} Ziyafat. All rights reserved.</div>
          <div className={s.footSoc}>
            <a href="#" aria-label="X">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 2H22l-7.3 8.3L23 22h-6.8l-5-6.6L5.4 22H2.3l7.8-8.9L2 2h6.9l4.5 6 5.5-6zm-2.4 18h1.7L7.6 3.8H5.8L16.5 20z" /></svg>
            </a>
            <a href="https://www.linkedin.com/in/mudassirkhanmohammed" aria-label="LinkedIn">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 11-.02 5 2.5 2.5 0 01.02-5zM3 9h4v12H3zM10 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05C21.4 8.65 22 11 22 14.1V21h-4v-6.1c0-1.45-.03-3.3-2-3.3-2 0-2.3 1.57-2.3 3.2V21h-4z" /></svg>
            </a>
            <a href="#" aria-label="Instagram">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.8" /><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" /><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" /></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
