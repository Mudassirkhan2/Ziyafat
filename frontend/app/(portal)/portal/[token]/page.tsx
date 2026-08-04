"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  fetchPortal, signPortal, submitDietary,
  type PortalData, type PortalEvent,
} from "@/lib/portal-api";
import { formatMoney } from "@/lib/format-currency";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    signed: "bg-green-100 text-green-700",
    unsigned: "bg-amber-100 text-amber-700",
    approved: "bg-green-100 text-green-700",
    sent: "bg-blue-100 text-blue-700",
    draft: "bg-stone-100 text-stone-600",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[status] ?? "bg-stone-100 text-stone-600"}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Signature pad
// ---------------------------------------------------------------------------

function SignatureSection({
  token,
  status,
  signerName,
  signatureImage: existingImage,
  onSigned,
}: {
  token: string;
  status: string;
  signerName: string | null;
  signatureImage: string | null;
  onSigned: (name: string, image: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [name, setName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  // Sync canvas internal pixel size to its CSS display size
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const sync = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width && rect.height) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
    };
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  function getPos(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      if (!e.touches.length) return null;
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
  }

  function startDraw(e: React.MouseEvent | React.TouchEvent) {
    const pos = getPos(e);
    if (!pos) return;
    lastPos.current = pos;
    setIsDrawing(true);
    setHasDrawn(true);
    // Draw initial dot so single taps register
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 1.1, 0, Math.PI * 2);
      ctx.fillStyle = "#1c1917";
      ctx.fill();
    }
  }

  function draw(e: React.MouseEvent | React.TouchEvent) {
    if (!isDrawing || !lastPos.current) return;
    const pos = getPos(e);
    if (!pos) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#1c1917";
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    lastPos.current = pos;
  }

  function endDraw() {
    setIsDrawing(false);
    lastPos.current = null;
  }

  function clearPad() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  }

  async function handleSign() {
    if (!name.trim()) { toast.error("Enter your full name."); return; }
    if (!hasDrawn) { toast.error("Please draw your signature in the box."); return; }
    if (!agreed) { toast.error("Please confirm you agree to the terms."); return; }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const signatureImage = canvas.toDataURL("image/png");
    setLoading(true);
    try {
      await signPortal(token, name.trim(), signatureImage);
      toast.success("Quotation signed successfully.");
      onSigned(name.trim(), signatureImage);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to sign. Try again.");
    } finally {
      setLoading(false);
    }
  }

  if (status === "signed") {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-5 space-y-3">
        {existingImage && (
          <div>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">Signature</p>
            <div className="rounded-lg border border-green-200 bg-white p-3 inline-block">
              <img src={existingImage} alt="Signature" className="max-h-20 max-w-[240px]" />
            </div>
          </div>
        )}
        <div>
          <p className="text-sm font-semibold text-green-700">Signed by {signerName}</p>
          <p className="text-xs text-green-600 mt-0.5">Electronic signature has been recorded.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-stone-800">Sign this quotation</h3>
        <p className="text-xs text-stone-500 mt-0.5">Draw your signature below and enter your full name to approve.</p>
      </div>

      {/* Canvas pad */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-stone-600 uppercase tracking-wide">Signature</label>
          <button type="button" onClick={clearPad} className="text-xs text-stone-400 hover:text-stone-600 transition-colors">
            Clear
          </button>
        </div>
        <canvas
          ref={canvasRef}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
          className="w-full rounded-lg border-2 border-dashed border-stone-300 bg-stone-50 cursor-crosshair"
          style={{ height: 130, display: "block", touchAction: "none" }}
        />
        {!hasDrawn && (
          <p className="text-xs text-stone-400 mt-1.5">Draw your signature in the box above</p>
        )}
      </div>

      {/* Name */}
      <div>
        <label className="text-xs font-semibold text-stone-600 uppercase tracking-wide block mb-1.5">Full Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your full name"
          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
      </div>

      {/* Agreement */}
      <label className="flex items-start gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-stone-300"
        />
        <span className="text-xs text-stone-600">
          I confirm I have reviewed this quotation and agree to the pricing and terms stated above.
        </span>
      </label>

      <button
        onClick={handleSign}
        disabled={loading}
        className="w-full rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white text-sm font-semibold py-2.5 transition-colors"
      >
        {loading ? "Signing…" : "Sign Quotation"}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dietary form (per event)
// ---------------------------------------------------------------------------

function DietarySection({
  token,
  event,
  onSubmitted,
}: {
  token: string;
  event: PortalEvent;
  onSubmitted: (eventId: string, notes: string) => void;
}) {
  const [notes, setNotes] = useState(event.client_dietary_notes ?? "");
  const [loading, setLoading] = useState(false);
  const saved = event.client_dietary_notes;

  async function handleSubmit() {
    if (!notes.trim()) { toast.error("Enter dietary notes before submitting."); return; }
    setLoading(true);
    try {
      await submitDietary(token, event.id, notes.trim());
      toast.success("Dietary info saved.");
      onSubmitted(event.id, notes.trim());
    } catch {
      toast.error("Failed to save. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-stone-800">{event.name}</p>
        <span className="text-xs text-stone-400">{fmtDate(event.date)}</span>
      </div>
      <textarea
        rows={3}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="e.g. 3 guests are gluten-free, 1 has a nut allergy, 2 are vegan"
        className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
      />
      {saved && <p className="text-xs text-green-600">Saved: {saved}</p>}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="rounded-lg border border-stone-300 hover:bg-stone-50 disabled:opacity-60 text-stone-700 text-xs font-semibold px-4 py-2 transition-colors"
      >
        {loading ? "Saving…" : "Save dietary info"}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main portal page
// ---------------------------------------------------------------------------

export default function PortalPage() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<PortalData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPortal(token)
      .then(setData)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load portal"));
  }, [token]);

  useEffect(() => {
    if (!data) return;
    document.documentElement.style.setProperty("--portal-primary", data.org.primary);
    document.documentElement.style.setProperty("--portal-on-primary", data.org.on_primary);
    return () => {
      document.documentElement.style.removeProperty("--portal-primary");
      document.documentElement.style.removeProperty("--portal-on-primary");
    };
  }, [data]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <p className="text-red-600 font-medium">{error === "Portal not found" ? "This portal link is invalid or has expired." : "Failed to load portal. Please try again."}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-stone-400 text-sm">Loading your portal…</p>
      </div>
    );
  }

  const { org, booking_title, events, quotation } = data;
  const unsigned = quotation && quotation.client_signature_status !== "signed";
  const dietaryPending = events.some((e) => !e.client_dietary_notes);

  function handleSigned(name: string, signatureImage: string) {
    setData((prev) =>
      prev && prev.quotation
        ? { ...prev, quotation: { ...prev.quotation, client_signature_status: "signed", signer_name: name, signature_image: signatureImage } }
        : prev
    );
  }

  function handleDietarySubmitted(eventId: string, notes: string) {
    setData((prev) =>
      prev
        ? { ...prev, events: prev.events.map((e) => e.id === eventId ? { ...e, client_dietary_notes: notes } : e) }
        : prev
    );
  }

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      {/* Org header */}
      <header className="border-b border-stone-200 bg-white">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          {org.logo_url && (
            <img src={org.logo_url} alt={org.name} className="h-9 w-9 rounded-lg object-cover" />
          )}
          <div>
            <p className="text-sm font-bold text-stone-900">{org.name}</p>
            {org.tagline && <p className="text-xs text-stone-500">{org.tagline}</p>}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* Outstanding actions banner */}
        {(unsigned || dietaryPending) && (
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
            <p className="text-sm font-semibold text-amber-800 mb-1">Action needed</p>
            <ul className="space-y-0.5">
              {unsigned && <li className="text-xs text-amber-700">• Sign the quotation below</li>}
              {dietaryPending && <li className="text-xs text-amber-700">• Submit dietary restrictions for your guests</li>}
            </ul>
          </div>
        )}

        {/* Booking summary */}
        <div className="rounded-xl border border-stone-200 bg-white p-5">
          <h1 className="text-lg font-bold text-stone-900">{booking_title}</h1>
          <div className="mt-3 flex flex-wrap gap-4 text-sm">
            <div>
              <span className="text-xs text-stone-400 uppercase tracking-wide block">Events</span>
              <span className="font-medium text-stone-700">{events.length}</span>
            </div>
            {data.contract_signed && (
              <div>
                <span className="text-xs text-stone-400 uppercase tracking-wide block">Contract</span>
                <span className="font-medium text-green-700">Signed</span>
              </div>
            )}
          </div>
        </div>

        {/* Events */}
        {events.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-3">Your Events</h2>
            <div className="space-y-3">
              {events.map((event) => (
                <div key={event.id} className="rounded-xl border border-stone-200 bg-white p-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-stone-800">{event.name}</p>
                    {event.ceremony_type && <StatusPill status={event.ceremony_type} />}
                  </div>
                  <p className="text-xs text-stone-500">{fmtDate(event.date)}</p>
                  {event.venue && <p className="text-xs text-stone-500">{event.venue}</p>}
                  <p className="text-xs text-stone-500">{event.guest_count} guests</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Quotation */}
        {quotation && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wide">Quotation v{quotation.version}</h2>
              <StatusPill status={quotation.client_signature_status} />
            </div>

            <div className="rounded-xl border border-stone-200 bg-white overflow-hidden">
              {/* Line items */}
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-100 bg-stone-50">
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-stone-500">Item</th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-stone-500">Guests</th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-stone-500">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {quotation.line_items.map((item, i) => (
                    <tr key={i} className="border-b border-stone-100 last:border-0">
                      <td className="px-4 py-2.5 text-stone-700">{item.label}</td>
                      <td className="px-4 py-2.5 text-right text-stone-500">{item.guest_count}</td>
                      <td className="px-4 py-2.5 text-right font-medium text-stone-800">{formatMoney(item.total, data?.org.currency_code ?? "INR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="border-t border-stone-200 px-4 py-4 space-y-1.5">
                <Row label="Subtotal" value={formatMoney(quotation.subtotal, data?.org.currency_code ?? "INR")} />
                {quotation.discount > 0 && <Row label="Discount" value={`-${formatMoney(quotation.discount, data?.org.currency_code ?? "INR")}`} />}
                {quotation.service_charge_amount > 0 && <Row label={`Service Charge (${quotation.service_charge_percentage}%)`} value={formatMoney(quotation.service_charge_amount, data?.org.currency_code ?? "INR")} />}
                {quotation.gratuity_amount > 0 && <Row label={`Gratuity (${quotation.gratuity_percentage}%)`} value={formatMoney(quotation.gratuity_amount, data?.org.currency_code ?? "INR")} />}
                {quotation.tax_amount > 0 && <Row label={`Tax (${quotation.tax_percentage}%)`} value={formatMoney(quotation.tax_amount, data?.org.currency_code ?? "INR")} />}
                {quotation.delivery_fee > 0 && <Row label="Delivery" value={formatMoney(quotation.delivery_fee, data?.org.currency_code ?? "INR")} />}
                {quotation.setup_fee > 0 && <Row label="Setup" value={formatMoney(quotation.setup_fee, data?.org.currency_code ?? "INR")} />}
                <div className="pt-1 border-t border-stone-200 flex justify-between">
                  <span className="text-sm font-bold text-stone-900">Total</span>
                  <span className="text-sm font-bold text-stone-900">{formatMoney(quotation.total, data?.org.currency_code ?? "INR")}</span>
                </div>
              </div>

              {/* Deposit / balance */}
              {(quotation.deposit_amount > 0 || quotation.deposit_due_date) && (
                <div className="border-t border-stone-200 px-4 py-3 bg-stone-50 space-y-1">
                  {quotation.deposit_amount > 0 && <Row label="Deposit due" value={formatMoney(quotation.deposit_amount, data?.org.currency_code ?? "INR")} muted />}
                  {quotation.deposit_due_date && <Row label="Deposit by" value={fmtDate(quotation.deposit_due_date)} muted />}
                  {quotation.final_balance_due_date && <Row label="Balance by" value={fmtDate(quotation.final_balance_due_date)} muted />}
                </div>
              )}

              {/* Terms */}
              {(quotation.payment_terms_text || quotation.cancellation_policy_text) && (
                <div className="border-t border-stone-200 px-4 py-4 space-y-3">
                  {quotation.payment_terms_text && (
                    <div>
                      <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-0.5">Payment Terms</p>
                      <p className="text-xs text-stone-600 whitespace-pre-wrap">{quotation.payment_terms_text}</p>
                    </div>
                  )}
                  {quotation.cancellation_policy_text && (
                    <div>
                      <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-0.5">Cancellation Policy</p>
                      <p className="text-xs text-stone-600 whitespace-pre-wrap">{quotation.cancellation_policy_text}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Signature display (when already signed) */}
              {quotation.client_signature_status === "signed" && quotation.signature_image && (
                <div className="border-t border-stone-200 px-4 py-4">
                  <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">Signature</p>
                  <div className="rounded-lg border border-stone-200 bg-stone-50 p-3 inline-block">
                    <img src={quotation.signature_image} alt="Client signature" className="max-h-16 max-w-[220px]" />
                  </div>
                  <p className="text-xs text-stone-500 mt-1.5">{quotation.signer_name} · {fmtDate(quotation.signed_date)}</p>
                </div>
              )}
            </div>

            {/* E-signature form */}
            <div className="mt-4">
              <SignatureSection
                token={token}
                status={quotation.client_signature_status}
                signerName={quotation.signer_name}
                signatureImage={quotation.signature_image}
                onSigned={handleSigned}
              />
            </div>
          </section>
        )}

        {/* Dietary restrictions */}
        {events.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-3">Dietary Restrictions</h2>
            <p className="text-xs text-stone-500 mb-3">Let us know about any dietary needs for your guests so we can prepare accordingly.</p>
            <div className="space-y-3">
              {events.map((event) => (
                <DietarySection
                  key={event.id}
                  token={token}
                  event={event}
                  onSubmitted={handleDietarySubmitted}
                />
              ))}
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="text-center py-4 space-y-1">
          {org.phone && <p className="text-xs text-stone-400">{org.phone}</p>}
          {org.email && <p className="text-xs text-stone-400">{org.email}</p>}
          <p className="text-xs text-stone-300">Powered by Ziyafat</p>
        </footer>

      </main>
    </div>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className={`text-xs ${muted ? "text-stone-400" : "text-stone-600"}`}>{label}</span>
      <span className={`text-xs font-medium ${muted ? "text-stone-500" : "text-stone-800"}`}>{value}</span>
    </div>
  );
}
