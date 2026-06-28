import { detectCurrencyFromOs } from "@/features/settings/lib/detect-currency-from-os";
import { loadPersistedSettings, saveDefaultCurrency } from "@/features/settings/lib/settings-storage";

export async function bootstrapCurrency(): Promise<void> {
  const stored = await loadPersistedSettings();

  if (stored?.defaultCurrency !== undefined) {
    return;
  }

  await saveDefaultCurrency(detectCurrencyFromOs());
}
