"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { useLogin } from "@/lib/auth";
import { api } from "@/lib/api";
import { AuthField } from "@/components/auth/AuthField";
import styles from "./login.module.css";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginValues = z.infer<typeof loginSchema>;

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1.5" y="3.5" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M1.5 5.5L8 9.5L14.5 5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="8" cy="10.5" r="1" fill="currentColor" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const login = useLogin();

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function loginAsGuest() {
    setValue("email", "guest@albaraka.in");
    setValue("password", "Password@1234");
    try {
      await login.mutateAsync({ email: "guest@albaraka.in", password: "Password@1234" });
      const org = await api.get<{ setup_completed: boolean }>("/organisation");
      router.push(org.setup_completed ? "/dashboard" : "/setup");
    } catch (err) {
      setError("root", {
        message: err instanceof Error ? err.message : "Login failed",
      });
    }
  }

  async function onSubmit(values: LoginValues) {
    try {
      await login.mutateAsync(values);
      const org = await api.get<{ setup_completed: boolean }>("/organisation");
      router.push(org.setup_completed ? "/dashboard" : "/setup");
    } catch (err) {
      setError("root", {
        message: err instanceof Error ? err.message : "Login failed",
      });
    }
  }

  const isPending = login.isPending || isSubmitting;

  return (
    <div className={styles.shell}>
      {/* ── Brand side ── */}
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
            Welcome back
          </div>

          <h2 className={styles.brandHeading}>
            Every service, <em>perfectly in sync.</em>
          </h2>

          <div className={styles.svgWrap}>
            <svg
              viewBox="0 0 460 360"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ width: "100%", maxWidth: 460, display: "block", overflow: "visible" }}
            >
              <defs>
                <linearGradient id="lp-teal" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#0e6e6e" />
                  <stop offset="1" stopColor="#072e2e" />
                </linearGradient>
                <linearGradient id="lp-gold" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#e6cf9c" />
                  <stop offset="1" stopColor="#caa463" />
                </linearGradient>
                <linearGradient id="lp-glass" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#ffffff" stopOpacity=".12" />
                  <stop offset="1" stopColor="#ffffff" stopOpacity=".03" />
                </linearGradient>
              </defs>
              <circle cx="230" cy="196" r="128" stroke="#74d6cf" strokeOpacity=".18" strokeWidth="1.5" strokeDasharray="3 8" />
              <circle cx="230" cy="196" r="96" stroke="#caa463" strokeOpacity=".22" strokeWidth="1.5" strokeDasharray="2 9" />
              <motion.path d="M212 120c-6-7 6-13 0-20" stroke="#74d6cf" strokeWidth="3" strokeLinecap="round" strokeOpacity=".7" animate={{ opacity: [0, 0.9, 0], y: [4, 0, -12] }} transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }} />
              <motion.path d="M230 114c-6-7 6-13 0-20" stroke="#74d6cf" strokeWidth="3" strokeLinecap="round" strokeOpacity=".7" animate={{ opacity: [0, 0.9, 0], y: [4, 0, -12] }} transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} />
              <motion.path d="M248 120c-6-7 6-13 0-20" stroke="#74d6cf" strokeWidth="3" strokeLinecap="round" strokeOpacity=".7" animate={{ opacity: [0, 0.9, 0], y: [4, 0, -12] }} transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 1 }} />
              <ellipse cx="230" cy="232" rx="96" ry="20" fill="#04100f" />
              <path d="M146 230a84 64 0 01168 0z" fill="url(#lp-teal)" stroke="#74d6cf" strokeOpacity=".5" strokeWidth="1.5" />
              <path d="M168 214a62 44 0 01124 0" stroke="#ffffff" strokeOpacity=".18" strokeWidth="2" fill="none" />
              <rect x="150" y="228" width="160" height="12" rx="6" fill="url(#lp-gold)" />
              <circle cx="230" cy="150" r="8" fill="url(#lp-gold)" />
              <motion.g animate={{ y: [0, -7, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>
                <rect x="40" y="70" width="132" height="96" rx="16" fill="url(#lp-glass)" stroke="#ffffff" strokeOpacity=".14" />
                <rect x="56" y="86" width="58" height="8" rx="4" fill="#74d6cf" fillOpacity=".5" />
                <rect x="56" y="132" width="15" height="20" rx="3" fill="#0e6e6e" />
                <rect x="77" y="120" width="15" height="32" rx="3" fill="#0e6e6e" />
                <rect x="98" y="108" width="15" height="44" rx="3" fill="url(#lp-gold)" />
                <rect x="119" y="124" width="15" height="28" rx="3" fill="#0e6e6e" />
                <rect x="140" y="116" width="15" height="36" rx="3" fill="#0e6e6e" />
              </motion.g>
              <motion.g animate={{ y: [0, 6, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}>
                <rect x="296" y="64" width="126" height="54" rx="14" fill="url(#lp-glass)" stroke="#ffffff" strokeOpacity=".14" />
                <rect x="310" y="78" width="26" height="26" rx="8" fill="#0e6e6e" />
                <path d="M317 91l4 4 7-8" stroke="#74d6cf" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="346" y="80" width="60" height="8" rx="4" fill="#ffffff" fillOpacity=".5" />
                <rect x="346" y="94" width="40" height="7" rx="3.5" fill="#ffffff" fillOpacity=".22" />
              </motion.g>
              <motion.g animate={{ y: [0, -7, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}>
                <rect x="300" y="244" width="118" height="58" rx="14" fill="url(#lp-glass)" stroke="#ffffff" strokeOpacity=".14" />
                <circle cx="326" cy="273" r="15" fill="#caa463" fillOpacity=".18" />
                <path d="M326 264l3 6 6 .8-4.4 4.3 1 6.1-5.6-3-5.6 3 1-6.1-4.4-4.3 6-.8z" fill="url(#lp-gold)" />
                <rect x="350" y="262" width="54" height="9" rx="4.5" fill="#e6cf9c" fillOpacity=".85" />
                <rect x="350" y="278" width="36" height="7" rx="3.5" fill="#ffffff" fillOpacity=".22" />
              </motion.g>
              <circle cx="96" cy="212" r="3" fill="#caa463" />
              <circle cx="360" cy="170" r="2.5" fill="#74d6cf" />
              <circle cx="150" cy="300" r="2.5" fill="#caa463" />
            </svg>
          </div>

          <div className={styles.testimonial}>
            <div className={styles.stars}>★★★★★</div>
            <p className={styles.quoteText}>
              &ldquo;We replaced five separate tools with Ziyafat — and our managers got their evenings back.&rdquo;
            </p>
            <div className={styles.quoteAuthor}>
              <div className={styles.avatar}>RA</div>
              <div>
                <div className={styles.authorName}>Rana Aziz</div>
                <div className={styles.authorRole}>Group GM · Qasr Banquets</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Form side ── */}
      <div className={styles.formside}>
        <div className={styles.formwrap}>
          <Link href="/" className={styles.backLink}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to home
          </Link>

          <h1 className={styles.formHeading}>Sign in</h1>
          <p className={styles.formSub}>
            New to Ziyafat?{" "}
            <Link href="/signup">Create an account</Link>
          </p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className={styles.fieldGroup}>
              <AuthField
                id="login-email"
                label="Email"
                icon={<MailIcon />}
                error={errors.email?.message}
                inputProps={{ type: "email", placeholder: "you@example.com", autoComplete: "email", ...register("email") }}
              />
              <AuthField
                id="login-password"
                label="Password"
                icon={<LockIcon />}
                showToggle
                error={errors.password?.message}
                inputProps={{ placeholder: "••••••••", autoComplete: "current-password", ...register("password") }}
              />
            </div>

            <div className={styles.rememberRow}>
              <label className={styles.rememberLabel}>
                <input type="checkbox" className={styles.checkbox} />
                Remember me
              </label>
              <a href="#" className={styles.forgotLink}>Forgot password?</a>
            </div>

            {errors.root && (
              <div className={styles.rootError}>{errors.root.message}</div>
            )}

            <motion.button
              type="submit"
              className={styles.submitBtn}
              disabled={isPending}
              whileHover={isPending ? {} : { y: -2 }}
              whileTap={isPending ? {} : { scale: 0.98 }}
            >
              {isPending ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ animation: "spin 0.8s linear infinite" }}>
                    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.8" strokeOpacity=".3" />
                    <path d="M8 2a6 6 0 016 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </>
              )}
            </motion.button>

            <div className={styles.divider}>
              <span>or</span>
            </div>

            <motion.button
              type="button"
              className={styles.guestBtn}
              disabled={isPending}
              onClick={loginAsGuest}
              whileHover={isPending ? {} : { y: -2 }}
              whileTap={isPending ? {} : { scale: 0.98 }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5" />
                <path d="M2 13c0-2.21 2.686-4 6-4s6 1.79 6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Continue as Guest
            </motion.button>
            <p className={styles.guestNote}>
              Explore the full platform with our demo account — no sign-up required.
            </p>
          </form>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
