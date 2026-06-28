"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { Form, FormField } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
} from "lucide-react";
import styles from "./setup.module.css";
import { COLOR_PRESETS } from "@/lib/color-presets";

const setupSchema = z.object({
  org_phone: z.string().optional(),
  org_email: z.string().email().optional().or(z.literal("")),
  org_address: z.string().optional(),
  org_tagline: z.string().optional(),
  primary: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a hex color"),
  on_primary: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  primary_container: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  on_primary_container: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  secondary: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  on_secondary: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  secondary_container: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  on_secondary_container: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  logo_alignment: z.enum(["left", "center", "right"]),
});

type SetupValues = z.infer<typeof setupSchema>;

const STEPS = ["Organisation", "Branding", "Report Preferences"];

const STEP_FIELDS: (keyof SetupValues)[][] = [
  ["org_phone", "org_email", "org_address", "org_tagline"],
  ["primary", "on_primary", "secondary", "on_secondary"],
  ["logo_alignment"],
];

const BRAND_FEATURES = [
  "Lead & customer management",
  "Quotations from your dish catalog",
  "Automated invoice numbering",
  "PDF export for every document",
];

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [activePreset, setActivePreset] = useState<number | null>(0);

  const form = useForm<SetupValues>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      org_phone: "",
      org_email: "",
      org_address: "",
      org_tagline: "",
      primary: COLOR_PRESETS[0].primary,
      on_primary: COLOR_PRESETS[0].on_primary,
      primary_container: COLOR_PRESETS[0].primary_container,
      on_primary_container: COLOR_PRESETS[0].on_primary_container,
      secondary: COLOR_PRESETS[0].secondary,
      on_secondary: COLOR_PRESETS[0].on_secondary,
      secondary_container: COLOR_PRESETS[0].secondary_container,
      on_secondary_container: COLOR_PRESETS[0].on_secondary_container,
      logo_alignment: "left",
    },
  });

  const { register, handleSubmit, formState: { errors }, trigger, setValue, watch, setError } = form;

  const primaryVal = watch("primary");
  const onPrimaryVal = watch("on_primary");
  const secondaryVal = watch("secondary");
  const onSecondaryVal = watch("on_secondary");
  const logoAlignment = watch("logo_alignment");

  function applyPreset(idx: number) {
    const p = COLOR_PRESETS[idx];
    setValue("primary", p.primary);
    setValue("on_primary", p.on_primary);
    setValue("secondary", p.secondary);
    setValue("on_secondary", p.on_secondary);
    setValue("primary_container", p.primary_container);
    setValue("on_primary_container", p.on_primary_container);
    setValue("secondary_container", p.secondary_container);
    setValue("on_secondary_container", p.on_secondary_container);
    setActivePreset(idx);
  }

  async function nextStep() {
    const valid = await trigger(STEP_FIELDS[step]);
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  async function onSubmit(values: SetupValues) {
    setSubmitting(true);
    try {
      await api.patch("/organisation", {
        phone: values.org_phone || null,
        email: values.org_email || null,
        address: values.org_address || null,
        tagline: values.org_tagline || null,
        primary: values.primary,
        on_primary: values.on_primary,
        primary_container: values.primary_container,
        on_primary_container: values.on_primary_container,
        secondary: values.secondary,
        on_secondary: values.on_secondary,
        secondary_container: values.secondary_container,
        on_secondary_container: values.on_secondary_container,
        report_header: { logo_alignment: values.logo_alignment },
        setup_completed: true,
      });
      router.push("/dashboard");
    } catch (err) {
      setError("root", { message: err instanceof Error ? err.message : "Setup failed" });
      setSubmitting(false);
    }
  }

  const progress = ((step + 1) / STEPS.length) * 100;


  return (
    <div className={styles.shell}>
      {/* ── Form side (left) ── */}
      <div className={styles.formside}>
        <div className={styles.formwrap}>

          {/* Top logo */}
          <a href="/" className={styles.topLogo}>
            <Image src="/svg/logo-diamond.svg" width="28" height="28" alt="" aria-hidden />
            <span className={styles.topLogoName}>Ziyafat</span>
          </a>

          {/* Step header */}
          <div className={styles.stepHeader}>
            <div className={styles.stepEyebrow}>Step {step + 1} of {STEPS.length}</div>
            <h1 className={styles.stepName}>{STEPS[step]}</h1>
            <div className={styles.progressTrack}>
              <div className={styles.progressFill} style={{ width: `${progress}%` }} />
            </div>
            <div className={styles.stepDots}>
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    styles.stepDot,
                    i < step && styles.stepDotDone,
                    i === step && styles.stepDotActive,
                  )}
                />
              ))}
            </div>
          </div>

          {/* Form */}
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>

              {/* ── Step 0: Organisation ── */}
              {step === 0 && (
                <div className={styles.fieldGroup}>
                  <div className={styles.fieldWrap}>
                    <label className={styles.fieldLabel}>Business Phone</label>
                    <input className={styles.input} placeholder="+91 9876543210" {...register("org_phone")} />
                  </div>
                  <div className={styles.fieldWrap}>
                    <label className={styles.fieldLabel}>Business Email</label>
                    <input type="email" className={styles.input} placeholder="hello@business.com" {...register("org_email")} />
                    {errors.org_email && <span className={styles.fieldError}>{errors.org_email.message}</span>}
                  </div>
                  <div className={styles.fieldWrap}>
                    <label className={styles.fieldLabel}>Address</label>
                    <input className={styles.input} placeholder="Street, City" {...register("org_address")} />
                  </div>
                  <div className={styles.fieldWrap}>
                    <label className={styles.fieldLabel}>Tagline</label>
                    <input className={styles.input} placeholder="e.g. Authentic Hyderabadi flavours" {...register("org_tagline")} />
                  </div>
                </div>
              )}

              {/* ── Step 1: Branding ── */}
              {step === 1 && (
                <>
                  <p className={styles.brandingIntro}>
                    Choose your brand colours. These appear across the app and on printed documents.
                  </p>

                  {/* Preset swatches — split pill showing primary + secondary */}
                  <div className={styles.swatchRow}>
                    {COLOR_PRESETS.map((preset, idx) => (
                      <button
                        key={preset.name}
                        type="button"
                        title={preset.name}
                        onClick={() => applyPreset(idx)}
                        className={cn(styles.swatch, activePreset === idx && styles.swatchActive)}
                        style={{ overflow: "hidden", padding: 0 }}
                      >
                        <span style={{ display: "block", width: "50%", height: "100%", backgroundColor: preset.primary, float: "left" }} />
                        <span style={{ display: "block", width: "50%", height: "100%", backgroundColor: preset.secondary, float: "left" }} />
                      </button>
                    ))}
                  </div>

                  {/* Color fields — controlled via watch/setValue */}
                  <div className={styles.colorGrid}>
                    {(
                      [
                        { name: "primary" as const, label: "Primary", val: primaryVal, setter: (v: string) => { setValue("primary", v); setActivePreset(null); } },
                        { name: "on_primary" as const, label: "On Primary", val: onPrimaryVal, setter: (v: string) => { setValue("on_primary", v); setActivePreset(null); } },
                        { name: "secondary" as const, label: "Secondary", val: secondaryVal, setter: (v: string) => { setValue("secondary", v); setActivePreset(null); } },
                        { name: "on_secondary" as const, label: "On Secondary", val: onSecondaryVal, setter: (v: string) => { setValue("on_secondary", v); setActivePreset(null); } },
                      ]
                    ).map(({ name, label, val, setter }) => (
                      <FormField
                        key={name}
                        control={form.control}
                        name={name}
                        render={() => (
                          <div className={styles.colorField}>
                            <label className={styles.fieldLabel}>{label}</label>
                            <div className={styles.colorPicker}>
                              <input
                                type="color"
                                value={val}
                                onChange={(e) => setter(e.target.value)}
                                className={styles.colorSwatch}
                              />
                              <input
                                type="text"
                                value={val}
                                onChange={(e) => setter(e.target.value)}
                                className={styles.colorHex}
                                maxLength={7}
                              />
                            </div>
                            {errors[name] && <span className={styles.fieldError}>{errors[name]?.message}</span>}
                          </div>
                        )}
                      />
                    ))}
                  </div>

                  {/* Preview */}
                  <div className={styles.colorPreviewRow}>
                    <div
                      className={styles.colorPreview}
                      style={{ backgroundColor: primaryVal, color: onPrimaryVal }}
                    >
                      Primary
                    </div>
                    <div
                      className={styles.colorPreview}
                      style={{ backgroundColor: secondaryVal, color: onSecondaryVal }}
                    >
                      Secondary
                    </div>
                  </div>
                </>
              )}

              {/* ── Step 2: Report Preferences ── */}
              {step === 2 && (
                <>
                  <p className={styles.brandingIntro}>
                    Choose how your logo is aligned in printed reports and PDF documents.
                  </p>
                  <div className={styles.radioGroup}>
                    {(["left", "center", "right"] as const).map((v) => (
                      <label
                        key={v}
                        className={cn(styles.radioOption, logoAlignment === v && styles.radioOptionActive)}
                        onClick={() => setValue("logo_alignment", v)}
                      >
                        <div className={cn(styles.radioIndicator, logoAlignment === v && styles.radioIndicatorActive)} />
                        <input type="radio" value={v} {...register("logo_alignment")} style={{ display: "none" }} />
                        <span className={styles.radioLabel}>{v}</span>
                      </label>
                    ))}
                  </div>
                </>
              )}

              {/* Root error */}
              {errors.root && (
                <div className={styles.rootError}>{errors.root.message}</div>
              )}

              {/* Navigation */}
              <div className={styles.navRow}>
                {step > 0 && (
                  <button type="button" className={styles.btnBack} onClick={() => setStep((s) => s - 1)}>
                    <ArrowLeft style={{ width: 16, height: 16 }} />
                    Back
                  </button>
                )}
                {step < STEPS.length - 1 ? (
                  <motion.button
                    type="button"
                    className={styles.btnNext}
                    onClick={nextStep}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Next
                    <ArrowRight style={{ width: 16, height: 16 }} />
                  </motion.button>
                ) : (
                  <motion.button
                    type="submit"
                    className={styles.btnNext}
                    disabled={submitting}
                    whileHover={submitting ? {} : { y: -1 }}
                    whileTap={submitting ? {} : { scale: 0.98 }}
                  >
                    {submitting ? (
                      <>
                        <Loader2 style={{ width: 16, height: 16, animation: "spin 0.8s linear infinite" }} />
                        Setting up…
                      </>
                    ) : (
                      <>
                        <Check style={{ width: 16, height: 16 }} />
                        Complete Setup
                      </>
                    )}
                  </motion.button>
                )}
              </div>

              {/* Skip */}
              <div className={styles.skipRow}>
                <a href="/login" className={styles.skipLink}>
                  Skip for now — I&apos;ll configure this later
                  <ArrowRight style={{ width: 13, height: 13 }} />
                </a>
              </div>
            </form>
          </Form>
        </div>
      </div>

      {/* ── Brand side (right) ── */}
      <div className={styles.brandside}>
        <div className={styles.g1} />
        <div className={styles.g2} />
        <div className={styles.dots} />

        <a href="/" className={styles.brandLogo}>
          <img src="/svg/logo-diamond.svg" width="28" height="28" alt="" aria-hidden />
          <span className={styles.brandLogoName}>Ziyafat</span>
        </a>

        <div className={styles.brandMiddle}>
          <div className={styles.brandEyebrow}>
            <span className={styles.brandEyebrowDot} />
            Getting started
          </div>

          <h2 className={styles.brandHeading}>
            Your catering business, <em>beautifully organised.</em>
          </h2>

          {/* Illustration */}
          <div className={styles.svgWrap}>
            <svg viewBox="0 0 460 320" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", maxWidth: 460, display: "block", overflow: "visible" }}>
              <defs>
                <linearGradient id="sp-teal" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#0e6e6e" />
                  <stop offset="1" stopColor="#072e2e" />
                </linearGradient>
                <linearGradient id="sp-gold" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#e6cf9c" />
                  <stop offset="1" stopColor="#caa463" />
                </linearGradient>
                <linearGradient id="sp-glass" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#ffffff" stopOpacity=".12" />
                  <stop offset="1" stopColor="#ffffff" stopOpacity=".03" />
                </linearGradient>
              </defs>

              {/* Dashed orbit rings */}
              <circle cx="230" cy="160" r="110" stroke="#74d6cf" strokeOpacity=".12" strokeWidth="1.5" strokeDasharray="3 9" />
              <circle cx="230" cy="160" r="76" stroke="#caa463" strokeOpacity=".15" strokeWidth="1.5" strokeDasharray="2 8" />

              {/* Central diamond logo */}
              <rect x="214" y="144" width="32" height="32" rx="4" transform="rotate(45 230 160)" fill="url(#sp-teal)" stroke="#74d6cf" strokeOpacity=".5" strokeWidth="1.5" />
              <rect x="222" y="152" width="16" height="16" rx="2" transform="rotate(45 230 160)" fill="url(#sp-gold)" />

              {/* Floating step card: Org */}
              <motion.g animate={{ y: [0, -6, 0] }} transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}>
                <rect x="28" y="60" width="118" height="68" rx="14" fill="url(#sp-glass)" stroke="#ffffff" strokeOpacity=".12" />
                <rect x="44" y="76" width="36" height="7" rx="3.5" fill="#74d6cf" fillOpacity=".6" />
                <rect x="44" y="90" width="60" height="6" rx="3" fill="#ffffff" fillOpacity=".18" />
                <rect x="44" y="103" width="46" height="6" rx="3" fill="#ffffff" fillOpacity=".12" />
                <circle cx="118" cy="76" r="8" fill="url(#sp-gold)" />
                <path d="M114 76l2.5 2.5 5-5" stroke="#241b07" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </motion.g>

              {/* Floating step card: Branding */}
              <motion.g animate={{ y: [0, 7, 0] }} transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}>
                <rect x="314" y="44" width="118" height="68" rx="14" fill="url(#sp-glass)" stroke="#ffffff" strokeOpacity=".12" />
                <rect x="330" y="60" width="36" height="7" rx="3.5" fill="#caa463" fillOpacity=".7" />
                <rect x="330" y="74" width="60" height="6" rx="3" fill="#ffffff" fillOpacity=".18" />
                <rect x="330" y="87" width="40" height="6" rx="3" fill="#ffffff" fillOpacity=".12" />
                <circle cx="408" cy="60" r="8" fill="url(#sp-gold)" />
                <path d="M404 60l2.5 2.5 5-5" stroke="#241b07" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </motion.g>

              {/* Floating step card: Report */}
              <motion.g animate={{ y: [0, -5, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}>
                <rect x="314" y="210" width="118" height="68" rx="14" fill="url(#sp-glass)" stroke="#ffffff" strokeOpacity=".12" />
                <rect x="330" y="226" width="36" height="7" rx="3.5" fill="#74d6cf" fillOpacity=".5" />
                <rect x="330" y="240" width="60" height="6" rx="3" fill="#ffffff" fillOpacity=".18" />
                <rect x="330" y="253" width="50" height="6" rx="3" fill="#ffffff" fillOpacity=".12" />
                <circle cx="408" cy="226" r="8" fill="url(#sp-gold)" />
                <path d="M404 226l2.5 2.5 5-5" stroke="#241b07" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </motion.g>

              {/* Floating step card: Account */}
              <motion.g animate={{ y: [0, 6, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}>
                <rect x="28" y="194" width="118" height="68" rx="14" fill="url(#sp-glass)" stroke="#ffffff" strokeOpacity=".12" />
                <rect x="44" y="210" width="36" height="7" rx="3.5" fill="#caa463" fillOpacity=".6" />
                <rect x="44" y="224" width="60" height="6" rx="3" fill="#ffffff" fillOpacity=".18" />
                <rect x="44" y="237" width="44" height="6" rx="3" fill="#ffffff" fillOpacity=".12" />
                <circle cx="118" cy="210" r="8" fill="url(#sp-gold)" />
                <path d="M114 210l2.5 2.5 5-5" stroke="#241b07" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </motion.g>

              {/* Connector lines from center diamond to cards */}
              <line x1="170" y1="160" x2="146" y2="120" stroke="#74d6cf" strokeOpacity=".15" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="290" y1="148" x2="314" y2="100" stroke="#74d6cf" strokeOpacity=".15" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="290" y1="172" x2="314" y2="230" stroke="#74d6cf" strokeOpacity=".15" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="170" y1="172" x2="146" y2="220" stroke="#74d6cf" strokeOpacity=".15" strokeWidth="1" strokeDasharray="4 4" />

              {/* Sparkles */}
              <circle cx="200" cy="50" r="2.5" fill="#caa463" fillOpacity=".7" />
              <circle cx="370" cy="170" r="2" fill="#74d6cf" fillOpacity=".8" />
              <circle cx="80" cy="290" r="2.5" fill="#caa463" fillOpacity=".6" />
            </svg>
          </div>

          {/* Feature checklist */}
          <div className={styles.featureList}>
            {BRAND_FEATURES.map((f) => (
              <div key={f} className={styles.featureItem}>
                <span className={styles.featureCheck}>✓</span>
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
