import s from "../landing.module.css";
import { Reveal } from "./Reveal";

export default function LandingTestimonials() {
  return (
    <section className={s.testi} id="customers">
      <div className={s.wrap}>
        <Reveal className={s.secHead}>
          <span className={s.eyebrow}><span className={s.eyebrowDot} /> Loved by operators</span>
          <h2>From single kitchens to multi-site groups.</h2>
          <p>Catering teams run their busiest functions on Ziyafat — and their calmest back offices, too.</p>
        </Reveal>
        <div className={s.tGrid}>
          <Reveal className={`${s.tCard} ${s.featureQ}`}>
            <div className={s.tStars}>★★★★★</div>
            <span className={s.tQuote}>We replaced five separate tools with Ziyafat. Leads, bookings, quotations and invoices finally speak the same language — and our managers got their evenings back.</span>
            <div className={s.tWho}>
              <div className={s.tAv}>MR</div>
              <div><div className={s.tName}>Marco Rivera</div><div className={s.tRole}>Group GM · Prestige Banquets (4 venues)</div></div>
            </div>
          </Reveal>
          <Reveal className={s.tCard}>
            <div className={s.tStars}>★★★★★</div>
            <span className={s.tQuote}>Quotations that used to take a day now take ten minutes — and clients pay deposits on the spot.</span>
            <div className={s.tWho}><div className={s.tAv}>LC</div><div><div className={s.tName}>Liam Chen</div><div className={s.tRole}>Events Director · Lumière Catering</div></div></div>
          </Reveal>
          <Reveal className={s.tCard}>
            <div className={s.tStars}>★★★★★</div>
            <span className={s.tQuote}>The branded PDF invoices alone changed how our clients see us. It looks completely professional.</span>
            <div className={s.tWho}><div className={s.tAv}>SL</div><div><div className={s.tName}>Sophie L.</div><div className={s.tRole}>Owner · Harvest Events</div></div></div>
          </Reveal>
          <Reveal className={s.tCard}>
            <div className={s.tStars}>★★★★★</div>
            <span className={s.tQuote}>Per-plate costing meant I finally knew my margin before quoting. No more guessing.</span>
            <div className={s.tWho}><div className={s.tAv}>JP</div><div><div className={s.tName}>James Park</div><div className={s.tRole}>Founder · Grand Banquets</div></div></div>
          </Reveal>
          <Reveal className={s.tCard}>
            <div className={s.tStars}>★★★★★</div>
            <span className={s.tQuote}>Multi-event bookings — Ceremony, Reception, After-party — all under one file. Incredible.</span>
            <div className={s.tWho}><div className={s.tAv}>CM</div><div><div className={s.tName}>Claire M.</div><div className={s.tRole}>Operations · Signature Caterers</div></div></div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
