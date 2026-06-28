import type { QueryClient } from "@tanstack/react-query";

import { categoryKeys, subscriptionKeys } from "@/features/subscriptions/hooks/query-keys";

export function invalidateSubscriptionQueries(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: subscriptionKeys.all }),
    queryClient.invalidateQueries({ queryKey: subscriptionKeys.summaries }),
    queryClient.invalidateQueries({ queryKey: subscriptionKeys.stats }),
  ]);
}

export function invalidateCategoryQueries(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: categoryKeys.all });
}

/** Invalidates list caches touched by subscription mutations. */
export function invalidateAfterSubscriptionMutation(
  queryClient: QueryClient,
  options: { id?: string } = {},
) {
  const invalidations: Promise<unknown>[] = [
    queryClient.invalidateQueries({ queryKey: subscriptionKeys.all }),
    queryClient.invalidateQueries({ queryKey: subscriptionKeys.summaries }),
    queryClient.invalidateQueries({ queryKey: subscriptionKeys.stats }),
  ];

  if (options.id) {
    invalidations.push(
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.detail(options.id) }),
    );
  }

  return Promise.all(invalidations);
}
