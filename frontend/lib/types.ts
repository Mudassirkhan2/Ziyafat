export type LeadStatus = "new" | "quoted" | "negotiating" | "won" | "lost";
export type BookingStatus = "confirmed" | "in_progress" | "completed" | "cancelled";
export type CateringModel = "per_plate" | "chef_driven";
export type UserRole = "owner" | "manager" | "kitchen" | "viewer";

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  event_type: string;
  approx_date: string | null;
  approx_guest_count: number | null;
  status: LeadStatus;
  source: string | null;
  notes: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  lead_id: string | null;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  customer_id: string;
  customer_name: string;
  title: string;
  status: BookingStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookingEvent {
  id: string;
  booking_id: string;
  name: string;
  date: string;
  venue: string | null;
  guest_count: number;
  catering_model: CateringModel;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type QuotationStatus = "draft" | "sent" | "approved" | "rejected" | "superseded";
export type InvoiceStatus = "draft" | "sent" | "paid";

export interface QuotationLineItem {
  dish_id: string | null;
  label: string;
  qty_per_plate: number;
  guest_count: number;
  unit_price: number;
  total: number;
}

export interface Dish {
  id: string;
  name: string;
  category: string;
  description: string | null;
  per_plate_cost: number;
  selling_price: number;
  is_veg: boolean;
  is_active: boolean;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Quotation {
  id: string;
  booking_id: string;
  event_id: string | null;
  version: number;
  status: QuotationStatus;
  line_items: QuotationLineItem[];
  subtotal: number;
  discount: number;
  total: number;
  notes: string | null;
  valid_until: string | null;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  booking_id: string;
  quotation_id: string | null;
  invoice_number: string;
  status: InvoiceStatus;
  line_items: QuotationLineItem[];
  subtotal: number;
  discount: number;
  total: number;
  due_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
