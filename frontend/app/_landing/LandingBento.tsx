import s from "../landing.module.css";
import { Reveal } from "./Reveal";

export default function LandingBento() {
  return (
    <section className={s.bentoSec} id="modules">
      <div className={s.wrap}>
        <Reveal className={s.secHead}>
          <span className={s.eyebrow}><span className={s.eyebrowDot} /> One platform · Eight modules</span>
          <h2>Everything a caterer needs, end to end.</h2>
          <p>From the first inquiry to the final invoice — plus your dish catalog, inventory, public storefront and white-label team settings, all connected.</p>
        </Reveal>
        <div className={s.bento}>

          <Reveal className={`${s.cell} ${s.cLeads}`}>
            <div className={s.cellIco}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 5h18l-7 8v6l-4-2v-4L3 5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>
            </div>
            <span className={s.cellTagline}>Pipeline</span>
            <h3 className={s.cellH3}>Leads &amp; Inquiries</h3>
            <p className={s.cellP}>Turn every phone call into a trackable opportunity — budget, guest count, ceremony type and source — and move it New → Quoted → Negotiating → Won.</p>
            <div className={s.cellStats}>
              <div><div className={s.csB}>142</div><div className={s.csSub}>inquiries</div></div>
              <div><div className={s.csB}>₹48.6L</div><div className={s.csSub}>pipeline</div></div>
              <div><div className={s.csB}>38</div><div className={s.csSub}>won</div></div>
            </div>
            <div className={s.cellVisual}>
              <div className={s.statusRow}>
                <div className={s.statusLn}><b>Walima · 600 pax</b><span className={`${s.pill2} ${s.pill2Quote}`}>Quoted</span></div>
                <div className={s.statusLn}><b>Corporate · 250 pax</b><span className={`${s.pill2} ${s.pill2Neg}`}>Negotiating</span></div>
                <div className={s.statusLn}><b>Fatima &amp; Bilal · 1,450</b><span className={`${s.pill2} ${s.pill2Won}`}>Won</span></div>
              </div>
            </div>
          </Reveal>

          <Reveal className={`${s.cell} ${s.cCust}`}>
            <div className={s.cellIco}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.8" /><path d="M3.5 20a5.5 5.5 0 0111 0M16 5a3 3 0 010 6M21 20a5 5 0 00-3.5-4.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
            </div>
            <span className={s.cellTagline}>CRM</span>
            <h3 className={s.cellH3}>Customer Management</h3>
            <p className={s.cellP}>Individuals, corporates, planners and venues — each with full booking history.</p>
            <div className={s.cellVisual}>
              <div className={s.cSeg}>
                <div className={s.cChip}><b>1,284</b> all</div>
                <div className={s.cChip}><b>86</b> corporate</div>
              </div>
              <div className={s.cList}>
                <div className={s.cRow}><div className={s.cAv}>SK</div><div className={s.cInfo}><b className={s.cInfoB}>Sana Khan</b>Wedding planner</div><span className={`${s.cTag} ${s.cTagVip}`}>VIP</span></div>
                <div className={s.cRow}><div className={s.cAv}>AC</div><div className={s.cInfo}><b className={s.cInfoB}>Acme Corp</b>Corporate</div><span className={s.cTag}>Repeat</span></div>
                <div className={s.cRow}><div className={s.cAv}>RB</div><div className={s.cInfo}><b className={s.cInfoB}>Rahul &amp; Bisma</b>Individual</div><span className={s.cTag}>New</span></div>
              </div>
            </div>
          </Reveal>

          <Reveal className={`${s.cell} ${s.cBook}`}>
            <div className={s.cellIco}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" /><path d="M3 9h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
            </div>
            <span className={s.cellTagline}>The hub</span>
            <h3 className={s.cellH3}>Bookings</h3>
            <p className={s.cellP}>Deposits, contracts and minimum guarantee, all in one place.</p>
            <div className={s.cellVisual}>
              <div className={s.statusRow}>
                <div className={s.statusLn}><b>Fatima &amp; Bilal</b><span className={`${s.pill2} ${s.pill2Won}`}>Deposit ✓</span></div>
                <div className={s.statusLn}><b>Acme Corp · Gala</b><span className={`${s.pill2} ${s.pill2Quote}`}>Contract</span></div>
              </div>
              <div className={s.stockBars} style={{ marginTop: 12 }}>
                <div className={s.stockRow}><span>Deposits</span><div className={s.stockTrack}><div className={s.stockFill} style={{ width: "68%" }} /></div></div>
                <div className={s.stockRow}><span>Contracts</span><div className={s.stockTrack}><div className={s.stockFill} style={{ width: "82%" }} /></div></div>
              </div>
            </div>
          </Reveal>

          <Reveal className={`${s.cell} ${s.cQi}`}>
            <div className={s.cellIco}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M7 3h7l4 4v14H7z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><path d="M14 3v4h4M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <span className={s.cellTagline}>Billing</span>
            <h3 className={s.cellH3}>Quotations &amp; Invoices</h3>
            <p className={s.cellP}>Versioned quotes convert to invoices in one click — then print or send them to clients as a polished PDF in <b>your own brand</b>, logo, colours and GSTIN included.</p>
            <div className={s.cellVisual}>
              <div className={s.docs2}>
                <div className={s.bdoc}>
                  <div className={s.bdocStripe} />
                  <div className={s.bdocHead}><span>Quotation</span><span className={s.bdocPdf}>PDF</span></div>
                  <div className={s.bdocNum}>Q-1043 · v2</div>
                  <div className={s.bdocAmt}>₹9.4L</div>
                  <div className={s.bdocMeta}>Approved · e-signed</div>
                </div>
                <div className={s.bdoc}>
                  <div className={s.bdocStripe} />
                  <div className={s.bdocHead}><span>Invoice</span><span className={s.bdocPdf}>PDF</span></div>
                  <div className={s.bdocNum}>SHC-044</div>
                  <div className={s.bdocAmt}>₹4.7L</div>
                  <div className={s.bdocMeta}>Paid · Fatima &amp; Bilal</div>
                </div>
              </div>
              <div className={s.printRow}>
                <div className={`${s.printBtn} ${s.printBtnSolid}`}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M6 9V3h12v6M6 18H4v-5a2 2 0 012-2h12a2 2 0 012 2v5h-2M8 14h8v6H8z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>
                  Print in your brand
                </div>
                <div className={`${s.printBtn} ${s.printBtnGhost}`}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  Send to client
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal className={`${s.cell} ${s.cDish}`}>
            <div className={s.cellIco}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 11h16a8 8 0 01-16 0z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><path d="M9 11V7a3 3 0 016 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
            </div>
            <span className={s.cellTagline}>Menu</span>
            <h3 className={s.cellH3}>Dish Catalog</h3>
            <p className={s.cellP}>Every dish with recipe, per-plate cost, cuisine and veg / non-veg.</p>
            <div className={s.cellVisual}>
              <div className={s.statusRow}>
                <div className={s.statusLn}><b><span className={s.vTagNon} />Chicken Dum Biryani</b><span style={{ color: "var(--gold-s)", fontWeight: 700 }}>₹310</span></div>
                <div className={s.statusLn}><b><span className={s.vTagNon} />Mutton Haleem</b><span style={{ color: "var(--gold-s)", fontWeight: 700 }}>₹260</span></div>
                <div className={s.statusLn}><b><span className={s.vTagVeg} />Mirchi ka Salan</b><span style={{ color: "var(--gold-s)", fontWeight: 700 }}>₹120</span></div>
                <div className={s.statusLn}><b><span className={s.vTagVeg} />Qubani ka Meetha</b><span style={{ color: "var(--gold-s)", fontWeight: 700 }}>₹140</span></div>
              </div>
            </div>
          </Reveal>

          <Reveal className={`${s.cell} ${s.cEvent}`}>
            <div className={s.cellIco}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 3v3M5 12a7 7 0 0114 0H5zM3 12h18M8 21h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <span className={s.cellTagline}>Functions</span>
            <h3 className={s.cellH3}>Events</h3>
            <p className={s.cellP}>Many events per booking — Mehendi, Nikah, Walima — each with its own venue, headcount and service style.</p>
            <div className={s.cellVisual}>
              <div className={s.statusRow}>
                <div className={s.statusLn}><b>Nikah · 450 pax</b><span className={`${s.pill2} ${s.pill2Quote}`}>Family</span></div>
                <div className={s.statusLn}><b>Walima · 700 pax</b><span className={`${s.pill2} ${s.pill2Quote}`}>Buffet</span></div>
              </div>
            </div>
          </Reveal>

          <Reveal className={`${s.cell} ${s.cInv}`}>
            <div className={s.cellIco}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 7l9-4 9 4-9 4-9-4zM3 7v10l9 4 9-4V7M12 11v10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <span className={s.cellTagline}>Supply</span>
            <h3 className={s.cellH3}>Ingredient &amp; Inventory</h3>
            <p className={s.cellP}>Stock on hand, par levels and auto-procurement per event.</p>
            <div className={s.cellVisual}>
              <div className={s.stockBars}>
                <div className={s.stockRow}><span>Basmati</span><div className={s.stockTrack}><div className={s.stockFill} style={{ width: "74%" }} /></div></div>
                <div className={s.stockRow}><span>Chicken</span><div className={s.stockTrack}><div className={s.stockFill} style={{ width: "58%" }} /></div></div>
                <div className={s.stockRow}><span>Ghee</span><div className={s.stockTrack}><div className={`${s.stockFill} ${s.stockFillLow}`} style={{ width: "22%" }} /></div></div>
                <div className={s.stockRow}><span>Saffron</span><div className={s.stockTrack}><div className={`${s.stockFill} ${s.stockFillLow}`} style={{ width: "31%" }} /></div></div>
              </div>
            </div>
          </Reveal>

          <Reveal className={`${s.cell} ${s.cStore}`}>
            <div className={s.cellIco}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="6" y="2" width="12" height="20" rx="2.5" stroke="currentColor" strokeWidth="1.8" /><path d="M10 18h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
            </div>
            <span className={s.cellTagline}>Guest-facing</span>
            <h3 className={s.cellH3}>Public Storefront</h3>
            <p className={s.cellP}>A branded mini-site of your menu — drag sections to build it.</p>
            <div className={s.cellVisual}>
              <div className={s.phone}>
                <div className={s.phoneScr}>
                  <div className={`${s.phoneBar} ${s.phoneBarGold}`} />
                  <div className={s.phoneBar} />
                  <div className={s.phoneBar} style={{ width: "75%" }} />
                  <div className={s.phoneBar} style={{ width: "60%" }} />
                </div>
              </div>
            </div>
          </Reveal>

        </div>
      </div>
    </section>
  );
}
