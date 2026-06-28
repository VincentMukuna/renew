import { Alert, Text, View } from "react-native";

import { ChevronRight } from "lucide-react-native";
import { StyleSheet } from "react-native-unistyles";

import { PressableScale } from "@/components/shared/pressable-scale";
import { resetOnboardingState } from "@/features/onboarding/lib/onboarding-storage";
import { selectionChange } from "@/lib/haptics";

import { useResetDatabase } from "../hooks/use-reset-database";
import { useSeedSubscriptions } from "../hooks/use-seed-subscriptions";
import { SEED_SUBSCRIPTION_COUNT } from "./seed-subscriptions";

type DevToolRowProps = {
  icon: string;
  title: string;
  description: string;
  value: string;
  disabled?: boolean;
  bordered?: boolean;
  onPress: () => void;
};

function DevToolRow({
  icon,
  title,
  description,
  value,
  disabled = false,
  bordered = false,
  onPress,
}: DevToolRowProps) {
  return (
    <PressableScale
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[styles.row, bordered && styles.rowBorder]}
    >
      <Text style={styles.icon}>{icon}</Text>
      <View style={styles.rowCopy}>
        <Text style={styles.label}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <View style={styles.valueWrap}>
        <Text style={styles.value}>{value}</Text>
        <ChevronRight color={styles.chevron.color} size={16} strokeWidth={2} />
      </View>
    </PressableScale>
  );
}

export function DevToolsSection() {
  const seedSubscriptions = useSeedSubscriptions();
  const resetDatabase = useResetDatabase();

  const confirmOnboardingReset = () => {
    selectionChange();
    Alert.alert(
      "Reset onboarding?",
      "Shows the onboarding flow again the next time the app checks onboarding state.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            void resetOnboardingState();
          },
        },
      ],
    );
  };

  const confirmReset = () => {
    selectionChange();
    Alert.alert(
      "Clear subscription records?",
      "Deletes subscriptions and subscription events. Categories and preferences stay unchanged.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            resetDatabase.mutate();
          },
        },
      ],
    );
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Developer</Text>
      <View style={styles.card}>
        <DevToolRow
          description={`${SEED_SUBSCRIPTION_COUNT} subscriptions across the default categories.`}
          disabled={seedSubscriptions.isPending}
          icon="🧾"
          onPress={() => seedSubscriptions.mutate()}
          title="Seed sample data"
          value={seedSubscriptions.isPending ? "Seeding" : "Run"}
        />
        <DevToolRow
          bordered
          description="Delete subscriptions and subscription events."
          disabled={resetDatabase.isPending}
          icon="🧹"
          onPress={confirmReset}
          title="Reset records"
          value={resetDatabase.isPending ? "Resetting" : "Reset"}
        />
        <DevToolRow
          bordered
          description="Clear the completed flag so onboarding can run again."
          icon="👋"
          onPress={confirmOnboardingReset}
          title="Reset onboarding"
          value="Reset"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
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
  rowCopy: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.text,
  },
  description: {
    fontSize: 12,
    lineHeight: 17,
    color: theme.colors.muted,
  },
  valueWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  value: {
    fontSize: 14,
    color: theme.colors.muted,
  },
  chevron: {
    color: theme.colors.iconMuted,
  },
}));
