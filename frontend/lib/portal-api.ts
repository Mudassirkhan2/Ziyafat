export const PORTAL_API = process.env.NEXT_PUBLIC_API_URL ?? "";

export interface PortalOrg {
  name: string;
  logo_url: string | null;
  phone: string | null;
  email: string | null;
  tagline: string | null;
  primary: string;
  on_primary: string;
  secondary: string;
}

export interface PortalEvent {
  id: string;
  name: string;
  date: string;
  venue: string | null;
  guest_count: number;
  ceremony_type: string | null;
  service_style: string | null;
  client_dietary_notes: string | null;
}

export interface PortalLineItem {
  dish_id: string | null;
  label: string;
  qty_per_plate: number;
  guest_count: number;
  unit_price: number;
  total: number;
}

export interface PortalQuotation {
  id: string;
  version: number;
  status: string;
  line_items: PortalLineItem[];
  subtotal: number;
  discount: number;
  service_charge_percentage: number;
  service_charge_amount: number;
  tax_percentage: number;
  tax_amount: number;
  gratuity_percentage: number;
  gratuity_amount: number;
  delivery_fee: number;
  setup_fee: number;
  total: number;
  deposit_percentage: number | null;
  deposit_amount: number;
  deposit_due_date: string | null;
  final_balance_due_date: string | null;
  payment_terms_text: string | null;
  cancellation_policy_text: string | null;
  per_person_price: number;
  client_signature_status: string;
  signed_date: string | null;
  signer_name: string | null;
}

export interface PortalData {
  org: PortalOrg;
  booking_title: string;
  booking_status: string;
  contract_signed: boolean;
  contract_signed_date: string | null;
  events: PortalEvent[];
  quotation: PortalQuotation | null;
}

export async function fetchPortal(token: string): Promise<PortalData> {
  const res = await fetch(`${PORTAL_API}/api/v1/portal/${token}`);
  if (!res.ok) throw new Error(res.status === 404 ? "Portal not found" : "Failed to load portal");
  return res.json();
}

export async function signPortal(
  token: string,
  signerName: string
): Promise<{ client_signature_status: string; signer_name: string; signed_date: string | null }> {
  const res = await fetch(`${PORTAL_API}/api/v1/portal/${token}/sign`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ signer_name: signerName }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Failed to sign" }));
    throw new Error(err.detail ?? "Failed to sign");
  }
  return res.json();
}

export async function submitDietary(
  token: string,
  eventId: string,
  notes: string
): Promise<{ event_id: string; client_dietary_notes: string }> {
  const res = await fetch(`${PORTAL_API}/api/v1/portal/${token}/dietary`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event_id: eventId, notes }),
  });
  if (!res.ok) throw new Error("Failed to submit dietary info");
  return res.json();
}
