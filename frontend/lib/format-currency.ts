import { getCurrencyMeta } from "./currencies";

export function formatMoney(amount: number, currencyCode: string): string {
  const { locale } = getCurrencyMeta(currencyCode);
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCompact(amount: number, currencyCode: string): string {
  const { symbol } = getCurrencyMeta(currencyCode);
  if (currencyCode === "INR") {
    if (amount >= 10_000_000) return `${symbol}${(amount / 10_000_000).toFixed(1)}Cr`;
    if (amount >= 100_000)    return `${symbol}${(amount / 100_000).toFixed(1)}L`;
    if (amount >= 1_000)      return `${symbol}${(amount / 1_000).toFixed(0)}K`;
    return `${symbol}${amount}`;
  }
  if (amount >= 1_000_000) return `${symbol}${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000)     return `${symbol}${(amount / 1_000).toFixed(0)}K`;
  return formatMoney(amount, currencyCode);
}
