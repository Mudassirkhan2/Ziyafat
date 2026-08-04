export interface CurrencyMeta {
  code: string;
  symbol: string;
  name: string;
  locale: string;
}

export const CURRENCIES: CurrencyMeta[] = [
  { code: "INR", symbol: "₹",   name: "Indian Rupee",        locale: "en-IN" },
  { code: "USD", symbol: "$",   name: "US Dollar",            locale: "en-US" },
  { code: "GBP", symbol: "£",   name: "British Pound",        locale: "en-GB" },
  { code: "EUR", symbol: "€",   name: "Euro",                 locale: "de-DE" },
  { code: "AED", symbol: "AED", name: "UAE Dirham",           locale: "ar-AE" },
  { code: "SAR", symbol: "SAR", name: "Saudi Riyal",          locale: "ar-SA" },
  { code: "PKR", symbol: "Rs",  name: "Pakistani Rupee",      locale: "ur-PK" },
  { code: "BDT", symbol: "৳",  name: "Bangladeshi Taka",     locale: "bn-BD" },
  { code: "LKR", symbol: "Rs",  name: "Sri Lankan Rupee",     locale: "si-LK" },
  { code: "MYR", symbol: "RM",  name: "Malaysian Ringgit",    locale: "ms-MY" },
  { code: "SGD", symbol: "S$",  name: "Singapore Dollar",     locale: "en-SG" },
  { code: "QAR", symbol: "QAR", name: "Qatari Riyal",         locale: "ar-QA" },
  { code: "KWD", symbol: "KWD", name: "Kuwaiti Dinar",        locale: "ar-KW" },
  { code: "OMR", symbol: "OMR", name: "Omani Rial",           locale: "ar-OM" },
  { code: "NPR", symbol: "Rs",  name: "Nepali Rupee",         locale: "ne-NP" },
];

export function getCurrencyMeta(code: string): CurrencyMeta {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];
}
