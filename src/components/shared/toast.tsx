import { useEffect } from "react";

import { View } from "react-native";

import { StyleSheet } from "react-native-unistyles";

import { useUiStore } from "@/features/subscriptions/store/ui-store";

import { Text } from "../ui/text";

export function Toast() {
  const message = useUiStore((state) => state.message);
  const clearToast = useUiStore((state) => state.clearToast);

  useEffect(() => {
    if (!message) {
      return;
    }

    const timeout = setTimeout(clearToast, 2500);
    return () => clearTimeout(timeout);
  }, [clearToast, message]);

  if (!message) {
    return null;
  }

  return (
    <View pointerEvents="none" style={styles.wrapper}>
      <View style={styles.toast}>
        <Text variant="caption" style={styles.label}>
          {message}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  wrapper: {
    bottom: 36,
    left: 20,
    position: "absolute",
    right: 20,
  },
  toast: {
    alignSelf: "center",
    backgroundColor: theme.colors.text,
    borderCurve: "continuous",
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  label: {
    color: theme.colors.background,
    fontWeight: "700",
  },
}));
