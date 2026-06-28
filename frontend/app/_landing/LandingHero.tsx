import Link from "next/link";
import s from "../landing.module.css";
import { Reveal } from "./Reveal";
import HeroMock from "./HeroMock";

export default function LandingHero() {
  return (
    <section className={s.hero} id="platform">
      <div className={s.heroBg}>
        <div className={`${s.glow} ${s.g1}`} />
        <div className={`${s.glow} ${s.g2}`} />
        <div className={`${s.glow} ${s.g3}`} />
      </div>
      <div className={s.pattern} />
      <div className={`${s.wrap} ${s.heroIn}`}>
        <Reveal className={s.heroCopy}>
          <div className={s.chip}>
            <span className={s.chipTag}>FREE</span>
            <span><b>Free to use</b> — the whole platform, no pricing during early access</span>
          </div>
          <h1 className={s.heroH1}>
            Catering, from first <em>inquiry</em> to final invoice.
          </h1>
          <p className={s.heroSub}>
            Free catering management software for leads, quotes, multi-event bookings and branded invoices — replacing spreadsheets and WhatsApp for caterers of every cuisine and scale across India.
          </p>
          <div className={s.heroActions}>
            <Link href="/signup" className={`${s.btn} ${s.btnGold}`}>
              Create your free account
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <span className={s.freeTag}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M12 3l1.7 5.1 5.3 1.4-5.3 1.4L12 16l-1.7-5.1L5 9.5l5.3-1.4L12 3z" fill="currentColor" />
              </svg>
              Free to use — no pricing yet
            </span>
          </div>
          <div className={s.heroTrust}>
            <span>
              <svg className={s.tick} width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Lead-to-invoice pipeline
            </span>
            <span>
              <svg className={s.tick} width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Per-plate cost visibility
            </span>
            <span>
              <svg className={s.tick} width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Multi-event bookings
            </span>
          </div>
        </Reveal>

        <HeroMock />
      </div>
    </section>
  );
}
