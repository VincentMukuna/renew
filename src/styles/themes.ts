import { darkStatusColors, lightStatusColors } from "./tokens";

const sharedTypography = {
  hero: {
    fontSize: 38,
    fontWeight: "700" as const,
    lineHeight: 42,
  },
  title: {
    fontSize: 24,
    fontWeight: "700" as const,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    lineHeight: 26,
  },
  body: {
    fontSize: 16,
    fontWeight: "400" as const,
    lineHeight: 24,
  },
  caption: {
    fontSize: 13,
    fontWeight: "400" as const,
    lineHeight: 18,
  },
  label: {
    fontSize: 11,
    fontWeight: "700" as const,
    lineHeight: 14,
    letterSpacing: 1.2,
    textTransform: "uppercase" as const,
  },
  amount: {
    fontSize: 34,
    fontWeight: "700" as const,
    lineHeight: 38,
    fontVariant: ["tabular-nums"] as "tabular-nums"[],
  },
  amountSm: {
    fontSize: 14,
    fontWeight: "700" as const,
    lineHeight: 18,
    fontVariant: ["tabular-nums"] as "tabular-nums"[],
  },
};

export const lightTheme = {
  name: "light" as "light" | "dark",
  colors: {
    background: "#F7F5F1",
    surface: "#EFEFEC",
    surfaceMuted: "#E0E0DA",
    card: "#FFFFFF",
    text: "#1A1A18",
    muted: "#8A8A82",
    mutedLight: "#96968E",
    placeholder: "#C8C8C0",
    primary: "#253A8A",
    primaryForeground: "#FFFFFF",
    border: "rgba(0, 0, 0, 0.06)",
    borderStrong: "rgba(0, 0, 0, 0.08)",
    icon: "#4A4A42",
    iconMuted: "#D8D8D0",
    danger: "#DC2626",
    dangerForeground: "#FFFFFF",
    success: "#16A34A",
    warning: "#D97706",
    shadow: "#000000",
    overlay: "rgba(0, 0, 0, 0.35)",
    sheet: "#FBFBF8",
    sheetHandle: "#DDDDD8",
    selected: "#FFFFFF",
    selectedBorder: "rgba(37, 58, 138, 0.25)",
    footerGradient: ["rgba(247,245,241,0)", "rgba(247,245,241,0.95)", "#F7F5F1"] as const,
    tabInactive: "#C0C0B8",
    switchTrackOff: "#DDDDD8",
    progressTrack: "#F1F5F9",
    progressFill: "#818CF8",
    message: "#F7F5F1",
    hero: "#172554",
    onPrimarySurfaceMuted: "rgba(255,255,255,0.62)",
    onPrimarySurfaceSubtle: "rgba(255,255,255,0.46)",
    onPrimarySurface: "rgba(255,255,255,0.06)",
    status: lightStatusColors,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    "2xl": 40,
  },
  radius: {
    sm: 6,
    md: 10,
    lg: 16,
    xl: 24,
    full: 999,
  },
  typography: sharedTypography,
};

type Widen<T> = T extends string
  ? string
  : T extends readonly [infer A, infer B, infer C]
    ? readonly [Widen<A>, Widen<B>, Widen<C>]
    : T extends object
      ? { [K in keyof T]: K extends "name" ? "light" | "dark" : Widen<T[K]> }
      : T;

export type AppTheme = Widen<typeof lightTheme>;

export const darkTheme: AppTheme = {
  ...lightTheme,
  name: "dark",
  colors: {
    ...lightTheme.colors,
    background: "#0B0B0C",
    surface: "#151516",
    surfaceMuted: "#232325",
    card: "#1B1B1D",
    text: "#F3F3F0",
    muted: "#A7A7A0",
    mutedLight: "#74746D",
    placeholder: "#686862",
    primary: "#253A8A",
    primaryForeground: "#FFFFFF",
    border: "rgba(255, 255, 255, 0.08)",
    borderStrong: "rgba(255, 255, 255, 0.14)",
    icon: "#D8D8E6",
    iconMuted: "#5E6170",
    danger: "#F87171",
    dangerForeground: "#111111",
    success: "#34D399",
    warning: "#FBBF24",
    shadow: "#000000",
    overlay: "rgba(0, 0, 0, 0.58)",
    sheet: "#111112",
    sheetHandle: "#3A3A3D",
    selected: "#242426",
    selectedBorder: "rgba(37, 58, 138, 0.42)",
    footerGradient: ["rgba(11,11,12,0)", "rgba(11,11,12,0.95)", "#0B0B0C"] as const,
    tabInactive: "#74746D",
    switchTrackOff: "#3A3A3D",
    progressTrack: "#29292B",
    progressFill: "#253A8A",
    message: "#121213",
    hero: "#172554",
    onPrimarySurfaceMuted: "rgba(255,255,255,0.68)",
    onPrimarySurfaceSubtle: "rgba(255,255,255,0.52)",
    onPrimarySurface: "rgba(255,255,255,0.07)",
    status: darkStatusColors,
  },
};

export const appThemes = {
  light: lightTheme,
  dark: darkTheme,
} as const;

export type AppThemeName = keyof typeof appThemes;
export type ThemePreference = AppThemeName | "auto";
