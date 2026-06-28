import s from "../landing.module.css";

export default function LandingLogos() {
  return (
    <section className={s.logos}>
      <div className={s.wrap}>
        <p className={s.logosP}>Trusted by caterers who never miss a function</p>
        <div className={s.logoRow}>
          <div className={s.logoItem}>Shahi <span className={s.logoSub}>Caterers</span></div>
          <div className={s.logoItem}>Nizami <span className={s.logoSub}>Dawat</span></div>
          <div className={s.logoItem}>Zaiqa</div>
          <div className={s.logoItem}>Al-Noor <span className={s.logoSub}>Events</span></div>
          <div className={s.logoItem}>Paradise <span className={s.logoSub}>Banquets</span></div>
          <div className={s.logoItem}>Deccan <span className={s.logoSub}>Catering</span></div>
        </div>
      </div>
    </section>
  );
}
