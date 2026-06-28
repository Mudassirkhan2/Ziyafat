import s from "../landing.module.css";
import { Reveal } from "./Reveal";
import { CheckIcon } from "./icons";

export default function LandingTour() {
  return (
    <section className={s.tour} id="workspace">
      <div className={s.wrap}>
        <Reveal className={s.secHead}>
          <span className={s.eyebrow}><span className={s.eyebrowDot} /> Command centre &amp; billing</span>
          <h2>Run the numbers, send the paperwork.</h2>
          <p>Your live dashboard and the quote-to-invoice money trail — every figure in real time, every document printed in your own brand.</p>
        </Reveal>

        {/* 01 Dashboard */}
        <Reveal className={s.tRow}>
          <div className={s.tCopy}>
            <div className={s.modTag}><span className={s.modNo}>01</span><span className={s.modLbl}>Dashboard</span></div>
            <h3 className={s.tCopyH3}>Your whole catering business, at a glance.</h3>
            <p className={s.tCopyP}>Open Ziyafat to the two numbers that matter most — how many leads you&apos;re winning and how much money has actually landed — beside live charts for revenue and bookings by ceremony type.</p>
            <ul className={s.tfList}>
              <li className={s.tfListItem}><span className={s.tfCk}><CheckIcon /></span><span><b>Lead win rate &amp; revenue paid</b> front and centre, not buried in a report.</span></li>
              <li className={s.tfListItem}><span className={s.tfCk}><CheckIcon /></span><span><b>Everything updates in real time</b> — no manual tallying, no Excel formulas.</span></li>
              <li className={s.tfListItem}><span className={s.tfCk}><CheckIcon /></span><span><b>Revenue by ceremony type</b> shows you which functions drive the most value.</span></li>
            </ul>
          </div>
          <div className={s.tourCard}>
            <div className={s.tcTop}>
              <div className={s.tcTitle}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" /><rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" /><rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" /><rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" /></svg>
                Dashboard · Live
              </div>
              <span className={s.tcBadge}>Real-time</span>
            </div>
            <div className={s.dshHMetrics}>
              <div className={`${s.hm} ${s.hmEm}`} style={{ position: "relative", zIndex: 1 }}>
                <div className={s.hmLabel}>Lead win rate</div>
                <div className={s.hmVal}>48%<span className={s.hmValSm}>↑6</span></div>
                <div className={s.hmSpark}>
                  <i style={{ height: "40%" }} /><i style={{ height: "55%" }} /><i style={{ height: "48%" }} />
                  <i style={{ height: "70%" }} /><i className={s.sparkOnEm} style={{ height: "86%" }} /><i className={s.sparkOnEm} style={{ height: "100%" }} />
                </div>
              </div>
              <div className={`${s.hm} ${s.hmGold}`} style={{ position: "relative", zIndex: 1 }}>
                <div className={s.hmLabel}>Revenue paid</div>
                <div className={s.hmVal}>₹62.4L<span className={s.hmValSm}>↑18%</span></div>
                <div className={s.hmSpark}>
                  <i style={{ height: "35%" }} /><i style={{ height: "50%" }} /><i style={{ height: "62%" }} />
                  <i style={{ height: "58%" }} /><i className={s.sparkOnGold} style={{ height: "80%" }} /><i className={s.sparkOnGold} style={{ height: "100%" }} />
                </div>
              </div>
            </div>
            <div className={s.dshMain}>
              <div className={s.dshPanel}>
                <div className={s.dshPt}><span>Revenue · 6 months</span><span className={s.dshPtUp}>↑18%</span></div>
                <div className={s.bars} style={{ height: 84 }}>
                  <div className={s.bar} style={{ height: "42%" }} /><div className={s.bar} style={{ height: "58%" }} /><div className={s.bar} style={{ height: "50%" }} /><div className={s.bar} style={{ height: "74%" }} /><div className={`${s.bar} ${s.barHot}`} style={{ height: "100%" }} /><div className={s.bar} style={{ height: "80%" }} />
                </div>
              </div>
              <div className={s.dshDonut}>
                <div className={s.dshPt}><span>By ceremony</span></div>
                <svg className={s.donutSvg} width="82" height="82" viewBox="0 0 80 80" fill="none">
                  <circle cx="40" cy="40" r="30" stroke="rgba(255,255,255,.08)" strokeWidth="11" />
                  <circle cx="40" cy="40" r="30" stroke="var(--em, #1c7351)" strokeWidth="11" strokeDasharray="94 94.5" />
                  <circle cx="40" cy="40" r="30" stroke="var(--gold, #caa463)" strokeWidth="11" strokeDasharray="50 138.5" strokeDashoffset="-94" />
                  <circle cx="40" cy="40" r="30" stroke="var(--em-bright, #7fe0b6)" strokeWidth="11" strokeDasharray="44.5 144" strokeDashoffset="-144" />
                </svg>
                <div className={s.dshLegend}>
                  <div className={s.dshLegItem}><i className={s.dshLegDot} style={{ background: "var(--em, #1c7351)" }} />Weddings 50%</div>
                  <div className={s.dshLegItem}><i className={s.dshLegDot} style={{ background: "var(--gold, #caa463)" }} />Corporate 27%</div>
                  <div className={s.dshLegItem}><i className={s.dshLegDot} style={{ background: "var(--em-bright, #7fe0b6)" }} />Other 23%</div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* 02 Quotations */}
        <Reveal className={`${s.tRow} ${s.tRowRev}`}>
          <div className={s.tCopy}>
            <div className={s.modTag}><span className={s.modNo}>02</span><span className={s.modLbl}>Quotations</span></div>
            <h3 className={s.tCopyH3}>Versioned proposals, approved and signed online.</h3>
            <p className={s.tCopyP}>Build a quote from your dish catalog with per-plate pricing, charges and deposit terms. Track every version, let clients approve and e-sign — then print or send it as a branded PDF.</p>
            <ul className={s.tfList}>
              <li className={s.tfListItem}><span className={s.tfCk}><CheckIcon /></span><span><b>Line items from the catalog</b> with auto subtotal, tax and per-person price.</span></li>
              <li className={s.tfListItem}><span className={s.tfCk}><CheckIcon /></span><span><b>Version tracking</b> — v1, v2, v3 — with old versions marked superseded.</span></li>
              <li className={s.tfListItem}><span className={s.tfCk}><CheckIcon /></span><span><b>Branded PDF</b> clients can approve and pay a deposit on.</span></li>
            </ul>
          </div>
          <div className={s.tourCard}>
            <div className={s.tcTop}>
              <div className={s.tcTitle}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M7 3h7l4 4v14H7z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><path d="M14 3v4h4" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>
                Quotation · Q-1043
              </div>
              <span className={`${s.tcBadge} ${s.tcBadgeGold}`}>v2 · Sent</span>
            </div>
            <div className={s.quote}>
              <div className={s.qHead}>
                <div><div className={s.qEvent}>Fatima &amp; Bilal Wedding</div><div className={s.qEventMeta}>1,450 guests · 3 events</div></div>
                <div className={s.qNo}>#Q-1043<br />Valid 14 days</div>
              </div>
              <div className={s.qLine}><span className={s.qLineDish}>Chicken Dum Biryani — 700</span><span className={s.qLineQty}>₹310 / plate</span></div>
              <div className={s.qLine}><span className={s.qLineDish}>Mezze &amp; live counters</span><span className={s.qLineQty}>₹1.4L</span></div>
              <div className={s.qLine}><span className={s.qLineDish}>Service staff (12)</span><span className={s.qLineQty}>₹84,000</span></div>
              <div className={s.qTotal}><span>Total incl. 5% tax</span><span className={s.qTotalAmt}>₹9.4L</span></div>
              <div className={s.qBtns}><div className={s.qBtnPrimary}>Approve &amp; pay deposit</div><div className={s.qBtnGhost}>Download PDF</div></div>
            </div>
          </div>
        </Reveal>

        {/* 03 Invoices */}
        <Reveal className={s.tRow}>
          <div className={s.tCopy}>
            <div className={s.modTag}><span className={s.modNo}>03</span><span className={s.modLbl}>Invoices</span></div>
            <h3 className={s.tCopyH3}>From approved quote to paid invoice.</h3>
            <p className={s.tCopyP}>Approved quotes become invoices automatically — numbered in your prefix, with charges and totals carried over. Track deposits and balances, and print or send each one in your brand.</p>
            <ul className={s.tfList}>
              <li className={s.tfListItem}><span className={s.tfCk}><CheckIcon /></span><span><b>Auto-populated</b> from the approved quotation — no re-keying.</span></li>
              <li className={s.tfListItem}><span className={s.tfCk}><CheckIcon /></span><span><b>Payment tracking</b> — amount paid, balance due, method and date.</span></li>
              <li className={s.tfListItem}><span className={s.tfCk}><CheckIcon /></span><span><b>Branded PDF</b> with your logo, colours, GSTIN and bank details.</span></li>
            </ul>
          </div>
          <div className={s.tourCard}>
            <div className={s.tcTop}>
              <div className={s.tcTitle}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M6 3h12v18l-2-1.5L14 21l-2-1.5L10 21l-2-1.5L6 21z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><path d="M9 8h6M9 12h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
                Invoices · September
              </div>
              <span className={`${s.tcBadge} ${s.tcBadgeWarn}`}>₹4.2L due</span>
            </div>
            <div className={s.invSum}>
              <div className={s.invSumItem}><div className={s.invSumLabel}>Collected</div><div className={s.invSumVal}>₹38.6L</div></div>
              <div className={s.invSumItem}><div className={s.invSumLabel}>Outstanding</div><div className={`${s.invSumVal} ${s.invSumWarn}`}>₹4.2L</div></div>
            </div>
            <div className={s.invList}>
              <div className={s.invRow}><span className={s.invNo}>SHC-044</span><span className={s.invClient}>Fatima &amp; Bilal</span><span className={s.invAmt}>₹4.7L</span><span className={`${s.invSt} ${s.invPaid}`}>Paid</span></div>
              <div className={s.invRow}><span className={s.invNo}>SHC-041</span><span className={s.invClient}>Acme Corp</span><span className={s.invAmt}>₹1.2L</span><span className={`${s.invSt} ${s.invOver}`}>Overdue</span></div>
              <div className={s.invRow}><span className={s.invNo}>SHC-046</span><span className={s.invClient}>Zara &amp; Sons</span><span className={s.invAmt}>₹98k</span><span className={`${s.invSt} ${s.invDraft}`}>Draft</span></div>
            </div>
          </div>
        </Reveal>

      </div>
    </section>
  );
}
