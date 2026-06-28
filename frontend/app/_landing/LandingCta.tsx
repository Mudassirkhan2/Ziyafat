import Link from "next/link";
import s from "../landing.module.css";
import { Reveal } from "./Reveal";

export default function LandingCta() {
  return (
    <section className={s.ctaSec}>
      <div className={s.wrap}>
        <Reveal className={s.ctaCard}>
          <div className={s.ctaPattern} />
          <div className={s.ctaGlow} />
          <span className={`${s.eyebrow} ${s.ctaEyebrow}`}><span className={s.eyebrowDot} /> Free during early access</span>
          <h2 className={s.ctaH2}>Set the table for your <em>best service yet.</em></h2>
          <p className={s.ctaP}>Ziyafat is completely free to use right now — every module, for your whole team, with no per-seat fees and no credit card. Start today and bring your entire operation into one place.</p>
          <div className={s.ctaActs}>
            <Link href="/signup" className={`${s.btn} ${s.btnGold}`}>
              Create your free account
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </Link>
          </div>
          <p className={s.freeLine}><b>No pricing, no per-seat fees, no credit card</b> — free while we&apos;re in early access.</p>
        </Reveal>
      </div>
    </section>
  );
}
