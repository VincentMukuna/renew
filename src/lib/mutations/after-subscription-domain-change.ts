import type { QueryClient } from "@tanstack/react-query";

import { invalidateAfterSubscriptionMutation } from "@/lib/query/invalidate-queries";

/** Post-write pipeline for changes that affect subscriptions or home metrics. */
export async function afterSubscriptionDomainChange(
  queryClient: QueryClient,
  options: { id?: string } = {},
) {
  await invalidateAfterSubscriptionMutation(queryClient, options);
}
