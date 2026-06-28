import { useCallback } from "react";

import { RefreshControl, ScrollView, Switch, Text, View } from "react-native";

import { Stack, useLocalSearchParams } from "expo-router";

import { useQueryClient } from "@tanstack/react-query";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { subscriptionKeys } from "@/features/subscriptions/hooks/query-keys";
import { useSubscription } from "@/features/subscriptions/hooks/use-subscription";
import { useUpdateSubscription } from "@/features/subscriptions/hooks/use-update-subscription";
import type { SubscriptionDetailView } from "@/features/subscriptions/view-models";
import { selectionChange } from "@/lib/haptics";

export function SubscriptionDetailScreen() {
  const { theme } = useUnistyles();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { data: subscription, isPending, isRefetching } = useSubscription(id);
  const updateSubscription = useUpdateSubscription();

  const handleRefresh = useCallback(
    () => queryClient.invalidateQueries({ queryKey: subscriptionKeys.detail(id) }),
    [id, queryClient],
  );

  const handleActiveChange = useCallback(
    (isActive: boolean) => {
      selectionChange();
      updateSubscription.mutate({ id, input: { isActive } });
    },
    [id, updateSubscription],
  );

  if (isPending) {
    return (
      <>
        <Stack.Screen options={{ title: "Subscription" }} />
        <View style={styles.screen}>
          <View style={styles.skeletonCard} />
          <View style={styles.skeletonLine} />
          <View style={styles.skeletonLineShort} />
        </View>
      </>
    );
  }

  if (!subscription) {
    return (
      <>
        <Stack.Screen options={{ title: "Subscription not found" }} />
        <View style={styles.missing}>
          <Text style={styles.missingText}>This subscription could not be found.</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => <SubscriptionStatusBadge subscription={subscription} />,
          title: subscription.name,
        }}
      />
      <View collapsable={false} style={styles.screen}>
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              tintColor={theme.colors.primary}
              onRefresh={handleRefresh}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          <SubscriptionSummary subscription={subscription} />

          <View style={styles.card}>
            <Text style={styles.cardLabel}>Plan</Text>
            <View style={styles.detailGrid}>
              <DetailStat label="Name" value={subscription.planName} />
              <DetailStat
                label="Category"
                value={`${subscription.categoryEmoji} ${subscription.categoryName}`}
              />
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>Renewal</Text>
            <View style={styles.detailGrid}>
              <DetailStat label="Started" value={subscription.startDateLabel} />
              <DetailStat label="Cadence" value={subscription.recurrenceLabel} />
              <DetailStat label="Next charge" value={subscription.renewalLabel} />
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>Spend estimates</Text>
            <View style={styles.detailGrid}>
              <DetailStat label="Monthly" value={subscription.monthlyEstimateLabel} />
              <DetailStat label="Yearly" value={subscription.yearlyEstimateLabel} />
              <DetailStat label="Total spent" value={subscription.totalSpentEstimateLabel} />
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>Tracking</Text>
            <View style={styles.switchRow}>
              <View style={styles.switchCopy}>
                <Text style={styles.detailValue}>Active</Text>
                <Text style={styles.detailHint}>
                  Include in metrics and upcoming charge reminders.
                </Text>
              </View>
              <Switch
                onValueChange={handleActiveChange}
                thumbColor={theme.colors.primaryForeground}
                trackColor={{ false: theme.colors.switchTrackOff, true: theme.colors.primary }}
                value={subscription.isActive}
              />
            </View>
          </View>
        </ScrollView>
      </View>
    </>
  );
}

