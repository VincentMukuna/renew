import * as Localization from "expo-localization";

import { APP_CONFIG } from "@/constants/config";

const regionCurrency: Record<string, string> = {
  KE: "KES",
  US: "USD",
  GB: "GBP",
  CA: "CAD",
  AU: "AUD",
  NG: "NGN",
  ZA: "ZAR",
};

export function detectCurrencyFromOs(): string {
  const regionCode = Localization.getLocales()[0]?.regionCode;

  if (!regionCode) {
    return APP_CONFIG.defaultCurrency;
  }

  return regionCurrency[regionCode] ?? APP_CONFIG.defaultCurrency;
}
