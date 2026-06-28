import type { Category, Recurrence } from "@/types";

export type CreateSubscriptionInput = {
  name: string;
  categoryId: string;
  planName: string;
  costAmount: number;
  startDate: string;
  recurrence: Recurrence;
  isActive: boolean;
};

export type UpdateSubscriptionInput = Partial<CreateSubscriptionInput>;

export type CategoryDetailView = Category & {
  subscriptionCount: number;
};

export type SubscriptionSummary = {
  id: string;
  categoryId: string;
  categoryName: string;
  categoryEmoji: string;
  name: string;
  planName: string;
  costAmount: number;
  startDate: string;
  recurrence: Recurrence;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SubscriptionListItemView = {
  id: string;
  initials: string;
  name: string;
  planName: string;
  categoryName: string;
  categoryEmoji: string;
  amountLabel: string;
  renewalLabel: string;
  nextRenewalDate: string;
  isActive: boolean;
  isDueSoon: boolean;
};

export type SubscriptionDetailView = SubscriptionListItemView & {
  costAmount: number;
  startDateLabel: string;
  recurrenceLabel: string;
  monthlyEstimateLabel: string;
  yearlyEstimateLabel: string;
  totalSpentEstimateLabel: string;
};

export type SubscriptionStatsView = {
  activeCount: number;
  dueSoonCount: number;
  monthlyExpenses: number;
  yearlyExpenses: number;
  totalSpentEstimate: number;
};
