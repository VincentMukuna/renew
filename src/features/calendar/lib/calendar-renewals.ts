import {
  formatRenewalDate,
  isoDateToDate,
  toISODate,
} from "@/features/subscriptions/lib/format-dates";
import {
  getNextRenewalDate,
  getRenewalDatesBetween,
  isDueToday,
  recurrenceLabels,
} from "@/features/subscriptions/lib/recurrence";
import type {
  SubscriptionListItemView,
  SubscriptionSummary,
} from "@/features/subscriptions/view-models";
import { formatCurrency, getInitials } from "@/lib/utils/formatters";

export type CalendarRenewal = {
  date: string;
  subscription: SubscriptionSummary;
};

export type CalendarDay = {
  date: Date;
  isoDate: string;
  day: number;
  inCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  hasRenewals: boolean;
};

export type MonthRenewalSummary = {
  renewals: CalendarRenewal[];
  renewalsByDate: Record<string, CalendarRenewal[]>;
  totalAmount: number;
  activeSubscriptionCount: number;
};

export const WEEKDAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"] as const;

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

export function formatMonthLabel(date: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatSelectedDateLabel(isoDate: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(isoDateToDate(isoDate));
}

export function buildCalendarDays(
  visibleMonth: Date,
  selectedDate: string,
  renewalDates: Set<string>,
  now: Date,
): CalendarDay[] {
  const monthStart = startOfMonth(visibleMonth);
  const startOffset = (monthStart.getDay() + 6) % 7;
  const gridStart = new Date(monthStart);
  gridStart.setDate(monthStart.getDate() - startOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    const isoDate = toISODate(date);

    return {
      date,
      isoDate,
      day: date.getDate(),
      inCurrentMonth: date.getMonth() === visibleMonth.getMonth(),
      isToday: isoDate === toISODate(now),
      isSelected: isoDate === selectedDate,
      hasRenewals: renewalDates.has(isoDate),
    };
  });
}

export function getMonthRenewalSummary(
  subscriptions: SubscriptionSummary[],
  visibleMonth: Date,
): MonthRenewalSummary {
  const monthStart = startOfMonth(visibleMonth);
  const monthEnd = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0);
  const renewals: CalendarRenewal[] = [];
  const activeSubscriptionIds = new Set<string>();

  for (const subscription of subscriptions) {
    if (!subscription.isActive) {
      continue;
    }

    const renewalDates = getRenewalDatesBetween(
      isoDateToDate(subscription.startDate),
      subscription.recurrence,
      monthStart,
      monthEnd,
    );

    if (renewalDates.length > 0) {
      activeSubscriptionIds.add(subscription.id);
    }

    for (const renewalDate of renewalDates) {
      renewals.push({
        date: toISODate(renewalDate),
        subscription,
      });
    }
  }

  renewals.sort((a, b) => {
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }

    return a.subscription.name.localeCompare(b.subscription.name);
  });

  const renewalsByDate = renewals.reduce<Record<string, CalendarRenewal[]>>((acc, renewal) => {
    acc[renewal.date] ??= [];
    acc[renewal.date].push(renewal);
    return acc;
  }, {});

  return {
    renewals,
    renewalsByDate,
    totalAmount: renewals.reduce((total, renewal) => total + renewal.subscription.costAmount, 0),
    activeSubscriptionCount: activeSubscriptionIds.size,
  };
}

export function getUpcomingRenewals(
  subscriptions: SubscriptionSummary[],
  afterDate: string,
  limit = 5,
): CalendarRenewal[] {
  const after = isoDateToDate(afterDate);

  return subscriptions
    .filter((subscription) => subscription.isActive)
    .map((subscription) => {
      const nextRenewal = getNextRenewalDate(
        isoDateToDate(subscription.startDate),
        subscription.recurrence,
        after,
      );

      if (toISODate(nextRenewal) === afterDate) {
        nextRenewal.setDate(nextRenewal.getDate() + 1);
        return {
          date: toISODate(
            getNextRenewalDate(
              isoDateToDate(subscription.startDate),
              subscription.recurrence,
              nextRenewal,
            ),
          ),
          subscription,
        };
      }

      return {
        date: toISODate(nextRenewal),
        subscription,
      };
    })
    .sort((a, b) => {
      if (a.date !== b.date) {
        return a.date.localeCompare(b.date);
      }

      return a.subscription.name.localeCompare(b.subscription.name);
    })
    .slice(0, limit);
}

export function toCalendarSubscriptionRow(
  renewal: CalendarRenewal,
  meta: "recurrence" | "date",
): SubscriptionListItemView {
  const subscription = renewal.subscription;

  return {
    id: subscription.id,
    initials: getInitials(subscription.name),
    name: subscription.name,
    planName: subscription.planName,
    categoryName: subscription.categoryName,
    categoryEmoji: subscription.categoryEmoji,
    amountLabel: formatCurrency(subscription.costAmount),
    renewalLabel:
      meta === "recurrence"
        ? recurrenceLabels[subscription.recurrence]
        : formatRenewalDate(renewal.date),
    nextRenewalDate: renewal.date,
    isActive: subscription.isActive,
    isDueToday: subscription.isActive && isDueToday(isoDateToDate(renewal.date), new Date()),
    isDueSoon: false,
  };
}
