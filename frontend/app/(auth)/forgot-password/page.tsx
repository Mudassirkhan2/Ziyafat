"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { useForgotPassword } from "@/lib/auth";
import { AuthField } from "@/components/auth/AuthField";
import styles from "./forgot-password.module.css";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
});

type FormValues = z.infer<typeof schema>;

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1.5" y="3.5" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M1.5 5.5L8 9.5L14.5 5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const forgotPassword = useForgotPassword();

  const {
    register,
    handleSubmit,
    setError,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: FormValues) {
    try {
      await forgotPassword.mutateAsync(values.email);
      setSent(true);
    } catch (err) {
      setError("root", {
        message: err instanceof Error ? err.message : "Something went wrong. Please try again.",
      });
    }
  }

  const isPending = forgotPassword.isPending || isSubmitting;

  return (
    <div className={styles.shell}>
      <div className={styles.g1} />
      <div className={styles.g2} />

      <div className={styles.card}>
        <a href="/" className={styles.logoRow}>
          <Image src="/svg/logo-mark.svg" width="28" height="28" alt="Ziyafat" />
          <span className={styles.logoName}>Ziyafat</span>
        </a>

        {sent ? (
          <div className={styles.successBox}>
            <div className={styles.successIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className={styles.successHeading}>Check your inbox</h1>
            <p className={styles.successText}>
              If <strong>{getValues("email")}</strong> is registered, you'll receive a reset link
              within a few minutes. Check your spam folder if it doesn't arrive.
            </p>
            <Link href="/login" className={styles.successLink}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <h1 className={styles.heading}>Forgot password?</h1>
            <p className={styles.sub}>
              Enter your email and we'll send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className={styles.fieldGroup}>
                <AuthField
                  id="forgot-email"
                  label="Email"
                  icon={<MailIcon />}
                  error={errors.email?.message}
                  inputProps={{
                    type: "email",
                    placeholder: "you@example.com",
                    autoComplete: "email",
                    ...register("email"),
                  }}
                />
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
                    Sending…
                  </>
                ) : (
                  "Send reset link"
                )}
              </motion.button>

              <div className={styles.backRow}>
                <Link href="/login" className={styles.backLink}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Back to sign in
                </Link>
              </div>
            </form>
          </>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
