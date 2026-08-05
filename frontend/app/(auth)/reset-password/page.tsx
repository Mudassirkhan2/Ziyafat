"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { useResetPassword } from "@/lib/auth";
import { AuthField } from "@/components/auth/AuthField";
import styles from "./reset-password.module.css";

const schema = z
  .object({
    new_password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z.string(),
  })
  .refine((d) => d.new_password === d.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });

type FormValues = z.infer<typeof schema>;

function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="8" cy="10.5" r="1" fill="currentColor" />
    </svg>
  );
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [done, setDone] = useState(false);
  const resetPassword = useResetPassword();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { new_password: "", confirm_password: "" },
  });

  async function onSubmit(values: FormValues) {
    try {
      await resetPassword.mutateAsync({ token: token!, new_password: values.new_password });
      setDone(true);
    } catch (err) {
      setError("root", {
        message: err instanceof Error ? err.message : "Something went wrong. Please try again.",
      });
    }
  }

  const isPending = resetPassword.isPending || isSubmitting;

  if (!token) {
    return (
      <div className={styles.shell}>
        <div className={styles.g1} />
        <div className={styles.g2} />
        <div className={styles.card}>
          <a href="/" className={styles.logoRow}>
            <Image src="/svg/logo-mark.svg" width="28" height="28" alt="Ziyafat" />
            <span className={styles.logoName}>Ziyafat</span>
          </a>
          <div className={styles.invalidBox}>
            <div className={styles.invalidIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            <h1 className={styles.invalidHeading}>Invalid link</h1>
            <p className={styles.invalidText}>
              This reset link is missing or malformed. Request a new one from the login page.
            </p>
            <Link href="/forgot-password" className={styles.actionLink}>
              Request a new link
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.shell}>
      <div className={styles.g1} />
      <div className={styles.g2} />

      <div className={styles.card}>
        <a href="/" className={styles.logoRow}>
          <Image src="/svg/logo-mark.svg" width="28" height="28" alt="Ziyafat" />
          <span className={styles.logoName}>Ziyafat</span>
        </a>

        {done ? (
          <div className={styles.successBox}>
            <div className={styles.successIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className={styles.successHeading}>Password updated</h1>
            <p className={styles.successText}>
              Your password has been reset. You can now sign in with your new password.
            </p>
            <Link href="/login" className={styles.actionLink}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Sign in
            </Link>
          </div>
        ) : (
          <>
            <h1 className={styles.heading}>Set new password</h1>
            <p className={styles.sub}>Choose a strong password for your account.</p>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className={styles.fieldGroup}>
                <AuthField
                  id="reset-new-password"
                  label="New password"
                  icon={<LockIcon />}
                  showToggle
                  error={errors.new_password?.message}
                  inputProps={{
                    placeholder: "Min. 8 characters",
                    autoComplete: "new-password",
                    ...register("new_password"),
                  }}
                />
                <AuthField
                  id="reset-confirm-password"
                  label="Confirm password"
                  icon={<LockIcon />}
                  showToggle
                  error={errors.confirm_password?.message}
                  inputProps={{
                    placeholder: "Repeat your password",
                    autoComplete: "new-password",
                    ...register("confirm_password"),
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
                    Saving…
                  </>
                ) : (
                  "Set new password"
                )}
              </motion.button>
            </form>
          </>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
