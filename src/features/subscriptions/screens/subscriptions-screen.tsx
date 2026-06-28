import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";

import { Pressable, Text, View } from "react-native";

import { router } from "expo-router";

import type { FlashListRef } from "@shopify/flash-list";
import { List, Search } from "lucide-react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { TabScreen } from "@/components/navigation/tab-screen";
import { FAB_SCROLL_PADDING, FabButton } from "@/components/shared/fab-button";
import { IconButton } from "@/components/shared/icon-button";
import { PressableScale } from "@/components/shared/pressable-scale";
import { SubscriptionList } from "@/components/subscriptions/subscription-list";
import {
  SubscriptionSearchBar,
  type SubscriptionSearchBarRef,
} from "@/components/subscriptions/subscription-search-bar";
import { useSubscriptions } from "@/features/subscriptions/hooks/use-subscriptions";
import {
  type SubscriptionFilterKey,
  computeSubscriptionCounts,
  filterSubscriptions,
} from "@/features/subscriptions/lib/subscription-list-utils";
import type { SubscriptionListItemView } from "@/features/subscriptions/view-models";
import { selectionChange } from "@/lib/haptics";

const TABS: { key: SubscriptionFilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "due-soon", label: "Due soon" },
  { key: "inactive", label: "Inactive" },
];

export function SubscriptionsScreen() {
  const { theme } = useUnistyles();
  const { data: subscriptions = [] } = useSubscriptions();
  const [filter, setFilter] = useState<SubscriptionFilterKey>("all");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const listRef = useRef<FlashListRef<SubscriptionListItemView>>(null);
  const searchRef = useRef<SubscriptionSearchBarRef>(null);

  const counts = useMemo(() => computeSubscriptionCounts(subscriptions), [subscriptions]);
  const visibleSubscriptions = useMemo(
    () => filterSubscriptions(subscriptions, filter, deferredSearchQuery),
    [deferredSearchQuery, filter, subscriptions],
  );

  useEffect(() => {
    listRef.current?.scrollToTop({ animated: false });
  }, [filter, deferredSearchQuery]);

  useEffect(() => {
    if (!searchOpen) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      searchRef.current?.focus();
    });

    return () => cancelAnimationFrame(frame);
  }, [searchOpen]);

  const openAdd = useCallback(() => {
    router.push("/add-subscription");
  }, []);

  const openSearch = useCallback(() => {
    selectionChange();
    setSearchOpen(true);
  }, []);

  const closeSearch = useCallback(() => {
    setSearchQuery("");
    setSearchOpen(false);
  }, []);

  const selectFilter = useCallback((key: SubscriptionFilterKey) => {
    selectionChange();
    setFilter(key);
  }, []);

  const openSubscription = useCallback((id: string) => {
    router.push(`/subscription/${id}`);
  }, []);

  const isSearching = searchQuery.trim().length > 0;

  const emptyState = useMemo(
    () => (
      <View style={styles.empty}>
        <View style={styles.emptyIcon}>
          {isSearching ? (
            <Search color={theme.colors.mutedLight} size={20} strokeWidth={1.5} />
          ) : (
            <List color={theme.colors.mutedLight} size={20} strokeWidth={1.5} />
          )}
        </View>
        <Text style={styles.emptyTitle}>{isSearching ? "No matches" : "Nothing here"}</Text>
        <Text style={styles.emptyCopy}>
          {isSearching ? "Try a different name or plan." : "No subscriptions in this category."}
        </Text>
      </View>
    ),
    [isSearching, theme.colors.mutedLight],
  );

  return (
    <TabScreen>
      <View style={styles.header}>
        {searchOpen ? (
          <>
            <SubscriptionSearchBar
              ref={searchRef}
              onChangeText={setSearchQuery}
              value={searchQuery}
              variant="header"
            />
            <Pressable hitSlop={8} onPress={closeSearch} style={styles.cancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={styles.title}>Subscriptions</Text>
            <IconButton onPress={openSearch}>
              <Search color={theme.colors.icon} size={16} strokeWidth={1.5} />
            </IconButton>
          </>
        )}
      </View>

      <View style={styles.tabsWrap}>
        <View style={styles.tabs}>
          {TABS.map((tab) => {
            const active = filter === tab.key;
            const count = counts[tab.key === "due-soon" ? "dueSoon" : tab.key];
            return (
              <PressableScale
                key={tab.key}
                onPress={() => selectFilter(tab.key)}
                style={[styles.tab, active && styles.tabActive]}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]}>
                  {tab.label}
                  {count > 0 && !active ? <Text style={styles.tabCount}> {count}</Text> : null}
                </Text>
              </PressableScale>
            );
          })}
        </View>
      </View>

      <SubscriptionList
        ref={listRef}
        contentContainerStyle={styles.scroll}
        ListEmptyComponent={emptyState}
        onSubscriptionPress={openSubscription}
        subscriptions={visibleSubscriptions}
      />

      <FabButton accessibilityLabel="Add subscription" onPress={openAdd} />
    </TabScreen>
  );
}

const styles = StyleSheet.create((theme) => ({
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.colors.text,
  },
  cancel: {
    flexShrink: 0,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.icon,
  },
  tabsWrap: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  tabs: {
    flexDirection: "row",
    gap: 4,
    backgroundColor: theme.colors.surface,
    padding: 4,
    borderRadius: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 9,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: theme.colors.card,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    fontSize: 11,
    fontWeight: "700",
    color: theme.colors.muted,
  },
  tabTextActive: {
    color: theme.colors.text,
  },
  tabCount: {
    fontSize: 10,
    opacity: 0.7,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: FAB_SCROLL_PADDING,
  },
  empty: {
    alignItems: "center",
    paddingVertical: 64,
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
  },
}));
