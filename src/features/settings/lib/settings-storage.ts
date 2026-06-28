import { UnistylesRuntime } from "react-native-unistyles";

import { APP_CONFIG } from "@/constants/config";
import { useSettingsStore } from "@/features/settings/hooks/use-settings-store";
import { getItem, setItem, storageKeys } from "@/lib/storage/local-storage";
import { type AppThemeName, type ThemePreference, appThemes } from "@/styles/themes";

export type PersistedSettings = {
  defaultCurrency?: string;
  themePreference?: ThemePreference;
};

export async function loadPersistedSettings(): Promise<PersistedSettings | null> {
  return getItem<PersistedSettings>(storageKeys.settings);
}

export async function persistSettings(partial: PersistedSettings): Promise<void> {
  const current = (await loadPersistedSettings()) ?? {};
  await setItem(storageKeys.settings, { ...current, ...partial });
}

function resolveCurrentThemeName(): AppThemeName {
  return UnistylesRuntime.themeName === "dark" ? "dark" : "light";
}

function applyThemePreference(themePreference: ThemePreference): void {
  useSettingsStore.getState().setThemePreference(themePreference);

  if (themePreference === "auto") {
    UnistylesRuntime.setAdaptiveThemes(true);
    UnistylesRuntime.setRootViewBackgroundColor(
      appThemes[resolveCurrentThemeName()].colors.background,
    );
    return;
  }

  UnistylesRuntime.setAdaptiveThemes(false);
  UnistylesRuntime.setTheme(themePreference);
  UnistylesRuntime.setRootViewBackgroundColor(appThemes[themePreference].colors.background);
}

export async function hydratePersistedSettings(): Promise<void> {
  const stored = await loadPersistedSettings();
  const themePreference = stored?.themePreference ?? "auto";

  useSettingsStore
    .getState()
    .setDefaultCurrency(stored?.defaultCurrency ?? APP_CONFIG.defaultCurrency);
  applyThemePreference(themePreference);
}

export async function saveThemePreference(themePreference: ThemePreference): Promise<void> {
  applyThemePreference(themePreference);
  await persistSettings({ themePreference });
}

export async function saveDefaultCurrency(defaultCurrency: string): Promise<void> {
  useSettingsStore.getState().setDefaultCurrency(defaultCurrency);
  await persistSettings({ defaultCurrency });
}
