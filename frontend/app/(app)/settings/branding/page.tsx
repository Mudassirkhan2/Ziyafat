"use client";

import { useEffect, useRef, useState } from "react";
import { useOrg, useUpdateOrg, useUploadOrgLogo, useUploadOrgBanner } from "@/lib/organisation-api";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
    primary: "#d97706", on_primary: "#0c0a09",
    primary_container: "#451a03", on_primary_container: "#fed7aa",
    secondary: "#f59e0b", on_secondary: "#0c0a09",
    secondary_container: "#78350f", on_secondary_container: "#fde68a",
  });

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
      setReportHeader({ ...org.report_header });
    }
  }, [org]);

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      uploadLogo.mutate(file);
      e.target.value = "";
    }
  }

  function handleBannerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      uploadBanner.mutate(file);
      e.target.value = "";
    }
  }

  function handleSaveColors() {
    setPendingSection("colors");
    updateOrg.mutate({ ...colors }, { onSettled: () => setPendingSection(null) });
  }

  function handleSaveReportHeader() {
    setPendingSection("header");
    updateOrg.mutate({ report_header: reportHeader }, { onSettled: () => setPendingSection(null) });
  }

  if (isLoading) return <p className="text-on-surface-medium">Loading…</p>;

  return (
    <div className="space-y-8">
      {/* Logo */}
      <section className="rounded-lg border border-outline p-4 space-y-3">
        <h2 className="text-base font-semibold text-on-surface">Logo</h2>
        {org?.logo_url && (
          <img src={org.logo_url} alt="Logo" className="h-12 object-contain rounded" />
        )}
        <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
        <Button variant="outline" onClick={() => logoInputRef.current?.click()} disabled={uploadLogo.isPending}>
          {uploadLogo.isPending ? "Uploading…" : "Upload Logo"}
        </Button>
        {uploadLogo.isError && <p className="text-sm text-red-400">Upload failed. Try again.</p>}
        {uploadLogo.isSuccess && <p className="text-sm text-green-400">Logo updated.</p>}
      </section>

      {/* Banner */}
      <section className="rounded-lg border border-outline p-4 space-y-3">
        <h2 className="text-base font-semibold text-on-surface">Banner</h2>
        {org?.banner_url && (
          <img src={org.banner_url} alt="Banner" className="h-24 w-full object-cover rounded" />
        )}
        <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={handleBannerChange} />
        <Button variant="outline" onClick={() => bannerInputRef.current?.click()} disabled={uploadBanner.isPending}>
          {uploadBanner.isPending ? "Uploading…" : "Upload Banner"}
        </Button>
        {uploadBanner.isError && <p className="text-sm text-red-400">Upload failed. Try again.</p>}
        {uploadBanner.isSuccess && <p className="text-sm text-green-400">Banner updated.</p>}
      </section>

      {/* DLS Colors */}
      <section className="rounded-lg border border-outline p-4 space-y-4">
        <h2 className="text-base font-semibold text-on-surface">Brand Colors</h2>
        <div className="grid grid-cols-2 gap-4">
          {(Object.keys(colors) as (keyof ColorFields)[]).map((key) => (
            <div key={key} className="flex items-center gap-3">
              <input
                type="color"
                value={colors[key]}
                onChange={(e) => setColors((prev) => ({ ...prev, [key]: e.target.value }))}
                className="w-10 h-10 rounded cursor-pointer border border-outline"
              />
              <div>
                <p className="text-xs text-on-surface font-medium">{key.replace(/_/g, " ")}</p>
                <p className="text-xs text-on-surface-low font-mono">{colors[key]}</p>
              </div>
            </div>
          ))}
        </div>
        {updateOrg.isError && <p className="text-sm text-red-400">Failed to save colors.</p>}
        {updateOrg.isSuccess && <p className="text-sm text-green-400">Colors saved.</p>}
        <Button onClick={handleSaveColors} disabled={pendingSection === "colors"}>
          {pendingSection === "colors" ? "Saving…" : "Save Colors"}
        </Button>
      </section>

      {/* Report Header Config */}
      <section className="rounded-lg border border-outline p-4 space-y-4">
        <h2 className="text-base font-semibold text-on-surface">Report Header</h2>
        <p className="text-sm text-on-surface-medium">Controls what appears at the top of printed PDFs.</p>

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
