import { APP_CONFIG } from "@/constants/config";
import { useSettingsStore } from "@/features/settings/hooks/use-settings-store";

function resolveCurrency(currency?: string): string {
  return currency ?? useSettingsStore.getState().defaultCurrency ?? APP_CONFIG.defaultCurrency;
}

export function formatCurrency(amount: number, currency?: string): string {
  const code = resolveCurrency(currency);

  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: code,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Short label for amount inputs — symbol when available, otherwise ISO code. */
export function formatCurrencyPrefix(currency?: string): string {
  const code = resolveCurrency(currency);

  try {
    const parts = new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: code,
      currencyDisplay: "narrowSymbol",
    }).formatToParts(0);
    const symbol = parts.find((part) => part.type === "currency")?.value;

    if (symbol && symbol !== code) {
      return symbol === "US$" ? "$" : symbol;
    }
  } catch {
    // Fall through to ISO code.
  }

  return code;
}

export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
