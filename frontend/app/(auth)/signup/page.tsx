"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import styles from "./signup.module.css";

const signupSchema = z
  .object({
    org_name: z.string().min(2, "Organisation name required"),
    owner_name: z.string().min(2, "Your name is required"),
    owner_email: z.string().email("Enter a valid email"),
    owner_password: z.string().min(8, "At least 8 characters"),
    owner_password_confirm: z.string(),
  })
  .refine((d) => d.owner_password === d.owner_password_confirm, {
    message: "Passwords do not match",
    path: ["owner_password_confirm"],
  });

type SignupValues = z.infer<typeof signupSchema>;

const FEATURES = [
  { icon: "📋", title: "Leads & Bookings", sub: "Track every enquiry, convert to confirmed events" },
  { icon: "📄", title: "Quotes & Invoices", sub: "Professional PDFs from your dish catalog" },
  { icon: "🌐", title: "Public Menu", sub: "Branded storefront for walk-in customers" },
];

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { org_name: "", owner_name: "", owner_email: "", owner_password: "", owner_password_confirm: "" },
  });

  const orgName = watch("org_name");

  function toSlug(name: string) {
    return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  }

  async function onSubmit(values: SignupValues) {
    try {
      await api.post("/setup", {
        org_name: values.org_name,
        org_slug: toSlug(values.org_name) || "my-org",
        org_phone: null,
        org_email: null,
        org_address: null,
        org_tagline: null,
        primary: "#d97706",
        on_primary: "#0c0a09",
        primary_container: "#451a03",
        on_primary_container: "#fed7aa",
        secondary: "#f59e0b",
        on_secondary: "#0c0a09",
        secondary_container: "#78350f",
        on_secondary_container: "#fde68a",
        owner_name: values.owner_name,
        owner_email: values.owner_email,
        owner_password: values.owner_password,
      });
      router.push("/login");
    } catch (err) {
      setError("root", { message: err instanceof Error ? err.message : "Signup failed. Please try again." });
    }
  }

  /* ── Already configured ── */
  return (
    <div className={styles.shell}>
      {/* ── Brand side (left) ── */}
      <div className={styles.brandside}>
        <div className={styles.g1} />
        <div className={styles.g2} />
        <div className={styles.dots} />

        <a href="/" className={styles.logo}>
          <Image src="/svg/logo-mark.svg" width="32" height="32" alt="Ziyafat" />
          <span className={styles.logoName}>Ziyafat</span>
        </a>

        <div className={styles.brandMiddle}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowDot} />
            Start for free
          </div>

          <h2 className={styles.brandHeading}>
            Everything your catering business needs, <em>in one place.</em>
          </h2>

          {/* Illustration */}
          <div className={styles.svgWrap}>
            <svg viewBox="0 0 460 320" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", maxWidth: 460, display: "block", overflow: "visible" }}>
              <defs>
                <linearGradient id="sg-teal" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#0e6e6e" />
                  <stop offset="1" stopColor="#072e2e" />
                </linearGradient>
                <linearGradient id="sg-gold" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#e6cf9c" />
                  <stop offset="1" stopColor="#caa463" />
                </linearGradient>
                <linearGradient id="sg-glass" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#ffffff" stopOpacity=".12" />
                  <stop offset="1" stopColor="#ffffff" stopOpacity=".03" />
                </linearGradient>
              </defs>

              {/* Soft glow rings */}
              <circle cx="230" cy="160" r="120" stroke="#74d6cf" strokeOpacity=".1" strokeWidth="1" strokeDasharray="3 9" />
              <circle cx="230" cy="160" r="84" stroke="#caa463" strokeOpacity=".12" strokeWidth="1" strokeDasharray="2 8" />

              {/* Central sparkle / check */}
              <rect x="214" y="144" width="32" height="32" rx="4" transform="rotate(45 230 160)" fill="url(#sg-teal)" stroke="#74d6cf" strokeOpacity=".5" strokeWidth="1.5" />
              <path d="M221 160l6 6 12-12" stroke="#e6cf9c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

              {/* Floating feature card: Leads */}
              <motion.g animate={{ y: [0, -8, 0] }} transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}>
                <rect x="20" y="68" width="148" height="82" rx="16" fill="url(#sg-glass)" stroke="#ffffff" strokeOpacity=".12" />
                <rect x="36" y="84" width="40" height="7" rx="3.5" fill="#74d6cf" fillOpacity=".55" />
                <rect x="36" y="100" width="88" height="6" rx="3" fill="#ffffff" fillOpacity=".18" />
                <rect x="36" y="113" width="64" height="6" rx="3" fill="#ffffff" fillOpacity=".1" />
                {/* Mini bar chart */}
                <rect x="120" y="109" width="8" height="22" rx="3" fill="#0e6e6e" fillOpacity=".8" />
                <rect x="132" y="100" width="8" height="31" rx="3" fill="url(#sg-gold)" />
                <rect x="144" y="104" width="8" height="27" rx="3" fill="#0e6e6e" fillOpacity=".6" />
              </motion.g>

              {/* Floating feature card: Quote */}
              <motion.g animate={{ y: [0, 7, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}>
                <rect x="292" y="52" width="148" height="82" rx="16" fill="url(#sg-glass)" stroke="#ffffff" strokeOpacity=".12" />
                <rect x="308" y="68" width="40" height="7" rx="3.5" fill="#caa463" fillOpacity=".65" />
                <rect x="308" y="84" width="100" height="6" rx="3" fill="#ffffff" fillOpacity=".18" />
                <rect x="308" y="97" width="76" height="6" rx="3" fill="#ffffff" fillOpacity=".1" />
                <rect x="308" y="110" width="52" height="6" rx="3" fill="#ffffff" fillOpacity=".08" />
                <rect x="376" y="103" width="48" height="18" rx="6" fill="url(#sg-gold)" />
                <rect x="388" y="108" width="24" height="8" rx="4" fill="#241b07" fillOpacity=".5" />
              </motion.g>

              {/* Floating feature card: Invoice */}
              <motion.g animate={{ y: [0, -6, 0] }} transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 1.1 }}>
                <rect x="292" y="204" width="148" height="82" rx="16" fill="url(#sg-glass)" stroke="#ffffff" strokeOpacity=".12" />
                <rect x="308" y="220" width="56" height="7" rx="3.5" fill="#74d6cf" fillOpacity=".5" />
                <rect x="308" y="236" width="100" height="6" rx="3" fill="#ffffff" fillOpacity=".15" />
                <rect x="308" y="249" width="80" height="6" rx="3" fill="#ffffff" fillOpacity=".1" />
                <rect x="308" y="262" width="60" height="6" rx="3" fill="#ffffff" fillOpacity=".07" />
                {/* PDF icon */}
                <rect x="394" y="216" width="30" height="38" rx="5" fill="#0e6e6e" fillOpacity=".5" stroke="#74d6cf" strokeOpacity=".3" strokeWidth="1" />
                <rect x="399" y="228" width="20" height="3" rx="1.5" fill="#74d6cf" fillOpacity=".7" />
                <rect x="399" y="235" width="16" height="3" rx="1.5" fill="#74d6cf" fillOpacity=".5" />
                <rect x="399" y="242" width="20" height="3" rx="1.5" fill="#74d6cf" fillOpacity=".4" />
              </motion.g>

              {/* Floating feature card: Storefront */}
              <motion.g animate={{ y: [0, 6, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}>
                <rect x="20" y="190" width="148" height="82" rx="16" fill="url(#sg-glass)" stroke="#ffffff" strokeOpacity=".12" />
                <rect x="36" y="206" width="56" height="7" rx="3.5" fill="#caa463" fillOpacity=".55" />
                <rect x="36" y="222" width="88" height="6" rx="3" fill="#ffffff" fillOpacity=".15" />
                <rect x="36" y="235" width="64" height="6" rx="3" fill="#ffffff" fillOpacity=".1" />
                {/* Globe icon dots */}
                <circle cx="140" cy="238" r="14" fill="rgba(14,110,110,0.3)" stroke="#74d6cf" strokeOpacity=".3" strokeWidth="1" />
                <path d="M126 238h28M140 224v28M130 230a16 8 0 0120 0M130 246a16 8 0 0020 0" stroke="#74d6cf" strokeOpacity=".5" strokeWidth="1" />
              </motion.g>

              {/* Connector lines */}
              <line x1="168" y1="148" x2="168" y2="116" stroke="#74d6cf" strokeOpacity=".1" strokeWidth="1" strokeDasharray="3 5" />
              <line x1="292" y1="138" x2="292" y2="108" stroke="#74d6cf" strokeOpacity=".1" strokeWidth="1" strokeDasharray="3 5" />
              <line x1="168" y1="172" x2="168" y2="202" stroke="#74d6cf" strokeOpacity=".1" strokeWidth="1" strokeDasharray="3 5" />
              <line x1="292" y1="172" x2="292" y2="218" stroke="#74d6cf" strokeOpacity=".1" strokeWidth="1" strokeDasharray="3 5" />

              {/* Sparkles */}
              <circle cx="80" cy="40" r="2.5" fill="#caa463" fillOpacity=".7" />
              <circle cx="384" cy="168" r="2" fill="#74d6cf" fillOpacity=".8" />
              <circle cx="60" cy="296" r="2.5" fill="#caa463" fillOpacity=".5" />
              <circle cx="400" cy="316" r="2" fill="#74d6cf" fillOpacity=".6" />
            </svg>
          </div>

          {/* Feature list */}
          <div className={styles.featureList}>
            {FEATURES.map((f) => (
              <div key={f.title} className={styles.featureItem}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <div className={styles.featureText}>
                  <div className={styles.featureTitle}>{f.title}</div>
                  <div className={styles.featureSub}>{f.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Form side (right) ── */}
      <div className={styles.formside}>
        <div className={styles.formwrap}>
          <Link href="/" className={styles.backLink}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to home
          </Link>

          <h1 className={styles.formHeading}>Create account</h1>
          <p className={styles.formSub}>
            Already have an account?{" "}
            <Link href="/login">Sign in</Link>
          </p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className={styles.fieldGroup}>

              {/* Organisation name */}
              <div className={styles.fieldWrap}>
                <label htmlFor="su-org" className={styles.fieldLabel}>Organisation Name</label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <rect x="2" y="6" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                      <path d="M5 6V4.5a3 3 0 016 0V6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                      <rect x="5" y="9" width="6" height="3" rx="1" fill="currentColor" fillOpacity=".4" />
                    </svg>
                  </span>
                  <input
                    id="su-org"
                    type="text"
                    placeholder="e.g. Al-Noor Caterers"
                    className={styles.input}
                    {...register("org_name")}
                  />
                </div>
                {errors.org_name && <span className={styles.fieldError}>{errors.org_name.message}</span>}
              </div>

              {/* Divider */}
              <div className={styles.divider}>
                <div className={styles.dividerLine} />
                <span className={styles.dividerLabel}>Your account</span>
                <div className={styles.dividerLine} />
              </div>

              {/* Owner name */}
              <div className={styles.fieldWrap}>
                <label htmlFor="su-name" className={styles.fieldLabel}>Your Name</label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.4" />
                      <path d="M2.5 13.5c0-2.485 2.462-4.5 5.5-4.5s5.5 2.015 5.5 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                    </svg>
                  </span>
                  <input
                    id="su-name"
                    type="text"
                    placeholder="Mudassir Khan"
                    className={styles.input}
                    autoComplete="name"
                    {...register("owner_name")}
                  />
                </div>
                {errors.owner_name && <span className={styles.fieldError}>{errors.owner_name.message}</span>}
              </div>

              {/* Email */}
              <div className={styles.fieldWrap}>
                <label htmlFor="su-email" className={styles.fieldLabel}>Email</label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <rect x="1.5" y="3.5" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                      <path d="M1.5 5.5L8 9.5L14.5 5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                    </svg>
                  </span>
                  <input
                    id="su-email"
                    type="email"
                    placeholder="you@example.com"
                    className={styles.input}
                    autoComplete="email"
                    {...register("owner_email")}
                  />
                </div>
                {errors.owner_email && <span className={styles.fieldError}>{errors.owner_email.message}</span>}
              </div>

              {/* Password */}
              <div className={styles.fieldWrap}>
                <label htmlFor="su-password" className={styles.fieldLabel}>Password</label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                      <path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                      <circle cx="8" cy="10.5" r="1" fill="currentColor" />
                    </svg>
                  </span>
                  <input
                    id="su-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 8 characters"
                    className={`${styles.input} ${styles.inputPr}`}
                    autoComplete="new-password"
                    {...register("owner_password")}
                  />
                  <button
                    type="button"
                    className={styles.inputToggle}
                    onClick={() => setShowPassword((v) => !v)}
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M2 2l12 12M6.5 6.6A2 2 0 009.4 9.5M4 4.5C2.8 5.4 2 6.6 2 8c0 2.2 2.7 4.5 6 4.5a7.3 7.3 0 002.9-.6M7 3.5c.3 0 .7-.02 1 0C11.3 3.5 14 5.8 14 8c0 .7-.24 1.4-.65 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M2 8c0-2.2 2.7-4.5 6-4.5S14 5.8 14 8s-2.7 4.5-6 4.5S2 10.2 2 8z" stroke="currentColor" strokeWidth="1.4" />
                        <circle cx="8" cy="8" r="1.8" fill="currentColor" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.owner_password && <span className={styles.fieldError}>{errors.owner_password.message}</span>}
              </div>

              {/* Confirm password */}
              <div className={styles.fieldWrap}>
                <label htmlFor="su-confirm" className={styles.fieldLabel}>Confirm Password</label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                      <path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                      <circle cx="8" cy="10.5" r="1" fill="currentColor" />
                    </svg>
                  </span>
                  <input
                    id="su-confirm"
                    type={showConfirm ? "text" : "password"}
                    placeholder="••••••••"
                    className={`${styles.input} ${styles.inputPr}`}
                    autoComplete="new-password"
                    {...register("owner_password_confirm")}
                  />
                  <button
                    type="button"
                    className={styles.inputToggle}
                    onClick={() => setShowConfirm((v) => !v)}
                    tabIndex={-1}
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                  >
                    {showConfirm ? (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M2 2l12 12M6.5 6.6A2 2 0 009.4 9.5M4 4.5C2.8 5.4 2 6.6 2 8c0 2.2 2.7 4.5 6 4.5a7.3 7.3 0 002.9-.6M7 3.5c.3 0 .7-.02 1 0C11.3 3.5 14 5.8 14 8c0 .7-.24 1.4-.65 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M2 8c0-2.2 2.7-4.5 6-4.5S14 5.8 14 8s-2.7 4.5-6 4.5S2 10.2 2 8z" stroke="currentColor" strokeWidth="1.4" />
                        <circle cx="8" cy="8" r="1.8" fill="currentColor" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.owner_password_confirm && <span className={styles.fieldError}>{errors.owner_password_confirm.message}</span>}
              </div>
            </div>

            {errors.root && (
              <div className={styles.rootError}>{errors.root.message}</div>
            )}

            <motion.button
              type="submit"
              className={styles.submitBtn}
              disabled={isSubmitting}
              whileHover={isSubmitting ? {} : { y: -2 }}
              whileTap={isSubmitting ? {} : { scale: 0.98 }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 style={{ width: 16, height: 16, animation: "spin 0.8s linear infinite" }} />
                  Creating account…
                </>
              ) : (
                <>
                  Create account
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </>
              )}
            </motion.button>

            <p className={styles.terms}>
              Want full control over branding &amp; reports?{" "}
              <Link href="/setup" style={{ color: "#74d6cf", textDecoration: "none" }}>Use the setup wizard →</Link>
            </p>
          </form>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
