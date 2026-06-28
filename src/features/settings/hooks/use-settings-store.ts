import { create } from "zustand";

import { APP_CONFIG } from "@/constants/config";
import { DEFAULT_BRAND_COLOR_THEME, type BrandColorThemeId } from "@/styles/brand-themes";
import type { ThemePreference } from "@/styles/themes";

type SettingsState = {
  defaultCurrency: string;
  themePreference: ThemePreference;
  brandColorTheme: BrandColorThemeId;
  onboardingComplete: boolean;
  setDefaultCurrency: (currency: string) => void;
  setThemePreference: (themePreference: ThemePreference) => void;
  setBrandColorTheme: (brandColorTheme: BrandColorThemeId) => void;
  setOnboardingComplete: (complete: boolean) => void;
};

export const useSettingsStore = create<SettingsState>((set) => ({
  defaultCurrency: APP_CONFIG.defaultCurrency,
  themePreference: "auto",
  brandColorTheme: DEFAULT_BRAND_COLOR_THEME,
  onboardingComplete: false,
  setDefaultCurrency: (defaultCurrency) => set({ defaultCurrency }),
  setThemePreference: (themePreference) => set({ themePreference }),
  setBrandColorTheme: (brandColorTheme) => set({ brandColorTheme }),
  setOnboardingComplete: (onboardingComplete) => set({ onboardingComplete }),
}));
