import type { SubscriptionListItemView } from "@/features/subscriptions/view-models";

export type SubscriptionFilterKey = "all" | "active" | "inactive" | "due-soon";

export function filterSubscriptions(
  subscriptions: SubscriptionListItemView[],
  filter: SubscriptionFilterKey,
  query: string,
): SubscriptionListItemView[] {
  const normalizedQuery = query.trim().toLowerCase();
  const result: SubscriptionListItemView[] = [];

  for (const subscription of subscriptions) {
    if (filter === "active" && !subscription.isActive) continue;
    if (filter === "inactive" && subscription.isActive) continue;
    if (filter === "due-soon" && !subscription.isDueSoon) continue;

    if (
      normalizedQuery.length > 0 &&
      !`${subscription.name} ${subscription.planName} ${subscription.categoryName}`
        .toLowerCase()
        .includes(normalizedQuery)
    ) {
      continue;
    }

    result.push(subscription);
  }

  return result.sort((a, b) => {
    if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
    return a.nextRenewalDate.localeCompare(b.nextRenewalDate);
  });
}

export function computeSubscriptionCounts(subscriptions: SubscriptionListItemView[]) {
  let active = 0;
  let inactive = 0;
  let dueSoon = 0;

  for (const subscription of subscriptions) {
    if (subscription.isActive) active += 1;
    else inactive += 1;
    if (subscription.isDueSoon) dueSoon += 1;
  }

  return {
    all: subscriptions.length,
    active,
    inactive,
    dueSoon,
  };
}
