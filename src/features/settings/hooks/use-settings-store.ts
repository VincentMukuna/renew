import { create } from "zustand";

import { APP_CONFIG } from "@/constants/config";
import type { ThemePreference } from "@/styles/themes";

type SettingsState = {
  defaultCurrency: string;
  themePreference: ThemePreference;
  onboardingComplete: boolean;
  setDefaultCurrency: (currency: string) => void;
  setThemePreference: (themePreference: ThemePreference) => void;
  setOnboardingComplete: (complete: boolean) => void;
};

export const useSettingsStore = create<SettingsState>((set) => ({
  defaultCurrency: APP_CONFIG.defaultCurrency,
  themePreference: "auto",
  onboardingComplete: false,
  setDefaultCurrency: (defaultCurrency) => set({ defaultCurrency }),
  setThemePreference: (themePreference) => set({ themePreference }),
  setOnboardingComplete: (onboardingComplete) => set({ onboardingComplete }),
}));
