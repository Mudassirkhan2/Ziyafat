"use client";
import { motion } from "framer-motion";
import s from "../landing.module.css";
import { reveal } from "./utils";

export default function HeroMock() {
  return (
    <motion.div className={s.mock} {...reveal} transition={{ ...reveal.transition, delay: 0.12 }}>
      <div className={s.mockCard}>
        <div className={s.mockTop}>
          <div className={s.mockDots}><i /><i /><i /></div>
          <div className={s.mockTitle}>Dashboard · All venues</div>
          <span className={s.livedot}>Live</span>
        </div>
        <div className={s.hMetrics}>
          <div className={`${s.hm} ${s.hmEm}`}>
            <div className={s.hmLabel}>Lead win rate</div>
            <div className={s.hmVal}>48%<span className={s.hmValSm}>↑6</span></div>
            <div className={s.hmSpark}>
              <i style={{ height: "40%" }} /><i style={{ height: "55%" }} /><i style={{ height: "48%" }} />
              <i style={{ height: "70%" }} /><i className={s.sparkOnEm} style={{ height: "86%" }} /><i className={s.sparkOnEm} style={{ height: "100%" }} />
            </div>
          </div>
          <div className={`${s.hm} ${s.hmGold}`}>
            <div className={s.hmLabel}>Revenue paid</div>
            <div className={s.hmVal}>₹62.4L<span className={s.hmValSm}>↑18%</span></div>
            <div className={s.hmSpark}>
              <i style={{ height: "35%" }} /><i style={{ height: "50%" }} /><i style={{ height: "62%" }} />
              <i style={{ height: "58%" }} /><i className={s.sparkOnGold} style={{ height: "80%" }} /><i className={s.sparkOnGold} style={{ height: "100%" }} />
            </div>
          </div>
        </div>
        <div className={s.hRow}>
          <div className={s.barChart}>
            <div className={s.chTop}>
              <b className={s.chTopB}>Revenue · 6 months</b>
              <span className={s.chPill}>Real-time</span>
            </div>
            <div className={s.bars} style={{ height: 90 }}>
              <div className={s.bar} style={{ height: "42%" }} />
              <div className={s.bar} style={{ height: "58%" }} />
              <div className={s.bar} style={{ height: "50%" }} />
              <div className={s.bar} style={{ height: "74%" }} />
              <div className={`${s.bar} ${s.barHot}`} style={{ height: "100%" }} />
              <div className={s.bar} style={{ height: "80%" }} />
            </div>
          </div>
          <div className={s.hDonut}>
            <div className={s.chTop}><b className={s.chTopB}>By ceremony</b></div>
            <div className={s.donutWrap}>
              <svg className={s.donutSvg} width="78" height="78" viewBox="0 0 80 80" fill="none">
                <circle cx="40" cy="40" r="30" stroke="rgba(255,255,255,.08)" strokeWidth="11" />
                <circle cx="40" cy="40" r="30" stroke="var(--em, #1c7351)" strokeWidth="11" strokeDasharray="94 94.5" />
                <circle cx="40" cy="40" r="30" stroke="var(--gold, #caa463)" strokeWidth="11" strokeDasharray="50 138.5" strokeDashoffset="-94" />
                <circle cx="40" cy="40" r="30" stroke="var(--em-bright, #7fe0b6)" strokeWidth="11" strokeDasharray="44.5 144" strokeDashoffset="-144" />
              </svg>
            </div>
            <div className={s.donutLeg}>
              <div className={s.donutLegItem}><i className={s.donutLegDot} style={{ background: "var(--em, #1c7351)" }} />Weddings <b style={{ marginLeft: "auto" }}>50%</b></div>
              <div className={s.donutLegItem}><i className={s.donutLegDot} style={{ background: "var(--gold, #caa463)" }} />Corporate <b style={{ marginLeft: "auto" }}>27%</b></div>
              <div className={s.donutLegItem}><i className={s.donutLegDot} style={{ background: "var(--em-bright, #7fe0b6)" }} />Other <b style={{ marginLeft: "auto" }}>23%</b></div>
            </div>
          </div>
        </div>
      </div>

      <motion.div
        className={`${s.float} ${s.f1}`}
        animate={{ y: [0, -9, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className={`${s.floatIc} ${s.floatIcEm}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 5a2 2 0 012-1z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          </svg>
        </div>
        <div className={s.floatText}>
          <b className={s.floatTextB}>New lead · Walima</b>
          600 pax · Banjara Hills
        </div>
      </motion.div>

      <motion.div
        className={`${s.float} ${s.f2}`}
        animate={{ y: [0, -9, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
      >
        <div className={`${s.floatIc} ${s.floatIcGold}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M6 3h12v18l-2-1.5L14 21l-2-1.5L10 21l-2-1.5L6 21z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M9 8h6M9 12h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </div>
        <div className={s.floatText}>
          <b className={s.floatTextB}>Invoice paid</b>
          ₹4.7L · Fatima &amp; Bilal
        </div>
      </motion.div>
    </motion.div>
  );
}
