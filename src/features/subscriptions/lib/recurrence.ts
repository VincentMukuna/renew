import type { Recurrence } from "@/types";

export const recurrenceLabels: Record<Recurrence, string> = {
  weekly: "Weekly",
  bi_weekly: "Bi-weekly",
  monthly: "Monthly",
  bi_monthly: "Bi-monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
  bi_yearly: "Bi-yearly",
  every_3_years: "Every 3 years",
};

export const RECURRENCE_OPTIONS = (Object.keys(recurrenceLabels) as Recurrence[]).map((value) => ({
  value,
  label: recurrenceLabels[value],
}));

export const recurrenceMonths: Record<Recurrence, number> = {
  weekly: 12 / 52,
  bi_weekly: 12 / 26,
  monthly: 1,
  bi_monthly: 2,
  quarterly: 3,
  yearly: 12,
  bi_yearly: 24,
  every_3_years: 36,
};

export function getMonthlyEquivalent(amount: number, recurrence: Recurrence): number {
  switch (recurrence) {
    case "weekly":
      return (amount * 52) / 12;
    case "bi_weekly":
      return (amount * 26) / 12;
    case "monthly":
      return amount;
    case "bi_monthly":
      return amount / 2;
    case "quarterly":
      return amount / 3;
    case "yearly":
      return amount / 12;
    case "bi_yearly":
      return amount / 24;
    case "every_3_years":
      return amount / 36;
  }
}

export function getYearlyEquivalent(amount: number, recurrence: Recurrence): number {
  return getMonthlyEquivalent(amount, recurrence) * 12;
}

function addMonthsClamped(date: Date, months: number): Date {
  const next = new Date(date);
  const day = next.getDate();
  next.setDate(1);
  next.setMonth(next.getMonth() + months);
  const lastDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
  next.setDate(Math.min(day, lastDay));
  return next;
}

function addRecurrence(date: Date, recurrence: Recurrence): Date {
  const next = new Date(date);

  switch (recurrence) {
    case "weekly":
      next.setDate(next.getDate() + 7);
      return next;
    case "bi_weekly":
      next.setDate(next.getDate() + 14);
      return next;
    case "monthly":
      return addMonthsClamped(next, 1);
    case "bi_monthly":
      return addMonthsClamped(next, 2);
    case "quarterly":
      return addMonthsClamped(next, 3);
    case "yearly":
      return addMonthsClamped(next, 12);
    case "bi_yearly":
      return addMonthsClamped(next, 24);
    case "every_3_years":
      return addMonthsClamped(next, 36);
  }
}

export function getNextRenewalDate(
  startDate: Date,
  recurrence: Recurrence,
  now: Date = new Date(),
): Date {
  let next = new Date(startDate);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  while (next < today) {
    next = addRecurrence(next, recurrence);
  }

  return next;
}

export function getRenewalDatesBetween(
  startDate: Date,
  recurrence: Recurrence,
  rangeStart: Date,
  rangeEnd: Date,
): Date[] {
  const renewals: Date[] = [];
  let next = new Date(startDate);

  while (next < rangeStart) {
    next = addRecurrence(next, recurrence);
  }

  while (next <= rangeEnd) {
    renewals.push(new Date(next));
    next = addRecurrence(next, recurrence);
  }

  return renewals;
}

export function getCompletedBillingCycles(
  startDate: Date,
  recurrence: Recurrence,
  now: Date = new Date(),
): number {
  let count = 0;
  let next = new Date(startDate);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  while (next <= today) {
    count += 1;
    next = addRecurrence(next, recurrence);
  }

  return Math.max(0, count - 1);
}

export function isDueSoon(nextRenewalDate: Date, now: Date, dueSoonDays: number): boolean {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dueSoonUntil = new Date(today);
  dueSoonUntil.setDate(today.getDate() + dueSoonDays);

  return nextRenewalDate >= today && nextRenewalDate <= dueSoonUntil;
}
