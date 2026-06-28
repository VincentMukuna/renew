export type Recurrence =
  | "weekly"
  | "bi_weekly"
  | "monthly"
  | "bi_monthly"
  | "quarterly"
  | "yearly"
  | "bi_yearly"
  | "every_3_years";

export type Category = {
  id: string;
  name: string;
  emoji: string;
  sortOrder: number;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Subscription = {
  id: string;
  categoryId: string;
  name: string;
  planName: string;
  costAmount: number;
  startDate: string;
  recurrence: Recurrence;
  isActive: boolean;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
};
