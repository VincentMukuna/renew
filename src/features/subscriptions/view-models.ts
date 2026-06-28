import type { Recurrence } from "@/types";

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

export type SubscriptionSummary = {
  id: string;
  categoryId: string;
  categoryName: string;
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
