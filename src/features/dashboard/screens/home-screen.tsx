import { useCallback, useMemo } from "react";

import { ScrollView, Text, View } from "react-native";

import { router } from "expo-router";

import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { TabScreen } from "@/components/navigation/tab-screen";
import { BellButton } from "@/components/shared/bell-button";
import { FAB_SCROLL_PADDING, FabButton } from "@/components/shared/fab-button";
import { SummaryStatCard } from "@/components/subscriptions/summary-stat-card";
import { SubscriptionRow } from "@/components/subscriptions/subscription-row";
import {
  useSubscriptions,
  useSubscriptionStats,
} from "@/features/subscriptions/hooks/use-subscriptions";
import type { SubscriptionListItemView } from "@/features/subscriptions/view-models";
import { formatCurrency } from "@/lib/utils/formatters";

const HOME_SECTION_LIMIT = 5;

export function HomeScreen() {
  const { theme } = useUnistyles();
  const { data: subscriptions = [] } = useSubscriptions();
  const { data: stats } = useSubscriptionStats();

  const dueSoon = useMemo(
    () => subscriptions.filter((subscription) => subscription.isDueSoon).slice(0, HOME_SECTION_LIMIT),
    [subscriptions],
  );
  const active = useMemo(
    () =>
      subscriptions
        .filter((subscription) => subscription.isActive && !subscription.isDueSoon)
        .slice(0, HOME_SECTION_LIMIT),
    [subscriptions],
  );

  const openAdd = useCallback(() => {
    router.push("/add-subscription");
  }, []);

  const openSubscription = useCallback((id: string) => {
    router.push(`/subscription/${id}`);
  }, []);

  return (
    <TabScreen>
      <View style={styles.header}>
        <View>
          <Text style={styles.kicker}>Good morning</Text>
          <Text style={styles.pageTitleLg}>{"Here's what renews soon"}</Text>
        </View>
        <BellButton />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.listHeader}>
          <View style={styles.heroCard}>
            <View style={[styles.heroOrb, styles.heroOrbTop]} />
            <View style={[styles.heroOrb, styles.heroOrbBottom]} />
            <Text style={styles.heroLabel}>Monthly expenses</Text>
            <Text style={styles.heroAmount}>{formatCurrency(stats?.monthlyExpenses ?? 0)}</Text>
            <Text style={styles.heroMeta}>
              Across {stats?.activeCount ?? 0} active{" "}
              {(stats?.activeCount ?? 0) === 1 ? "subscription" : "subscriptions"}
            </Text>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statCell}>
              <SummaryStatCard
                label="Total subscribed"
                value={String(stats?.activeCount ?? 0)}
                color={theme.colors.primary}
              />
            </View>
            <View style={styles.statCell}>
              <SummaryStatCard
                label="Due soon"
                value={String(stats?.dueSoonCount ?? 0)}
                color={theme.colors.warning}
              />
            </View>
            <View style={styles.statCell}>
              <SummaryStatCard
                label="Total spent"
                value={formatCurrency(stats?.totalSpentEstimate ?? 0)}
                color={theme.colors.success}
              />
            </View>
            <View style={styles.statCell}>
              <SummaryStatCard
                label="Yearly expenses"
                value={formatCurrency(stats?.yearlyExpenses ?? 0)}
                color={theme.colors.primary}
              />
            </View>
          </View>
        </View>

        <SubscriptionSection
          emptyText="Nothing renewing soon."
          onSubscriptionPress={openSubscription}
          subscriptions={dueSoon}
          title="Due soon"
        />
        <View style={styles.sectionSeparator} />
        <SubscriptionSection
          emptyText="Active subscriptions will appear here."
          onSubscriptionPress={openSubscription}
          subscriptions={active}
          title="Active"
        />
      </ScrollView>

      <FabButton accessibilityLabel="Add subscription" onPress={openAdd} />
    </TabScreen>
  );
}

function SubscriptionSection({
  title,
  subscriptions,
  emptyText,
  onSubscriptionPress,
}: {
  title: string;
  subscriptions: SubscriptionListItemView[];
  emptyText: string;
  onSubscriptionPress: (id: string) => void;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.cards}>
        {subscriptions.length > 0 ? (
          subscriptions.map((subscription) => (
            <SubscriptionRow
              key={subscription.id}
              onPress={onSubscriptionPress}
              subscription={subscription}
            />
          ))
        ) : (
          <Text style={styles.emptySectionText}>{emptyText}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  kicker: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.name === "dark" ? theme.colors.mutedLight : theme.colors.muted,
    textTransform: "uppercase",
    letterSpacing: 1.6,
  },
  pageTitleLg: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.name === "dark" ? "#FFFFFF" : theme.colors.text,
    marginTop: 2,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: FAB_SCROLL_PADDING,
  },
  listHeader: {
    gap: 20,
    paddingBottom: 20,
  },
  heroCard: {
    backgroundColor: theme.name === "dark" ? "#15275F" : theme.colors.hero,
    borderRadius: 16,
    padding: 20,
    overflow: "hidden",
    position: "relative",
  },
  heroOrb: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: theme.colors.onPrimarySurface,
  },
  heroOrbTop: {
    width: 144,
    height: 144,
    top: -40,
    right: -40,
  },
  heroOrbBottom: {
    width: 112,
    height: 112,
    bottom: -40,
    left: -40,
  },
  heroLabel: {
    fontSize: 11,
    fontWeight: "600",
    color:
      theme.name === "dark" ? "rgba(255,255,255,0.68)" : theme.colors.onPrimarySurfaceMuted,
    textTransform: "uppercase",
    letterSpacing: 1.6,
  },
  heroAmount: {
    fontSize: 38,
    fontWeight: "700",
    color: "#FFFFFF",
    lineHeight: 40,
    marginTop: 4,
    fontVariant: ["tabular-nums"],
  },
  heroMeta: {
    fontSize: 12,
    color:
      theme.name === "dark" ? "rgba(255,255,255,0.52)" : theme.colors.onPrimarySurfaceSubtle,
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  statCell: {
    width: "48%",
    flexGrow: 1,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.colors.muted,
    textTransform: "uppercase",
    letterSpacing: 1.6,
    marginTop: 4,
  },
  sectionSeparator: {
    height: 20,
  },
  cards: {
    gap: 0,
  },
  emptySectionText: {
    fontSize: 14,
    color: theme.colors.muted,
    paddingVertical: 14,
  },
}));
