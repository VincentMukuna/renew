import { View, type ViewProps, type ViewStyle } from "react-native";

import { StyleSheet } from "react-native-unistyles";

import type { AppTheme } from "@/styles/themes";

export function subtleCardShadow(theme: AppTheme): Pick<
  ViewStyle,
  "shadowColor" | "shadowOffset" | "shadowOpacity" | "shadowRadius" | "elevation"
> {
  return {
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: theme.name === "light" ? 0.025 : 0.05,
    shadowRadius: theme.name === "light" ? 1.5 : 2,
    elevation: theme.name === "light" ? 0 : 1,
  };
}

export function Card({ children, style, ...props }: ViewProps) {
  return (
    <View style={[styles.card, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderCurve: "continuous",
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    padding: theme.spacing.md,
    ...subtleCardShadow(theme),
  },
}));