function SubscriptionSummary({ subscription }: { subscription: SubscriptionDetailView }) {
  const support = subscription.isActive
    ? `Renews ${subscription.renewalLabel}`
    : "Paused and excluded from active metrics";

  return (
    <View style={styles.summaryCard}>
      <View style={styles.summaryTop}>
        <Text style={styles.summaryHint}>Subscription cost</Text>
        <Text style={styles.summaryCategory}>
          {subscription.categoryEmoji} {subscription.categoryName}
        </Text>
      </View>
      <Text style={styles.summaryAmount}>{subscription.amountLabel}</Text>
      <Text style={styles.summarySupport}>{support}</Text>
      {subscription.isDueSoon ? <Text style={styles.summaryWarning}>Upcoming charge</Text> : null}
      <View style={styles.summaryFooter}>
        <View>
          <Text style={styles.summaryFooterLabel}>Monthly</Text>
          <Text style={styles.summaryFooterValue}>{subscription.monthlyEstimateLabel}</Text>
        </View>
        <View>
          <Text style={styles.summaryFooterLabel}>Yearly</Text>
          <Text style={styles.summaryFooterValue}>{subscription.yearlyEstimateLabel}</Text>
        </View>
      </View>
    </View>
  );
}

function SubscriptionStatusBadge({ subscription }: { subscription: SubscriptionDetailView }) {
  const label = subscription.isActive ? (subscription.isDueSoon ? "Due soon" : "Active") : "Paused";

  return (
    <View
      style={[
        styles.statusBadge,
        !subscription.isActive && styles.statusBadgeMuted,
        subscription.isDueSoon && styles.statusBadgeWarning,
      ]}
    >
      <Text
        style={[
          styles.statusBadgeText,
          !subscription.isActive && styles.statusBadgeTextMuted,
          subscription.isDueSoon && styles.statusBadgeTextWarning,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

function DetailStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailStat}>
      <Text style={styles.detailKey}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
    gap: 22,
  },
  missing: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: theme.colors.background,
  },
  missingText: {
    fontSize: 16,
    color: theme.colors.muted,
  },
  skeletonCard: {
    height: 176,
    marginHorizontal: 20,
    marginTop: 8,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
  },
  skeletonLine: {
    height: 72,
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
  },
  skeletonLineShort: {
    height: 72,
    marginHorizontal: 20,
    marginTop: 12,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
  },
  summaryCard: {
    marginHorizontal: -8,
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: theme.name === "light" ? 0.025 : 0.05,
    shadowRadius: theme.name === "light" ? 1.5 : 2,
    elevation: theme.name === "light" ? 0 : 1,
  },
  summaryTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  summaryHint: {
    fontSize: 12,
    color: theme.colors.mutedLight,
    fontWeight: "500",
  },
  summaryCategory: {
    flexShrink: 1,
    fontSize: 12,
    color: theme.colors.muted,
    textAlign: "right",
  },
  summaryAmount: {
    fontSize: 34,
    fontWeight: "700",
    color: theme.colors.text,
    lineHeight: 36,
    marginTop: 6,
    fontVariant: ["tabular-nums"],
  },
  summarySupport: {
    fontSize: 13,
    color: theme.colors.muted,
    marginTop: 4,
  },
  summaryWarning: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.warning,
    marginTop: 4,
  },
  summaryFooter: {
    flexDirection: "row",
    gap: 28,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  summaryFooterLabel: {
    fontSize: 11,
    color: theme.colors.mutedLight,
    fontWeight: "500",
  },
  summaryFooterValue: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
    marginTop: 2,
    fontVariant: ["tabular-nums"],
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "rgba(22, 163, 74, 0.12)",
  },
  statusBadgeMuted: {
    backgroundColor: theme.colors.surface,
  },
  statusBadgeWarning: {
    backgroundColor: "rgba(217, 119, 6, 0.12)",
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.success,
  },
  statusBadgeTextMuted: {
    color: theme.colors.muted,
  },
  statusBadgeTextWarning: {
    color: theme.colors.warning,
  },
  card: {
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: theme.colors.primary,
    textTransform: "uppercase",
    letterSpacing: 1.6,
  },
  detailGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: 18,
    rowGap: 18,
    marginTop: 14,
  },
  detailStat: {
    flexGrow: 1,
    flexBasis: "46%",
    minWidth: 124,
  },
  detailKey: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.colors.muted,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  detailValue: {
    fontSize: 14,
    color: theme.colors.text,
    marginTop: 4,
  },
  detailHint: {
    fontSize: 12,
    color: theme.colors.muted,
    marginTop: 4,
    lineHeight: 17,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 14,
  },
  switchCopy: {
    flex: 1,
  },
}));
