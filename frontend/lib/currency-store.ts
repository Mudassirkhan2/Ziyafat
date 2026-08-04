import { create } from "zustand";
import { formatMoney, formatCompact } from "./format-currency";

interface CurrencyStore {
  currencyCode: string;
  format: (amount: number) => string;
  formatCompact: (amount: number) => string;
  setFromOrg: (code: string) => void;
}

export const useCurrencyStore = create<CurrencyStore>((set) => ({
  currencyCode: "INR",
  format: (amount) => formatMoney(amount, "INR"),
  formatCompact: (amount) => formatCompact(amount, "INR"),
  setFromOrg: (code: string) =>
    set({
      currencyCode: code,
      format: (amount) => formatMoney(amount, code),
      formatCompact: (amount) => formatCompact(amount, code),
    }),
}));
