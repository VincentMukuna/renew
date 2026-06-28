import { useCallback, useMemo } from "react";

import { Alert, ScrollView, Text, View } from "react-native";

import { Redirect, Stack, router, useLocalSearchParams } from "expo-router";

import { LinearGradient } from "expo-linear-gradient";
import { Trash2 } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { PressableScale } from "@/components/shared/pressable-scale";
import { SubscriptionRow } from "@/components/subscriptions/subscription-row";
import { useArchiveCategory } from "@/features/subscriptions/hooks/use-category-mutations";
import { useCategory } from "@/features/subscriptions/hooks/use-categories";
import { useSubscriptionSummaries } from "@/features/subscriptions/hooks/use-subscriptions";
import { toSubscriptionListItemView } from "@/features/subscriptions/lib/mappers";
import {
  getMonthlyEquivalent,
  getYearlyEquivalent,
} from "@/features/subscriptions/lib/recurrence";
import type {
  CategoryDetailView,
  SubscriptionSummary,
} from "@/features/subscriptions/view-models";
import { selectionChange } from "@/lib/haptics";
import { formatCurrency } from "@/lib/utils/formatters";

function closeCategoryDetail() {
  if (router.canGoBack()) {
    router.back();
    return;
  }

  router.replace("/categories");
}

export function CategoryDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const isNew = id === "new";
  const { data: category, isPending } = useCategory(id);

  if (isNew) {
    return <Redirect href="/add-category" />;
  }

  if (isPending) {
    return (
      <>
        <Stack.Screen options={{ title: "Category" }} />
        <View style={styles.screen}>
          <View style={styles.skeletonLine} />
          <View style={styles.skeletonCard} />
        </View>
      </>
    );
  }

  if (!category) {
    return (
      <>
        <Stack.Screen options={{ title: "Category not found" }} />
        <View style={styles.missing}>
          <Text style={styles.missingText}>This category could not be found.</Text>
        </View>
      </>
    );
  }

  return <CategoryDetailContent category={category} id={id} />;
}

