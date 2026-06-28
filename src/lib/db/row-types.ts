export type CategoriesRow = {
  id: string;
  name: string;
  emoji: string;
  sort_order: number;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

export type SubscriptionsRow = {
  id: string;
  category_id: string;
  name: string;
  plan_name: string;
  cost_amount: number;
  start_date: string;
  recurrence: string;
  is_active: number;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

export type SubscriptionEventsRow = {
  id: string;
  subscription_id: string;
  type: string;
  occurred_at: string;
  created_at: string;
};
