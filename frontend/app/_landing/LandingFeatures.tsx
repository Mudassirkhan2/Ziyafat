import s from "../landing.module.css";
import { Reveal } from "./Reveal";
import { CheckIcon } from "./icons";

export default function LandingFeatures() {
  return (
    <section className={s.features} id="features">
      <div className={s.wrap}>
        <Reveal className={s.featHead}>
          <span className={`${s.eyebrow} ${s.featEyebrow}`}><span className={s.eyebrowDot} /> Why Ziyafat</span>
          <h2>From the first inquiry to the final invoice.</h2>
          <p>Purpose-built for catering — every lead, every plate, every event and every rupee in one system, instead of spreadsheets and WhatsApp threads.</p>
        </Reveal>

        {/* Row 1: Lead-to-invoice pipeline — text left, shot right */}
        <Reveal className={s.frow}>
          <div className={s.ftext}>
            <span className={`${s.eyebrow} ${s.featEyebrow} ${s.ftextEyebrow}`}><span className={s.eyebrowDot} /> Catering Booking Software</span>
            <h3 className={s.ftextH3}>One thread from the first call to the final bill.</h3>
            <p className={s.ftextP}>Every inquiry becomes a trackable opportunity that flows — without re-keying — into a quotation, a confirmed booking, the events themselves, and finally an invoice. The complete catering order management system.</p>
            <ul className={s.fList}>
              <li className={s.fListItem}><span className={s.ck}><CheckIcon /></span><span><b>Capture every inquiry</b> with budget, guest count, ceremony type and source.</span></li>
              <li className={s.fListItem}><span className={s.ck}><CheckIcon /></span><span><b>Pipeline stages</b> — New → Quoted → Negotiating → Won — with follow-up reminders.</span></li>
              <li className={s.fListItem}><span className={s.ck}><CheckIcon /></span><span><b>Convert in one click</b> from a won lead to customer, booking and quote.</span></li>
            </ul>
          </div>
          <div className={s.shot}>
            <div className={s.shotTop}>
              <div className={s.shotTopLeft}>
                <svg style={{ color: "var(--em, #1c7351)", width: 24, height: 24 }} viewBox="0 0 24 24" fill="none"><path d="M3 5h18l-7 8v6l-4-2v-4L3 5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>
                Pipeline · This month
              </div>
              <span className={s.shotBadge}>38 active</span>
            </div>
            <div className={s.pipe}>
              <div className={s.pipeTrack}>
                <div className={`${s.pStep} ${s.pStepDone}`}><div className={s.pDot}><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 5a2 2 0 012-1z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /></svg></div><div className={s.pLabel}>Inquiry</div><div className={s.pVal}>142</div></div>
                <div className={`${s.pStep} ${s.pStepDone}`}><div className={s.pDot}><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M7 3h7l4 4v14H7z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /><path d="M14 3v4h4" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /></svg></div><div className={s.pLabel}>Quoted</div><div className={s.pVal}>86</div></div>
                <div className={`${s.pStep} ${s.pStepNow}`}><div className={s.pDot}><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 5h16v11H9l-4 3v-3H4z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /></svg></div><div className={s.pLabel}>Negotiating</div><div className={s.pVal}>24</div></div>
                <div className={s.pStep}><div className={s.pDot}><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></div><div className={s.pLabel}>Won</div><div className={s.pVal}>38</div></div>
                <div className={s.pStep}><div className={s.pDot}><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 3h12v18l-2-1.5L14 21l-2-1.5L10 21l-2-1.5L6 21z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /></svg></div><div className={s.pLabel}>Invoiced</div><div className={s.pVal}>31</div></div>
              </div>
              <div className={s.pipeFoot}>
                <div className={s.pfLabel}>Pipeline value<b className={s.pfLabelB}>All locations · September</b></div>
                <div className={s.pfAmt}>₹48.6L</div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Row 2: Per-plate cost — shot left, text right */}
        <Reveal className={`${s.frow} ${s.frowRev}`}>
          <div className={s.ftext}>
            <span className={`${s.eyebrow} ${s.featEyebrow} ${s.ftextEyebrow}`}><span className={s.eyebrowDot} /> Catering Inventory Software</span>
            <h3 className={s.ftextH3}>Know your margin on every plate.</h3>
            <p className={s.ftextP}>Build each dish once with its recipe and ingredient costs, and Ziyafat shows your true per-plate cost beside the selling price — so you quote with confidence whether it&apos;s 100 guests or 2,000. Complete catering accounting and inventory management in one place.</p>
            <ul className={s.fList}>
              <li className={s.fListItem}><span className={s.ck}><CheckIcon /></span><span><b>Recipe builder</b> links ingredients per 100 guests and auto-costs the plate.</span></li>
              <li className={s.fListItem}><span className={s.ck}><CheckIcon /></span><span><b>Live margin</b> on every dish, with veg / non-veg and cuisine tags.</span></li>
              <li className={s.fListItem}><span className={s.ck}><CheckIcon /></span><span><b>Procurement view</b> totals exact ingredient quantities for each event.</span></li>
            </ul>
          </div>
          <div className={s.shot}>
            <div className={s.shotTop}>
              <div className={s.shotTopLeft}>
                <svg style={{ color: "var(--em, #1c7351)", width: 24, height: 24 }} viewBox="0 0 24 24" fill="none"><path d="M4 11h16a8 8 0 01-16 0z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><path d="M9 11V7a3 3 0 016 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
                Dish · Recipe &amp; cost
              </div>
              <span className={s.shotBadge}>62% margin</span>
            </div>
            <div className={s.dCost}>
              <div className={s.dDish}>
                <div className={s.dPic} style={{ background: "linear-gradient(150deg,#c87a32,#8a4a1e)" }} />
                <div className={s.dName}>Chicken Dum Biryani<span className={s.dNameMeta}>Main · Hyderabadi · Non-veg</span></div>
              </div>
              <div className={s.dMetrics}>
                <div className={s.dm}><div className={s.dmLabel}>Plate cost</div><div className={s.dmVal}>₹118</div></div>
                <div className={s.dm}><div className={s.dmLabel}>Sell price</div><div className={s.dmVal}>₹310</div></div>
                <div className={s.dm}><div className={s.dmLabel}>Margin</div><div className={`${s.dmVal} ${s.dmValUp}`}>62%</div></div>
              </div>
              <div className={s.recipe}>
                <div className={s.recipeTop}><span>Recipe · per 100 guests</span><span>Yield 98%</span></div>
                <div className={s.ri}><span>Basmati rice</span><span className={s.riQty}>14 kg</span></div>
                <div className={s.ri}><span>Chicken</span><span className={s.riQty}>22 kg</span></div>
                <div className={s.ri}><span>Saffron, whole spices</span><span className={s.riQty}>1.2 kg</span></div>
                <div className={s.ri}><span>Fried onions &amp; ghee</span><span className={s.riQty}>6 kg</span></div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Row 3: Multi-event bookings — text left, shot right */}
        <Reveal className={s.frow}>
          <div className={s.ftext}>
            <span className={`${s.eyebrow} ${s.featEyebrow} ${s.ftextEyebrow}`}><span className={s.eyebrowDot} /> Catering Event Management Software</span>
            <h3 className={s.ftextH3}>One booking. Mehendi, Nikah and Walima.</h3>
            <p className={s.ftextP}>A single wedding usually means several functions across days and venues. Keep them under one booking with shared client, deposit and contract — while each event carries its own date, venue, headcount and service style.</p>
            <ul className={s.fList}>
              <li className={s.fListItem}><span className={s.ck}><CheckIcon /></span><span><b>Multiple events</b> per booking, each scheduled with setup, service and breakdown times.</span></li>
              <li className={s.fListItem}><span className={s.ck}><CheckIcon /></span><span><b>Service styles</b> — buffet, plated, live counters, stations or combo — set per event.</span></li>
              <li className={s.fListItem}><span className={s.ck}><CheckIcon /></span><span><b>Deposit, contract &amp; minimum guarantee</b> tracked across the whole booking.</span></li>
            </ul>
          </div>
          <div className={s.shot}>
            <div className={s.shotTop}>
              <div className={s.shotTopLeft}>
                <svg style={{ color: "var(--em, #1c7351)", width: 24, height: 24 }} viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" /><path d="M3 9h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
                Booking · Fatima &amp; Bilal
              </div>
              <span className={s.shotBadge}>Deposit received</span>
            </div>
            <div className={s.bk2}>
              <div className={s.bkHead}>
                <div><div className={s.bkTitle}>Fatima &amp; Bilal Wedding</div><div className={s.bkMeta}>3 events · Banjara Hills · Sep 2026</div></div>
                <div className={s.bkGuests}>Total guests<b className={s.bkGuestsNum}>1,450</b></div>
              </div>
              <div className={s.evt}><div className={s.evtDate}><div className={s.evtMo}>Sep</div><div className={s.evtDy}>12</div></div><div className={s.evtInfo}><div className={s.evtName}>Mehendi</div><div className={s.evtDesc}>Taj Krishna · 300 guests · 6:00 PM</div></div><span className={s.evtBadge}>Live counters</span></div>
              <div className={s.evt}><div className={s.evtDate}><div className={s.evtMo}>Sep</div><div className={s.evtDy}>13</div></div><div className={s.evtInfo}><div className={s.evtName}>Nikah</div><div className={s.evtDesc}>Grand hall · 450 guests · 1:00 PM</div></div><span className={s.evtBadge}>Family service</span></div>
              <div className={s.evt}><div className={s.evtDate}><div className={s.evtMo}>Sep</div><div className={s.evtDy}>14</div></div><div className={s.evtInfo}><div className={s.evtName}>Walima</div><div className={s.evtDesc}>Lawn · 700 guests · 7:30 PM</div></div><span className={s.evtBadge}>Buffet + stations</span></div>
            </div>
          </div>
        </Reveal>

        {/* Row 4: White-label + team — shot left, text right */}
        <Reveal className={`${s.frow} ${s.frowRev}`}>
          <div className={s.ftext}>
            <span className={`${s.eyebrow} ${s.featEyebrow} ${s.ftextEyebrow}`}><span className={s.eyebrowDot} /> Make it yours</span>
            <h3 className={s.ftextH3}>Your brand, your team, your rules.</h3>
            <p className={s.ftextP}>Set Ziyafat up once and the whole platform — every quotation, invoice and your public menu — wears your identity. Then invite your team and decide who can see and do what.</p>
            <ul className={s.fList}>
              <li className={s.fListItem}><span className={s.ck}><CheckIcon /></span><span><b>Customisable brand colours</b>, logo and banner — applied to every PDF and your storefront.</span></li>
              <li className={s.fListItem}><span className={s.ck}><CheckIcon /></span><span><b>Defaults that stick</b> — GSTIN, bank details, tax &amp; service rates, invoice prefix.</span></li>
              <li className={s.fListItem}><span className={s.ck}><CheckIcon /></span><span><b>Role-based team access</b> — invite managers and staff, and assign leads and bookings to them.</span></li>
            </ul>
          </div>
          <div className={s.shot}>
            <div className={s.shotTop}>
              <div className={s.shotTopLeft}>
                <svg style={{ color: "var(--em, #1c7351)", width: 24, height: 24 }} viewBox="0 0 24 24" fill="none"><path d="M4 8h10M18 8h2M4 16h2M10 16h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><circle cx="16" cy="8" r="2.3" stroke="currentColor" strokeWidth="1.8" /><circle cx="8" cy="16" r="2.3" stroke="currentColor" strokeWidth="1.8" /></svg>
                Setup · Organisation
              </div>
              <span className={s.shotBadge}>White-label</span>
            </div>
            <div className={s.setupGrid}>
              <div className={s.sp}>
                <div className={s.spTitle}>Brand</div>
                <div className={s.brandRow}>
                  <div className={s.brandLogo}><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M5 11h14a7 7 0 01-14 0z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /><path d="M9 11V7a3 3 0 016 0v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg></div>
                  <div><div className={s.brandName}>Shahi Caterers</div><span className={s.brandUrl}>shahicaterers.in</span></div>
                </div>
                <div className={s.swatches}>
                  <div className={s.swatch} style={{ background: "#1c7351" }}><span className={s.swatchLabel}>Primary</span></div>
                  <div className={s.swatch} style={{ background: "#caa463" }}><span className={s.swatchLabel}>Accent</span></div>
                  <div className={s.swatch} style={{ background: "#16201b" }}><span className={s.swatchLabel}>Surface</span></div>
                </div>
                <div className={s.setSmall}><span>Invoice prefix</span><b className={s.setSmallB}>SHC-001</b></div>
                <div className={s.setSmall}><span>Tax · Service</span><b className={s.setSmallB}>5% · 10%</b></div>
              </div>
              <div className={s.sp}>
                <div className={s.spTitle}>Team &amp; roles</div>
                <div className={s.team}>
                  <div className={s.tMember}><div className={s.tMemberAv}>RA</div><div className={s.tMemberName}>Rana Aziz</div><span className={`${s.tRole} ${s.tRoleAdm}`}>Owner</span></div>
                  <div className={s.tMember}><div className={s.tMemberAv}>SK</div><div className={s.tMemberName}>Sana Khan</div><span className={s.tRole}>Sales</span></div>
                  <div className={s.tMember}><div className={s.tMemberAv}>MV</div><div className={s.tMemberName}>M. Vali</div><span className={s.tRole}>Ops</span></div>
                  <div className={s.tMember}><div className={s.tMemberAv}>+4</div><div className={s.tMemberName}>Kitchen &amp; staff</div><span className={s.tRole}>Staff</span></div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

      </div>
    </section>
  );
}
