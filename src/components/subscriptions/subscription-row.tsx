import { memo } from "react";

import { Text, View, type ViewStyle } from "react-native";

import { StyleSheet } from "react-native-unistyles";

import { PressableScale } from "@/components/shared/pressable-scale";
import type { SubscriptionListItemView } from "@/features/subscriptions/view-models";

type SubscriptionRowProps = {
  subscription: SubscriptionListItemView;
  onPress?: (id: string) => void;
  style?: ViewStyle | null;
};

function SubscriptionRowComponent({ subscription, onPress, style }: SubscriptionRowProps) {
  return (
    <PressableScale
      onPress={() => onPress?.(subscription.id)}
      style={[styles.row, !subscription.isActive && styles.inactiveRow, style]}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{subscription.initials}</Text>
      </View>
      <View style={styles.rowMain}>
        <View style={styles.titleRow}>
          <Text numberOfLines={1} style={styles.rowTitle}>
            {subscription.name}
          </Text>
          {!subscription.isActive ? <Text style={styles.badge}>Inactive</Text> : null}
        </View>
        <Text numberOfLines={1} style={styles.rowSubtitle}>
          {subscription.planName} · {subscription.categoryName}
        </Text>
      </View>
      <View style={styles.rowMeta}>
        <Text style={styles.rowAmount}>{subscription.amountLabel}</Text>
        <Text style={[styles.rowDate, subscription.isDueSoon && styles.rowDateDue]}>
          {subscription.renewalLabel}
        </Text>
      </View>
    </PressableScale>
  );
}

export const SubscriptionRow = memo(SubscriptionRowComponent);

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  inactiveRow: {
    opacity: 0.58,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.name === "dark" ? "#1E2A5F" : "#EEF2FF",
  },
  avatarText: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.name === "dark" ? "#C7D2FE" : "#253A8A",
  },
  rowMain: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  rowTitle: {
    flexShrink: 1,
    fontSize: 15,
    fontWeight: "500",
    lineHeight: 20,
    color: theme.colors.text,
  },
  badge: {
    overflow: "hidden",
    borderRadius: 999,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 6,
    paddingVertical: 2,
    fontSize: 10,
    fontWeight: "700",
    color: theme.colors.muted,
    textTransform: "uppercase",
  },
  rowSubtitle: {
    fontSize: 12,
    lineHeight: 17,
    color: theme.colors.muted,
    marginTop: 2,
  },
  rowMeta: {
    alignItems: "flex-end",
  },
  rowAmount: {
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 21,
    color: theme.colors.text,
    fontVariant: ["tabular-nums"],
  },
  rowDate: {
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 17,
    color: theme.colors.muted,
    marginTop: 2,
  },
  rowDateDue: {
    color: theme.colors.warning,
    fontWeight: "700",
  },
}));
