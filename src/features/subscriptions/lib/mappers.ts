import { APP_CONFIG } from "@/constants/config";
import type {
  SubscriptionDetailView,
  SubscriptionListItemView,
  SubscriptionStatsView,
  SubscriptionSummary,
} from "@/features/subscriptions/view-models";
import { formatCurrency, getInitials } from "@/lib/utils/formatters";

import { formatRenewalDate, formatStartDate, isoDateToDate, toISODate } from "./format-dates";
import {
  getCompletedBillingCycles,
  getMonthlyEquivalent,
  getNextRenewalDate,
  getYearlyEquivalent,
  isDueSoon,
  isDueToday,
  recurrenceLabels,
} from "./recurrence";

export function toSubscriptionListItemView(
  subscription: SubscriptionSummary,
  now: Date,
): SubscriptionListItemView {
  const nextRenewal = getNextRenewalDate(
    isoDateToDate(subscription.startDate),
    subscription.recurrence,
    now,
  );
  const nextRenewalDate = toISODate(nextRenewal);

  return {
    id: subscription.id,
    initials: getInitials(subscription.name),
    name: subscription.name,
    planName: subscription.planName,
    categoryName: subscription.categoryName,
    categoryEmoji: subscription.categoryEmoji,
    amountLabel: formatCurrency(subscription.costAmount),
    renewalLabel: formatRenewalDate(nextRenewalDate),
    nextRenewalDate,
    isActive: subscription.isActive,
    isDueToday: subscription.isActive && isDueToday(nextRenewal, now),
    isDueSoon: subscription.isActive && isDueSoon(nextRenewal, now, APP_CONFIG.dueSoonDays),
  };
}

export function toSubscriptionDetailView(
  subscription: SubscriptionSummary,
  now: Date,
): SubscriptionDetailView {
  const listView = toSubscriptionListItemView(subscription, now);
  const monthly = getMonthlyEquivalent(subscription.costAmount, subscription.recurrence);
  const yearly = getYearlyEquivalent(subscription.costAmount, subscription.recurrence);
  const completedCycles = getCompletedBillingCycles(
    isoDateToDate(subscription.startDate),
    subscription.recurrence,
    now,
  );

  return {
    ...listView,
    costAmount: subscription.costAmount,
    startDateLabel: formatStartDate(subscription.startDate),
    recurrenceLabel: recurrenceLabels[subscription.recurrence],
    monthlyEstimateLabel: formatCurrency(Math.round(monthly)),
    yearlyEstimateLabel: formatCurrency(Math.round(yearly)),
    totalSpentEstimateLabel: formatCurrency(completedCycles * subscription.costAmount),
  };
}

export function toSubscriptionStatsView(
  subscriptions: SubscriptionSummary[],
  now: Date,
): SubscriptionStatsView {
  let activeCount = 0;
  let dueSoonCount = 0;
  let monthlyExpenses = 0;
  let yearlyExpenses = 0;
  let totalSpentEstimate = 0;

  for (const subscription of subscriptions) {
    const startDate = isoDateToDate(subscription.startDate);
    const nextRenewal = getNextRenewalDate(startDate, subscription.recurrence, now);
    const completedCycles = getCompletedBillingCycles(startDate, subscription.recurrence, now);

    totalSpentEstimate += completedCycles * subscription.costAmount;

    if (!subscription.isActive) {
      continue;
    }

    activeCount += 1;
    monthlyExpenses += getMonthlyEquivalent(subscription.costAmount, subscription.recurrence);
    yearlyExpenses += getYearlyEquivalent(subscription.costAmount, subscription.recurrence);

    if (isDueSoon(nextRenewal, now, APP_CONFIG.dueSoonDays)) {
      dueSoonCount += 1;
    }
  }

  return {
    activeCount,
    dueSoonCount,
    monthlyExpenses: Math.round(monthlyExpenses),
    yearlyExpenses: Math.round(yearlyExpenses),
    totalSpentEstimate,
  };
}
