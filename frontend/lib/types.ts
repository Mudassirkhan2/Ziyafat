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
  menu_dish_ids: string[];
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
  has_recipe: boolean;
  recipe_cost_per_plate: number | null;
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

export interface ReportHeaderConfig {
  logo_alignment: "left" | "center" | "right";
  show_address: boolean;
  show_phone: boolean;
  show_email: boolean;
  show_tagline: boolean;
}

export interface StorefrontSection {
  type: "hero" | "dish_grid" | "about" | "contact";
  enabled: boolean;
  order: number;
  config: Record<string, unknown>;
}

export interface Organisation {
  name: string;
  slug: string;
  logo_url: string | null;
  banner_url: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  tagline: string | null;
  primary: string;
  on_primary: string;
  primary_container: string;
  on_primary_container: string;
  secondary: string;
  on_secondary: string;
  secondary_container: string;
  on_secondary_container: string;
  report_header: ReportHeaderConfig;
  storefront_sections: StorefrontSection[];
}

export interface Ingredient {
  id: string;
  name: string;
  base_unit: string;
  cost_per_unit: number;
  supplier: string | null;
  stock_on_hand: number;
  reorder_threshold: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RecipeIngredient {
  ingredient_id: string;
  ingredient_name: string;
  quantity_per_100_guests: number;
  unit: string;
  cost_per_plate: number;
}

export interface DishRecipe {
  dish_id: string;
  ingredients: RecipeIngredient[];
  recipe_cost_per_plate: number;
}

export interface ProcurementItem {
  ingredient_id: string;
  name: string;
  quantity: number;
  unit: string;
  cost: number;
  supplier: string | null;
}
