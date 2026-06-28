"use client";

import { useEffect, useRef, useState } from "react";
import { useOrg, useUpdateOrg, useUploadOrgLogo, useUploadOrgBanner } from "@/lib/organisation-api";
import { toast } from "sonner";
import { applyOrgTheme } from "@/lib/dls/tokens";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { COLOR_PRESETS } from "@/lib/color-presets";
import type { Organisation } from "@/lib/types";

type ColorFields = Pick<Organisation,
  "primary" | "on_primary" | "primary_container" | "on_primary_container" |
  "secondary" | "on_secondary" | "secondary_container" | "on_secondary_container"
>;

type ReportHeaderFields = {
  logo_alignment: "left" | "center" | "right";
  show_address: boolean;
  show_phone: boolean;
  show_email: boolean;
  show_tagline: boolean;
};

export default function BrandingSettingsPage() {
  const { data: org, isLoading } = useOrg();
  const updateOrg = useUpdateOrg();
  const uploadLogo = useUploadOrgLogo();
  const uploadBanner = useUploadOrgBanner();

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [colors, setColors] = useState<ColorFields>({
    primary: COLOR_PRESETS[0].primary, on_primary: COLOR_PRESETS[0].on_primary,
    primary_container: COLOR_PRESETS[0].primary_container, on_primary_container: COLOR_PRESETS[0].on_primary_container,
    secondary: COLOR_PRESETS[0].secondary, on_secondary: COLOR_PRESETS[0].on_secondary,
    secondary_container: COLOR_PRESETS[0].secondary_container, on_secondary_container: COLOR_PRESETS[0].on_secondary_container,
  });
  const [activePreset, setActivePreset] = useState<number | null>(null);

  const [reportHeader, setReportHeader] = useState<ReportHeaderFields>({
    logo_alignment: "left",
    show_address: true, show_phone: true, show_email: true, show_tagline: false,
  });

  const [pendingSection, setPendingSection] = useState<"colors" | "header" | null>(null);

  useEffect(() => {
    if (org) {
      setColors({
        primary: org.primary, on_primary: org.on_primary,
        primary_container: org.primary_container, on_primary_container: org.on_primary_container,
        secondary: org.secondary, on_secondary: org.on_secondary,
        secondary_container: org.secondary_container, on_secondary_container: org.on_secondary_container,
      });
      setActivePreset(null);
      setReportHeader({ ...org.report_header });
    }
  }, [org]);

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      uploadLogo.mutate(file, {
        onSuccess: () => toast.success("Logo uploaded."),
        onError: () => toast.error("Logo upload failed. Try again."),
      });
      e.target.value = "";
    }
  }

  function handleBannerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      uploadBanner.mutate(file, {
        onSuccess: () => toast.success("Banner uploaded."),
        onError: () => toast.error("Banner upload failed. Try again."),
      });
      e.target.value = "";
    }
  }

  function applyPreset(idx: number) {
    const p = COLOR_PRESETS[idx];
    setColors({
      primary: p.primary, on_primary: p.on_primary,
      primary_container: p.primary_container, on_primary_container: p.on_primary_container,
      secondary: p.secondary, on_secondary: p.on_secondary,
      secondary_container: p.secondary_container, on_secondary_container: p.on_secondary_container,
    });
    setActivePreset(idx);
    applyOrgTheme(p);
  }

  function handleSaveColors() {
    setPendingSection("colors");
    updateOrg.mutate({ ...colors }, {
      onSuccess: () => toast.success("Brand colors saved."),
      onError: () => toast.error("Failed to save colors. Try again."),
      onSettled: () => setPendingSection(null),
    });
  }

  function handleSaveReportHeader() {
    setPendingSection("header");
    updateOrg.mutate({ report_header: reportHeader }, {
      onSuccess: () => toast.success("Report header saved."),
      onError: () => toast.error("Failed to save report header. Try again."),
      onSettled: () => setPendingSection(null),
    });
  }

  if (isLoading) return <p className="text-on-surface-medium">Loading…</p>;

  return (
    <div className="space-y-8">
      {/* Logo */}
      <section className="rounded-lg border border-outline p-4 space-y-3">
        <div>
          <h2 className="text-base font-semibold text-on-surface">Company Logo</h2>
          <p className="text-sm text-on-surface-medium mt-0.5">
            Appears in the app sidebar and on all printed PDF documents. Upload a PNG or SVG with a
            transparent background for best results.
          </p>
          <p className="text-xs text-on-surface-low mt-1">
            Recommended size: <strong>400 × 120 px</strong> (horizontal) or <strong>200 × 200 px</strong> (square) · Max 2 MB
          </p>
        </div>
        {org?.logo_url && (
          <img src={org.logo_url} alt="Logo" className="h-12 object-contain rounded" />
        )}
        <input ref={logoInputRef} type="file" accept="image/png,image/svg+xml,image/jpeg,image/webp" className="hidden" onChange={handleLogoChange} />
        <Button variant="outline" onClick={() => logoInputRef.current?.click()} disabled={uploadLogo.isPending}>
          {uploadLogo.isPending ? "Uploading…" : "Upload Logo"}
        </Button>
      </section>

      {/* Banner */}
      <section className="rounded-lg border border-outline p-4 space-y-3">
        <div>
          <h2 className="text-base font-semibold text-on-surface">Banner Image</h2>
          <p className="text-sm text-on-surface-medium mt-0.5">
            Used as a wide header image in PDF quotations and invoices. Gives your documents a professional, branded look.
          </p>
          <p className="text-xs text-on-surface-low mt-1">
            Recommended size: <strong>1200 × 300 px</strong> · JPEG or PNG · Max 5 MB
          </p>
        </div>
        {org?.banner_url && (
          <img src={org.banner_url} alt="Banner" className="h-24 w-full object-cover rounded" />
        )}
        <input ref={bannerInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleBannerChange} />
        <Button variant="outline" onClick={() => bannerInputRef.current?.click()} disabled={uploadBanner.isPending}>
          {uploadBanner.isPending ? "Uploading…" : "Upload Banner"}
        </Button>
      </section>

      {/* DLS Colors */}
      <section className="rounded-lg border border-outline p-4 space-y-4">
        <div>
          <h2 className="text-base font-semibold text-on-surface">Brand Colors</h2>
          <p className="text-sm text-on-surface-medium mt-0.5">
            Pick a preset or fine-tune individual colors below. Each preset pairs a distinct <strong>Primary</strong> and <strong>Secondary</strong> color — they appear on buttons, badges, and printed documents.
          </p>
        </div>

        {/* Preset swatches */}
        <div>
          <p className="text-xs text-on-surface-low mb-2 font-medium uppercase tracking-wide">Quick presets</p>
          <div className="flex flex-wrap gap-2">
            {COLOR_PRESETS.map((preset, idx) => (
              <button
                key={preset.name}
                type="button"
                title={preset.name}
                onClick={() => applyPreset(idx)}
                className={cn(
                  "h-7 w-10 rounded-lg border-2 overflow-hidden transition-all",
                  activePreset === idx
                    ? "border-primary shadow-[0_0_0_3px_rgba(var(--primary-rgb),0.3)]"
                    : "border-transparent hover:scale-110"
                )}
                style={{ padding: 0 }}
              >
                <span style={{ display: "block", width: "50%", height: "100%", backgroundColor: preset.primary, float: "left" }} />
                <span style={{ display: "block", width: "50%", height: "100%", backgroundColor: preset.secondary, float: "left" }} />
              </button>
            ))}
          </div>
          {activePreset !== null && (
            <p className="text-xs text-on-surface-medium mt-1.5">{COLOR_PRESETS[activePreset].name}</p>
          )}
        </div>

        {/* Color preview */}
        <div className="flex gap-2">
          <div
            className="flex-1 rounded-lg px-4 py-3 text-sm font-semibold text-center"
            style={{ backgroundColor: colors.primary, color: colors.on_primary }}
          >
            Primary
          </div>
          <div
            className="flex-1 rounded-lg px-4 py-3 text-sm font-semibold text-center"
            style={{ backgroundColor: colors.secondary, color: colors.on_secondary }}
          >
            Secondary
          </div>
        </div>

        {/* Fine-tune pickers */}
        <details className="group">
          <summary className="text-xs text-on-surface-low cursor-pointer select-none hover:text-on-surface-medium transition-colors">
            Fine-tune individual colors
          </summary>
          <div className="grid grid-cols-2 gap-4 mt-3">
            {(Object.keys(colors) as (keyof ColorFields)[]).map((key) => (
              <div key={key} className="flex items-center gap-3">
                <input
                  type="color"
                  value={colors[key]}
                  onChange={(e) => { setColors((prev) => ({ ...prev, [key]: e.target.value })); setActivePreset(null); }}
                  className="w-10 h-10 rounded cursor-pointer border border-outline"
                />
                <div>
                  <p className="text-xs text-on-surface font-medium">{key.replace(/_/g, " ")}</p>
                  <p className="text-xs text-on-surface-low font-mono">{colors[key]}</p>
                </div>
              </div>
            ))}
          </div>
        </details>

        <Button onClick={handleSaveColors} disabled={pendingSection === "colors"}>
          {pendingSection === "colors" ? "Saving…" : "Save Colors"}
        </Button>
      </section>

      {/* Report Header Config */}
      <section className="rounded-lg border border-outline p-4 space-y-4">
        <div>
          <h2 className="text-base font-semibold text-on-surface">PDF Report Header</h2>
          <p className="text-sm text-on-surface-medium mt-0.5">
            Controls what contact details and how your logo is positioned at the top of every printed quotation and invoice.
            Toggle each item on or off to keep your PDFs clean.
          </p>
        </div>

        <div className="space-y-2">
          <Label className="text-sm">Logo Alignment</Label>
          <div className="flex gap-2">
            {(["left", "center", "right"] as const).map((align) => (
              <Button
                key={align}
                type="button"
                size="sm"
                variant={reportHeader.logo_alignment === align ? "default" : "outline"}
                onClick={() => setReportHeader((prev) => ({ ...prev, logo_alignment: align }))}
              >
                {align.charAt(0).toUpperCase() + align.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {(["show_address", "show_phone", "show_email", "show_tagline"] as const).map((key) => (
          <div key={key} className="flex items-center justify-between rounded-lg border border-outline-low p-3">
            <Label className="text-sm text-on-surface capitalize">{key.replace("show_", "Show ")}</Label>
            <Switch
              checked={reportHeader[key]}
              onCheckedChange={(val) => setReportHeader((prev) => ({ ...prev, [key]: val }))}
            />
          </div>
        ))}

        <Button onClick={handleSaveReportHeader} disabled={pendingSection === "header"}>
          {pendingSection === "header" ? "Saving…" : "Save Report Header"}
        </Button>
      </section>
    </div>
  );
}
