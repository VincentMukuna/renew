import type { ComponentType } from "react";
import { useCallback } from "react";

import { ScrollView, Text, View } from "react-native";

import { router } from "expo-router";

import { ChevronRight } from "lucide-react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { TabScreen, useTabScrollPadding } from "@/components/navigation/tab-screen";
import { PressableScale } from "@/components/shared/pressable-scale";
import { useSettingsStore } from "@/features/settings/hooks/use-settings-store";
import { saveThemePreference } from "@/features/settings/lib/settings-storage";
import { selectionChange } from "@/lib/haptics";
import type { ThemePreference } from "@/styles/themes";

const THEME_OPTIONS: { label: string; value: ThemePreference }[] = [
  { label: "Light", value: "light" },
  { label: "Auto", value: "auto" },
  { label: "Dark", value: "dark" },
];

let DevToolsSection: ComponentType | null = null;

if (__DEV__) {
  // Dev-only require keeps seed/reset tooling out of production bundles.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  DevToolsSection = require("@/features/settings/dev/dev-tools-section").DevToolsSection;
}

export function SettingsScreen() {
  const { theme } = useUnistyles();
  const tabScrollPadding = useTabScrollPadding();
  const currency = useSettingsStore((state) => state.defaultCurrency);
  const themePreference = useSettingsStore((state) => state.themePreference);

  const handleThemeSelect = useCallback(async (preference: ThemePreference) => {
    selectionChange();
    await saveThemePreference(preference);
  }, []);

  return (
    <TabScreen>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: tabScrollPadding }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.icon}>◐</Text>
              <Text style={styles.label}>Theme</Text>
              <View style={styles.segmented}>
                {THEME_OPTIONS.map((option) => {
                  const selected = themePreference === option.value;
                  return (
                    <PressableScale
                      key={option.value}
                      onPress={() => {
                        void handleThemeSelect(option.value);
                      }}
                      style={[styles.segment, selected && styles.segmentSelected]}
                    >
                      <Text style={[styles.segmentText, selected && styles.segmentTextSelected]}>
                        {option.label}
                      </Text>
                    </PressableScale>
                  );
                })}
              </View>
            </View>
            <PressableScale style={[styles.row, styles.rowBorder]}>
              <Text style={styles.icon}>💱</Text>
              <Text style={styles.label}>Currency</Text>
              <View style={styles.valueWrap}>
                <Text style={styles.value}>{currency}</Text>
                <ChevronRight color={theme.colors.iconMuted} size={16} strokeWidth={2} />
              </View>
            </PressableScale>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <Text style={styles.sectionHint}>Upcoming subscription charge reminders.</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.icon}>🔔</Text>
              <Text style={styles.label}>Charge reminders</Text>
              <Text style={styles.value}>Soon</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <View style={styles.card}>
            <PressableScale onPress={() => router.push("/categories")} style={styles.row}>
              <Text style={styles.icon}>🏷️</Text>
              <Text style={styles.label}>Manage categories</Text>
              <View style={styles.valueWrap}>
                <ChevronRight color={theme.colors.iconMuted} size={16} strokeWidth={2} />
              </View>
            </PressableScale>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.icon}>🔒</Text>
              <Text style={styles.label}>Storage</Text>
              <Text style={styles.value}>Local device</Text>
            </View>
          </View>
        </View>

        {DevToolsSection ? <DevToolsSection /> : null}
      </ScrollView>
    </TabScreen>
  );
}

const styles = StyleSheet.create((theme) => ({
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.colors.text,
  },
  scroll: {
    paddingHorizontal: 20,
    gap: 20,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: theme.colors.muted,
    textTransform: "uppercase",
    letterSpacing: 1.6,
  },
  sectionHint: {
    fontSize: 12,
    lineHeight: 18,
    color: theme.colors.muted,
    marginTop: -4,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden",
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  icon: {
    fontSize: 16,
  },
  label: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.text,
  },
  valueWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  value: {
    fontSize: 14,
    color: theme.colors.muted,
    textTransform: "capitalize",
  },
  segmented: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    padding: 3,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
  },
  segment: {
    minWidth: 54,
    alignItems: "center",
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  segmentSelected: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.muted,
  },
  segmentTextSelected: {
    color: theme.colors.text,
  },
}));
