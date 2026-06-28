import s from "../landing.module.css";
import { Reveal } from "./Reveal";
import { Counter } from "./utils";

export default function LandingStats() {
  return (
    <section className={s.statsBand}>
      <div className={s.wrap}>
        <Reveal className={s.sbGrid}>
          <div className={s.sbStat}>
            <div className={s.sbNum}><Counter end={1200} suffix="+" /></div>
            <div className={s.sbLabel}>Venues running Ziyafat</div>
          </div>
          <div className={s.sbStat}>
            <div className={s.sbNum}><Counter end={18} suffix="M" /></div>
            <div className={s.sbLabel}>Covers served per year</div>
          </div>
          <div className={s.sbStat}>
            <div className={s.sbNum}><Counter end={32} suffix="%" /></div>
            <div className={s.sbLabel}>Faster quote turnaround</div>
          </div>
          <div className={s.sbStat}>
            <div className={s.sbNum}><Counter end={4.9} decimals={1} /></div>
            <div className={s.sbLabel}>Average operator rating</div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
