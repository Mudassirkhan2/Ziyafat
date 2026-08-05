import { create } from "zustand";
import { persist } from "zustand/middleware";
import { formatMoney, formatCompact } from "./format-currency";

interface CurrencyStore {
  currencyCode: string;
  format: (amount: number) => string;
  formatCompact: (amount: number) => string;
  setFromOrg: (code: string) => void;
}

function derivedState(code: string) {
  return {
    currencyCode: code,
    format: (amount: number) => formatMoney(amount, code),
    formatCompact: (amount: number) => formatCompact(amount, code),
  };
}

export const useCurrencyStore = create<CurrencyStore>()(
  persist(
    (set) => ({
      ...derivedState("INR"),
      setFromOrg: (code: string) => set(derivedState(code)),
    }),
    {
      name: "ziyafat-currency",
      partialize: (state) => ({ currencyCode: state.currencyCode }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const code = state.currencyCode;
          state.format = (amount: number) => formatMoney(amount, code);
          state.formatCompact = (amount: number) => formatCompact(amount, code);
        }
      },
    }
  )
);
