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