function CategoryDetailContent({
  category,
  id,
}: {
  category: CategoryDetailView;
  id: string;
}) {
  const { theme } = useUnistyles();
  const insets = useSafeAreaInsets();
  const archiveCategory = useArchiveCategory();
  const { data: subscriptionSummaries = [] } = useSubscriptionSummaries();

  const categorySubscriptions = useMemo(
    () =>
      subscriptionSummaries.filter((subscription) => subscription.categoryId === id),
    [id, subscriptionSummaries],
  );

  const activeSubscriptions = useMemo(
    () => categorySubscriptions.filter((subscription) => subscription.isActive),
    [categorySubscriptions],
  );

  const categoryStats = useMemo(
    () => buildCategoryStats(categorySubscriptions, activeSubscriptions),
    [activeSubscriptions, categorySubscriptions],
  );

  const activeSubscriptionRows = useMemo(() => {
    const now = new Date();
    return activeSubscriptions.map((subscription) => toSubscriptionListItemView(subscription, now));
  }, [activeSubscriptions]);

  const confirmArchive = useCallback(() => {
    selectionChange();
    Alert.alert(
      "Archive category?",
      categoryStats.totalCount > 0
        ? "Only unused categories can be archived. Move subscriptions out of this category first."
        : `Archive ${category.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Archive",
          style: "destructive",
          onPress: () => {
            archiveCategory.mutate(category.id, {
              onSuccess: closeCategoryDetail,
            });
          },
        },
      ],
    );
  }, [archiveCategory, category, categoryStats.totalCount]);

  const usageCopy = useMemo(() => {
    const count = categoryStats.activeCount;
    return count === 0
      ? "No active subscriptions in this category yet."
      : `Across ${count} active ${count === 1 ? "subscription" : "subscriptions"}.`;
  }, [categoryStats.activeCount]);

  const openSubscription = useCallback((subscriptionId: string) => {
    router.push(`/subscription/${subscriptionId}`);
  }, []);

  const openAddSubscription = useCallback(() => {
    router.push({
      pathname: "/add-subscription",
      params: { categoryId: id },
    });
  }, [id]);

  return (
    <>
      <Stack.Screen options={{ title: category.name }} />
      <View style={styles.root}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: 132 + insets.bottom }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.summaryCard}>
            <View style={styles.summaryTitleRow}>
              <Text style={styles.summaryEmoji}>{category.emoji}</Text>
              <Text numberOfLines={1} style={styles.summaryTitle}>
                {category.name}
              </Text>
            </View>
            <Text style={styles.summaryCopy}>{usageCopy}</Text>
            <View style={styles.summaryFooter}>
              <StatBlock label="Active" value={String(categoryStats.activeCount)} />
              <StatBlock label="Monthly" value={formatCurrency(categoryStats.monthlyExpenses)} />
              <StatBlock label="Yearly" value={formatCurrency(categoryStats.yearlyExpenses)} />
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>Active subscriptions</Text>
            <View style={styles.subscriptionList}>
              {activeSubscriptionRows.length > 0 ? (
                activeSubscriptionRows.map((subscription) => (
                  <SubscriptionRow
                    key={subscription.id}
                    onPress={openSubscription}
                    showCategoryMeta={false}
                    subscription={subscription}
                  />
                ))
              ) : (
                <SectionEmpty
                  copy="Subscriptions in this category will appear here."
                  title="Nothing active yet"
                />
              )}
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>Archive</Text>
            <PressableScale onPress={confirmArchive} style={styles.archiveRow}>
              <View style={styles.archiveCopy}>
                <Text style={styles.archiveTitle}>Archive category</Text>
                <Text style={styles.archiveHint}>
                  Available only when no active subscriptions use it.
                </Text>
              </View>
              <Trash2 color={theme.colors.danger} size={18} strokeWidth={2} />
            </PressableScale>
          </View>
        </ScrollView>

        <LinearGradient
          colors={theme.colors.footerGradient}
          style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}
        >
          <PressableScale onPress={openAddSubscription} style={styles.primaryBtn}>
            <Text style={styles.primaryBtnText}>Add Subscription for {category.name}</Text>
          </PressableScale>
        </LinearGradient>
      </View>
    </>
  );
}

function buildCategoryStats(
  allSubscriptions: SubscriptionSummary[],
  activeSubscriptions: SubscriptionSummary[],
) {
  let dueSoonCount = 0;
  let monthlyExpenses = 0;
  let yearlyExpenses = 0;
  const now = new Date();

  for (const subscription of activeSubscriptions) {
    const row = toSubscriptionListItemView(subscription, now);
    if (row.isDueSoon) {
      dueSoonCount += 1;
    }

    monthlyExpenses += getMonthlyEquivalent(subscription.costAmount, subscription.recurrence);
    yearlyExpenses += getYearlyEquivalent(subscription.costAmount, subscription.recurrence);
  }

  return {
    totalCount: allSubscriptions.length,
    activeCount: activeSubscriptions.length,
    inactiveCount: allSubscriptions.length - activeSubscriptions.length,
    dueSoonCount,
    monthlyExpenses: Math.round(monthlyExpenses),
    yearlyExpenses: Math.round(yearlyExpenses),
  };
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text style={styles.summaryFooterLabel}>{label}</Text>
      <Text style={styles.summaryFooterValue}>{value}</Text>
    </View>
  );
}

function SectionEmpty({ title, copy }: { title: string; copy: string }) {
  return (
    <View style={styles.sectionEmpty}>
      <Text style={styles.sectionEmptyTitle}>{title}</Text>
      <Text style={styles.sectionEmptyCopy}>{copy}</Text>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 20,
  },
  content: {
    gap: 22,
    paddingHorizontal: 20,
    paddingTop: 8,
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
  skeletonLine: {
    height: 120,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
  },
  skeletonCard: {
    height: 96,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    marginTop: 18,
  },
  summaryCard: {
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
  summaryTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  summaryEmoji: {
    fontSize: 28,
  },
  summaryTitle: {
    flex: 1,
    fontSize: 28,
    fontWeight: "700",
    color: theme.colors.text,
  },
  summaryCopy: {
    fontSize: 13,
    color: theme.colors.muted,
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
  subscriptionList: {
    marginTop: 6,
  },
  sectionEmpty: {
    alignItems: "center",
    paddingVertical: 28,
    paddingHorizontal: 24,
  },
  sectionEmptyTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.icon,
  },
  sectionEmptyCopy: {
    fontSize: 12,
    color: theme.colors.mutedLight,
    marginTop: 4,
    textAlign: "center",
  },
  archiveRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 14,
  },
  archiveCopy: {
    flex: 1,
    minWidth: 0,
  },
  archiveTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.danger,
  },
  archiveHint: {
    fontSize: 12,
    lineHeight: 17,
    color: theme.colors.muted,
    marginTop: 2,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  primaryBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryBtnText: {
    color: theme.colors.primaryForeground,
    fontSize: 15,
    fontWeight: "600",
  },
}));
