import { useCallback, useDeferredValue, useMemo, useState } from "react";

import { Text, View } from "react-native";

import { Stack, router } from "expo-router";

import { FlashList } from "@shopify/flash-list";
import { Search, Tags } from "lucide-react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { FAB_SCROLL_PADDING, FabButton } from "@/components/shared/fab-button";
import { PressableScale } from "@/components/shared/pressable-scale";
import { SubscriptionSearchBar } from "@/components/subscriptions/subscription-search-bar";
import { useCategories } from "@/features/subscriptions/hooks/use-categories";
import { useSubscriptionSummaries } from "@/features/subscriptions/hooks/use-subscriptions";
import { toSubscriptionListItemView } from "@/features/subscriptions/lib/mappers";
import { getMonthlyEquivalent } from "@/features/subscriptions/lib/recurrence";
import type { SubscriptionSummary } from "@/features/subscriptions/view-models";
import { formatCurrency } from "@/lib/utils/formatters";
import type { Category } from "@/types";

function normalizeCategoryQuery(value: string): string {
  return value.trim().toLowerCase();
}

type CategoryMetrics = {
  activeCount: number;
  dueSoonCount: number;
  monthlyExpenses: number;
};

export function CategoriesScreen() {
  const { theme } = useUnistyles();
  const { data: categories = [] } = useCategories();
  const { data: subscriptionSummaries = [] } = useSubscriptionSummaries();
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const categoryMetrics = useMemo(
    () => buildCategoryMetrics(subscriptionSummaries),
    [subscriptionSummaries],
  );

  const visibleCategories = useMemo(() => {
    const query = normalizeCategoryQuery(deferredSearchQuery);

    if (!query) {
      return categories;
    }

    return categories.filter((category) =>
      normalizeCategoryQuery(`${category.emoji} ${category.name}`).includes(query),
    );
  }, [categories, deferredSearchQuery]);

  const openAdd = useCallback(() => {
    router.push("/add-category");
  }, []);

  const openCategory = useCallback((id: string) => {
    router.push(`/category/${id}`);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: Category }) => (
      <CategoryRow
        category={item}
        metrics={categoryMetrics.get(item.id)}
        onPress={() => openCategory(item.id)}
      />
    ),
    [categoryMetrics, openCategory],
  );

  const listHeader = useMemo(
    () => (
      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          {categories.length} {categories.length === 1 ? "category" : "categories"}
        </Text>
      </View>
    ),
    [categories.length],
  );

  const emptyState = useMemo(
    () => (
      <View style={styles.empty}>
        <View style={styles.emptyIcon}>
          {searchQuery.trim() ? (
            <Search color={theme.colors.mutedLight} size={20} strokeWidth={1.5} />
          ) : (
            <Tags color={theme.colors.mutedLight} size={20} strokeWidth={1.5} />
          )}
        </View>
        <Text style={styles.emptyTitle}>{searchQuery.trim() ? "No matches" : "No categories"}</Text>
        <Text style={styles.emptyCopy}>
          {searchQuery.trim()
            ? "Try another category name or emoji."
            : "Add categories to organize subscriptions."}
        </Text>
        {!searchQuery.trim() ? (
          <PressableScale onPress={openAdd} style={styles.emptyCta}>
            <Text style={styles.emptyCtaText}>Add category</Text>
          </PressableScale>
        ) : null}
      </View>
    ),
    [openAdd, searchQuery, theme.colors.mutedLight],
  );

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ title: "Categories" }} />

      <View style={styles.header}>
        <SubscriptionSearchBar
          onChangeText={setSearchQuery}
          placeholder="Search categories"
          value={searchQuery}
          variant="header"
        />
      </View>

      <FlashList
        contentContainerStyle={styles.scroll}
        data={visibleCategories}
        keyExtractor={(item) => item.id}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={emptyState}
        ListHeaderComponent={categories.length > 0 ? listHeader : null}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />

      <FabButton accessibilityLabel="Add category" onPress={openAdd} />
    </View>
  );
}

function buildCategoryMetrics(subscriptions: SubscriptionSummary[]) {
  const metrics = new Map<string, CategoryMetrics>();
  const now = new Date();

  for (const subscription of subscriptions) {
    const current = metrics.get(subscription.categoryId) ?? {
      activeCount: 0,
      dueSoonCount: 0,
      monthlyExpenses: 0,
    };

    if (subscription.isActive) {
      current.activeCount += 1;
      current.monthlyExpenses += getMonthlyEquivalent(
        subscription.costAmount,
        subscription.recurrence,
      );

      if (toSubscriptionListItemView(subscription, now).isDueSoon) {
        current.dueSoonCount += 1;
      }
    }

    metrics.set(subscription.categoryId, current);
  }

  return metrics;
}

function formatCategoryMetrics(metrics?: CategoryMetrics): string {
  if (!metrics || metrics.activeCount === 0) {
    return "No active subscriptions";
  }

  const subscriptionCopy = `${metrics.activeCount} active`;
  const monthlyCopy = `${formatCurrency(Math.round(metrics.monthlyExpenses))}/mo`;

  if (metrics.dueSoonCount > 0) {
    return `${subscriptionCopy} · ${monthlyCopy} · ${metrics.dueSoonCount} due soon`;
  }

  return `${subscriptionCopy} · ${monthlyCopy}`;
}

function CategoryRow({
  category,
  metrics,
  onPress,
}: {
  category: Category;
  metrics?: CategoryMetrics;
  onPress: () => void;
}) {
  return (
    <PressableScale onPress={onPress} style={styles.row}>
      <Text style={styles.rowEmoji}>{category.emoji}</Text>
      <View style={styles.rowBody}>
        <Text numberOfLines={1} style={styles.rowTitle}>
          {category.name}
        </Text>
        <Text numberOfLines={1} style={styles.rowSubtitle}>
          {formatCategoryMetrics(metrics)}
        </Text>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: FAB_SCROLL_PADDING,
  },
  summary: {
    paddingBottom: 12,
  },
  summaryText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.muted,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  rowEmoji: {
    width: 32,
    fontSize: 22,
    textAlign: "center",
  },
  rowBody: {
    flex: 1,
    minWidth: 0,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: "500",
    lineHeight: 20,
    color: theme.colors.text,
  },
  rowSubtitle: {
    fontSize: 12,
    lineHeight: 17,
    color: theme.colors.muted,
    marginTop: 2,
  },
  empty: {
    alignItems: "center",
    paddingVertical: 64,
    paddingHorizontal: 24,
  },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.icon,
  },
  emptyCopy: {
    fontSize: 12,
    color: theme.colors.mutedLight,
    marginTop: 4,
    textAlign: "center",
  },
  emptyCta: {
    marginTop: 16,
    borderRadius: 999,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  emptyCtaText: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.primaryForeground,
  },
}));
