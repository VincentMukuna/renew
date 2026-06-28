import { useCallback, useMemo, useState } from "react";

import { Pressable, ScrollView, Text, View } from "react-native";

import { router } from "expo-router";

import { CalendarDays, ChevronLeft, ChevronRight, Plus } from "lucide-react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { TabScreen, useTabScrollPadding } from "@/components/navigation/tab-screen";
import { PressableScale } from "@/components/shared/pressable-scale";
import { SubscriptionRow } from "@/components/subscriptions/subscription-row";
import {
  WEEKDAY_LABELS,
  addMonths,
  buildCalendarDays,
  formatMonthLabel,
  formatSelectedDateLabel,
  getMonthRenewalSummary,
  getUpcomingRenewals,
  startOfMonth,
  toCalendarSubscriptionRow,
} from "@/features/calendar/lib/calendar-renewals";
import { useSubscriptionSummaries } from "@/features/subscriptions/hooks/use-subscriptions";
import { toISODate } from "@/features/subscriptions/lib/format-dates";
import { selectionChange } from "@/lib/haptics";
import { formatCurrency } from "@/lib/utils/formatters";

export function CalendarScreen() {
  const { theme } = useUnistyles();
  const now = useMemo(() => new Date(), []);
  const todayIso = useMemo(() => toISODate(now), [now]);
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(now));
  const [selectedDate, setSelectedDate] = useState(todayIso);
  const bottomPadding = useTabScrollPadding(32);
  const { data: subscriptions = [] } = useSubscriptionSummaries();

  const activeSubscriptions = useMemo(
    () => subscriptions.filter((subscription) => subscription.isActive),
    [subscriptions],
  );

  const monthSummary = useMemo(
    () => getMonthRenewalSummary(subscriptions, visibleMonth),
    [subscriptions, visibleMonth],
  );
  const renewalDates = useMemo(
    () => new Set(Object.keys(monthSummary.renewalsByDate)),
    [monthSummary.renewalsByDate],
  );
  const days = useMemo(
    () => buildCalendarDays(visibleMonth, selectedDate, renewalDates, now),
    [now, renewalDates, selectedDate, visibleMonth],
  );
  const selectedRenewals = useMemo(
    () => monthSummary.renewalsByDate[selectedDate] ?? [],
    [monthSummary.renewalsByDate, selectedDate],
  );
  const selectedRows = useMemo(
    () => selectedRenewals.map((renewal) => toCalendarSubscriptionRow(renewal, "recurrence")),
    [selectedRenewals],
  );
  const selectedTotal = useMemo(
    () => selectedRenewals.reduce((total, renewal) => total + renewal.subscription.costAmount, 0),
    [selectedRenewals],
  );
  const upcomingRows = useMemo(
    () =>
      getUpcomingRenewals(subscriptions, selectedDate, 5).map((renewal) =>
        toCalendarSubscriptionRow(renewal, "date"),
      ),
    [selectedDate, subscriptions],
  );

  const openAdd = useCallback(() => {
    router.push("/add-subscription");
  }, []);

  const openSubscription = useCallback((id: string) => {
    router.push(`/subscription/${id}`);
  }, []);

  const selectDate = useCallback((isoDate: string, date: Date) => {
    selectionChange();
    setVisibleMonth(startOfMonth(date));
    setSelectedDate(isoDate);
  }, []);

  const moveMonth = useCallback((direction: -1 | 1) => {
    selectionChange();
    setVisibleMonth((current) => {
      const next = addMonths(current, direction);
      setSelectedDate(toISODate(next));
      return next;
    });
  }, []);

  const selectToday = useCallback(() => {
    selectionChange();
    setVisibleMonth(startOfMonth(now));
    setSelectedDate(todayIso);
  }, [now, todayIso]);

  const hasActiveSubscriptions = activeSubscriptions.length > 0;
  const selectedDateLabel = formatSelectedDateLabel(selectedDate);

  return (
    <TabScreen>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomPadding }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>Calendar</Text>
            <Text style={styles.subtitle}>See what renews and when.</Text>
          </View>
          <PressableScale
            accessibilityLabel="Add subscription"
            onPress={openAdd}
            style={styles.addButton}
          >
            <Plus color={theme.colors.icon} size={18} strokeWidth={1.7} />
          </PressableScale>
        </View>

        {hasActiveSubscriptions ? (
          <>
            <View style={styles.monthNav}>
              <PressableScale
                accessibilityLabel="Previous month"
                onPress={() => moveMonth(-1)}
                style={styles.monthButton}
              >
                <ChevronLeft color={theme.colors.icon} size={18} strokeWidth={1.8} />
              </PressableScale>
              <View style={styles.monthLabelWrap}>
                <Text style={styles.monthLabel}>{formatMonthLabel(visibleMonth)}</Text>
                <Pressable hitSlop={8} onPress={selectToday}>
                  <Text style={styles.todayAction}>Today</Text>
                </Pressable>
              </View>
              <PressableScale
                accessibilityLabel="Next month"
                onPress={() => moveMonth(1)}
                style={styles.monthButton}
              >
                <ChevronRight color={theme.colors.icon} size={18} strokeWidth={1.8} />
              </PressableScale>
            </View>

            <View style={styles.monthSummary}>
              <Text style={styles.monthAmount}>
                {formatCurrency(monthSummary.totalAmount)} renewing this month
              </Text>
              <Text style={styles.monthMeta}>
                Across {monthSummary.activeSubscriptionCount} active{" "}
                {monthSummary.activeSubscriptionCount === 1 ? "subscription" : "subscriptions"}
              </Text>
            </View>

            <View style={styles.calendar}>
              <View style={styles.weekdays}>
                {WEEKDAY_LABELS.map((label, index) => (
                  <Text key={`${label}-${index}`} style={styles.weekday}>
                    {label}
                  </Text>
                ))}
              </View>
              <View style={styles.daysGrid}>
                {days.map((day) => (
                  <PressableScale
                    key={day.isoDate}
                    accessibilityLabel={`${day.isoDate}${
                      day.hasRenewals ? ", has subscription renewals" : ""
                    }`}
                    onPress={() => selectDate(day.isoDate, day.date)}
                    style={styles.dayCell}
                  >
                    <View
                      style={[
                        styles.dayCircle,
                        day.isToday && styles.todayCircle,
                        day.isSelected && styles.selectedCircle,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          !day.inCurrentMonth && styles.dayTextMuted,
                          day.isSelected && styles.selectedDayText,
                        ]}
                      >
                        {day.day}
                      </Text>
                      <View
                        style={[
                          styles.renewalDot,
                          !day.hasRenewals && styles.renewalDotHidden,
                          day.isSelected && styles.selectedRenewalDot,
                        ]}
                      />
                    </View>
                  </PressableScale>
                ))}
              </View>
            </View>

            <View style={styles.selectedSummary}>
              <Text style={styles.selectedDate}>{selectedDateLabel}</Text>
              <Text style={styles.selectedMeta}>
                {selectedRenewals.length > 0
                  ? `${selectedRenewals.length} ${
                      selectedRenewals.length === 1 ? "renewal" : "renewals"
                    } · ${formatCurrency(selectedTotal)}`
                  : "No renewals"}
              </Text>
            </View>

            {selectedRows.length > 0 ? (
              <View style={styles.list}>
                {selectedRows.map((subscription) => (
                  <SubscriptionRow
                    key={`${subscription.id}-${subscription.nextRenewalDate}`}
                    onPress={openSubscription}
                    subscription={subscription}
                  />
                ))}
              </View>
            ) : (
              <View style={styles.emptySelected}>
                <Text style={styles.emptySelectedTitle}>Nothing renews on this date.</Text>
                <Text style={styles.emptySelectedCopy}>
                  Pick another date or check upcoming renewals.
                </Text>
              </View>
            )}

            {selectedRows.length === 0 && upcomingRows.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Upcoming</Text>
                <View style={styles.list}>
                  {upcomingRows.map((subscription) => (
                    <SubscriptionRow
                      key={`${subscription.id}-${subscription.nextRenewalDate}`}
                      onPress={openSubscription}
                      subscription={subscription}
                    />
                  ))}
                </View>
              </View>
            ) : null}
          </>
        ) : (
          <View style={styles.emptyCalendar}>
            <View style={styles.emptyIcon}>
              <CalendarDays color={theme.colors.mutedLight} size={22} strokeWidth={1.5} />
            </View>
            <Text style={styles.emptyTitle}>Nothing on the calendar yet.</Text>
            <Text style={styles.emptyCopy}>Add an active subscription to see future renewals.</Text>
            <PressableScale onPress={openAdd} style={styles.emptyCta}>
              <Text style={styles.emptyCtaText}>Add subscription</Text>
            </PressableScale>
          </View>
        )}
      </ScrollView>
    </TabScreen>
  );
}

