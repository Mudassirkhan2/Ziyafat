import s from "../landing.module.css";
import { Reveal } from "./Reveal";

export default function LandingContact() {
  return (
    <section className={s.contactSec} id="contact">
      <div className={s.wrap}>
        <Reveal>
          <div className={s.contactCard}>
            <div className={s.contactLeft}>
              <h2>Get in touch.</h2>
              <p>
                Questions about Ziyafat, partnership inquiries, or just want to
                say hello — we&apos;re happy to hear from you. Early access is
                completely free.
              </p>
            </div>
            <div className={s.contactDetails}>
              <div className={s.contactItem}>
                <div className={s.contactItemIco}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M22 6l-10 7L2 6"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div>
                  <div className={s.contactItemLabel}>Email</div>
                  <a
                    href="mailto:mudassir222001@gmail.com"
                    className={s.contactItemValue}
                  >
                    mudassir222001@gmail.com
                  </a>
                </div>
              </div>

              <div className={s.contactItem}>
                <div className={s.contactItemIco}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                    <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                </div>
                <div>
                  <div className={s.contactItemLabel}>Location</div>
                  <span className={s.contactItemValue} style={{ cursor: "default" }}>
                    Hyderabad, India
                  </span>
                </div>
              </div>

              <div className={s.contactItem}>
                <div className={s.contactItemIco}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.9 2H22l-7.3 8.3L23 22h-6.8l-5-6.6L5.4 22H2.3l7.8-8.9L2 2h6.9l4.5 6 5.5-6zm-2.4 18h1.7L7.6 3.8H5.8L16.5 20z" />
                  </svg>
                </div>
                <div>
                  <div className={s.contactItemLabel}>X (Twitter)</div>
                  <a
                    href="https://x.com/Mudassir_222"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={s.contactItemValue}
                  >
                    @Mudassir_222
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
