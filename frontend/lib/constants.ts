export const CEREMONY_TYPE_OPTIONS = [
  { value: "nikah", label: "Nikah" },
  { value: "walima", label: "Walima" },
  { value: "mehendi", label: "Mehendi" },
  { value: "reception", label: "Reception" },
  { value: "aqiqah", label: "Aqiqah" },
  { value: "birthday", label: "Birthday" },
  { value: "corporate", label: "Corporate" },
  { value: "other", label: "Other" },
] as const;

export const SERVICE_STYLE_OPTIONS = [
  { value: "buffet", label: "Buffet" },
  { value: "plated", label: "Plated" },
  { value: "live_counter", label: "Live Counter" },
  { value: "family", label: "Family Style" },
  { value: "stations", label: "Stations" },
  { value: "combo", label: "Combo" },
] as const;

export const FOOD_PREFERENCE_OPTIONS = [
  { value: "veg", label: "Vegetarian" },
  { value: "non_veg", label: "Non-Vegetarian" },
  { value: "mixed", label: "Mixed" },
  { value: "jain", label: "Jain" },
  { value: "vegan", label: "Vegan" },
] as const;

export const DISH_COURSE_OPTIONS = [
  { value: "starter", label: "Starter" },
  { value: "soup", label: "Soup" },
  { value: "main", label: "Main Course" },
  { value: "dessert", label: "Dessert" },
  { value: "beverage", label: "Beverage" },
  { value: "snack", label: "Snack" },
  { value: "bread", label: "Bread" },
] as const;

export const CUISINE_TYPE_OPTIONS = [
  { value: "hyderabadi", label: "Hyderabadi" },
  { value: "mughlai", label: "Mughlai" },
  { value: "continental", label: "Continental" },
  { value: "chinese", label: "Chinese" },
  { value: "south_indian", label: "South Indian" },
  { value: "italian", label: "Italian" },
  { value: "other", label: "Other" },
] as const;

export const CONTACT_TYPE_OPTIONS = [
  { value: "individual", label: "Individual" },
  { value: "corporate", label: "Corporate" },
  { value: "wedding_planner", label: "Wedding Planner" },
  { value: "venue", label: "Venue" },
  { value: "ngo", label: "NGO" },
] as const;

export const INGREDIENT_CATEGORY_OPTIONS = [
  { value: "produce", label: "Produce" },
  { value: "dairy", label: "Dairy" },
  { value: "protein", label: "Protein" },
  { value: "dry_goods", label: "Dry Goods" },
  { value: "spices", label: "Spices" },
  { value: "oils", label: "Oils" },
  { value: "beverages", label: "Beverages" },
  { value: "other", label: "Other" },
] as const;

export const EVENT_STATUS_OPTIONS = [
  { value: "enquiry", label: "Enquiry" },
  { value: "confirmed", label: "Confirmed" },
  { value: "deposit_received", label: "Deposit Received" },
  { value: "event_day", label: "Event Day" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
] as const;

export const PAYMENT_METHOD_OPTIONS = [
  { value: "cash", label: "Cash" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "upi", label: "UPI" },
  { value: "cheque", label: "Cheque" },
  { value: "card", label: "Card" },
] as const;

export const COMMUNICATION_PREFERENCE_OPTIONS = [
  { value: "phone", label: "Phone" },
  { value: "email", label: "Email" },
  { value: "whatsapp", label: "WhatsApp" },
] as const;

export const REFERRAL_SOURCE_OPTIONS = [
  { value: "word_of_mouth", label: "Word of Mouth" },
  { value: "social_media", label: "Social Media" },
  { value: "website", label: "Website" },
  { value: "google", label: "Google" },
  { value: "event_planner", label: "Event Planner" },
  { value: "returning_customer", label: "Returning Customer" },
  { value: "other", label: "Other" },
] as const;