const styles = StyleSheet.create((theme) => ({
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: theme.colors.muted,
    marginTop: 3,
  },
  addButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surface,
  },
  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  monthButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surface,
  },
  monthLabelWrap: {
    flex: 1,
    alignItems: "center",
    gap: 3,
  },
  monthLabel: {
    fontSize: 17,
    fontWeight: "700",
    color: theme.colors.text,
  },
  todayAction: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  monthSummary: {
    paddingVertical: 4,
    gap: 3,
  },
  monthAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.text,
    fontVariant: ["tabular-nums"],
  },
  monthMeta: {
    fontSize: 13,
    color: theme.colors.muted,
  },
  calendar: {
    gap: 10,
  },
  weekdays: {
    flexDirection: "row",
  },
  weekday: {
    flex: 1,
    textAlign: "center",
    fontSize: 11,
    fontWeight: "700",
    color: theme.colors.mutedLight,
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 8,
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  dayCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  todayCircle: {
    borderColor: theme.colors.selectedBorder,
    backgroundColor: theme.colors.surface,
  },
  selectedCircle: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  dayText: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.text,
    fontVariant: ["tabular-nums"],
  },
  dayTextMuted: {
    color: theme.colors.placeholder,
  },
  selectedDayText: {
    color: theme.colors.primaryForeground,
  },
  renewalDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.primary,
    marginTop: 3,
  },
  renewalDotHidden: {
    opacity: 0,
  },
  selectedRenewalDot: {
    backgroundColor: theme.colors.primaryForeground,
  },
  selectedSummary: {
    paddingTop: 4,
    paddingBottom: 2,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: 2,
  },
  selectedDate: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.text,
  },
  selectedMeta: {
    fontSize: 13,
    color: theme.colors.muted,
    paddingBottom: 12,
  },
  list: {
    gap: 0,
  },
  emptySelected: {
    paddingVertical: 8,
    gap: 4,
  },
  emptySelectedTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.icon,
  },
  emptySelectedCopy: {
    fontSize: 13,
    lineHeight: 18,
    color: theme.colors.muted,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: theme.colors.muted,
    textTransform: "uppercase",
    letterSpacing: 1.6,
  },
  emptyCalendar: {
    alignItems: "center",
    paddingTop: 96,
    gap: 10,
  },
  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.icon,
  },
  emptyCopy: {
    fontSize: 13,
    color: theme.colors.muted,
    textAlign: "center",
  },
  emptyCta: {
    marginTop: 8,
    borderRadius: 999,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  emptyCtaText: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.primaryForeground,
  },
}));
