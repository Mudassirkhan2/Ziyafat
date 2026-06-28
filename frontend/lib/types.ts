export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export type LeadStatus = "new" | "quoted" | "negotiating" | "won" | "lost";
export type BookingStatus = "confirmed" | "in_progress" | "completed" | "cancelled";
export type CateringModel = "per_plate" | "chef_driven";
export type UserRole = "owner" | "manager" | "kitchen" | "viewer";
export type CeremonyType = "nikah" | "walima" | "mehendi" | "reception" | "aqiqah" | "birthday" | "corporate" | "other";
export type ServiceStyle = "buffet" | "plated" | "live_counter" | "family" | "stations" | "combo";
export type FoodPreference = "veg" | "non_veg" | "mixed" | "jain" | "vegan";
export type DishCourse = "starter" | "soup" | "main" | "dessert" | "beverage" | "snack" | "bread";
export type CuisineType = "hyderabadi" | "mughlai" | "continental" | "chinese" | "south_indian" | "italian" | "other";
export type ContactType = "individual" | "corporate" | "wedding_planner" | "venue" | "ngo";
export type IngredientCategory = "produce" | "dairy" | "protein" | "dry_goods" | "spices" | "oils" | "beverages" | "other";
export type EventStatus = "enquiry" | "confirmed" | "deposit_received" | "event_day" | "completed" | "cancelled";

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
  budget: number | null;
  budget_per_person: number | null;
  ceremony_type: CeremonyType | null;
  food_preference: FoodPreference | null;
  service_style: ServiceStyle | null;
  venue_type: string | null;
  meal_type: string | null;
  tentative_venue: string | null;
  preferred_contact_time: string | null;
  dietary_notes: string | null;
  follow_up_date: string | null;
  number_of_events: number | null;
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
  company_name: string | null;
  contact_type: ContactType | null;
  billing_address: string | null;
  dietary_restrictions: string | null;
  referral_source: string | null;
  gstin: string | null;
  preferred_payment_method: string | null;
  communication_preference: string | null;
  account_manager_id: string | null;
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
  deposit_amount: number | null;
  deposit_due_date: string | null;
  deposit_paid_date: string | null;
  contract_signed: boolean;
  contract_signed_date: string | null;
  minimum_guarantee: number | null;
  booking_manager_id: string | null;
  cancellation_policy: string | null;
  payment_terms: string | null;
  special_instructions: string | null;
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
  start_time: string | null;
  end_time: string | null;
  setup_time: string | null;
  breakdown_time: string | null;
  food_service_time: string | null;
  ceremony_type: CeremonyType | null;
  service_style: ServiceStyle | null;
  food_preference: FoodPreference | null;
  event_status: EventStatus | null;
  veg_count: number | null;
  non_veg_count: number | null;
  confirmed_count: number | null;
  actual_headcount: number | null;
  venue_address: string | null;
  venue_contact: string | null;
  room_setup_style: string | null;
  staffing_requirements: number | null;
  equipment_needed: string | null;
  kitchen_notes: string | null;
  access_instructions: string | null;
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
  course: DishCourse | null;
  cuisine_type: CuisineType | null;
  allergens: string[];
  dietary_tags: string[];
  portion_size: string | null;
  minimum_order_quantity: number | null;
  preparation_time_minutes: number | null;
  notes_for_kitchen: string | null;
  is_available_for_storefront: boolean;
  tags: string[];
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
  service_charge_percentage: number;
  tax_percentage: number;
  gratuity_percentage: number;
  service_charge_amount: number;
  tax_amount: number;
  gratuity_amount: number;
  delivery_fee: number;
  setup_fee: number;
  deposit_amount: number;
  per_person_price: number;
  deposit_percentage: number | null;
  deposit_due_date: string | null;
  final_balance_due_date: string | null;
  signed_date: string | null;
  payment_terms_text: string | null;
  cancellation_policy_text: string | null;
  minimum_guarantee_count: number | null;
  client_signature_status: string;
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
  invoice_date: string | null;
  service_charge_amount: number;
  tax_amount: number;
  gratuity_amount: number;
  delivery_fee: number;
  staffing_fee: number;
  amount_paid: number;
  balance_due: number;
  payment_method: string | null;
  payment_received_date: string | null;
  attendees_count: number | null;
  gstin_customer: string | null;
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
  gstin: string | null;
  website: string | null;
  bank_account_name: string | null;
  bank_account_number: string | null;
  bank_ifsc: string | null;
  bank_name: string | null;
  default_payment_terms: string | null;
  default_cancellation_policy: string | null;
  default_service_charge_percentage: number;
  default_tax_rate: number;
  default_gratuity_percentage: number;
  invoice_prefix: string;
  social_links: Record<string, string>;
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
  category: IngredientCategory | null;
  yield_percentage: number;
  purchase_unit: string | null;
  unit_conversion_factor: number | null;
  allergen_flag: boolean;
  waste_percentage: number;
  storage_location: string | null;
  shelf_life_days: number | null;
  par_level: number | null;
  notes: string | null;
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
