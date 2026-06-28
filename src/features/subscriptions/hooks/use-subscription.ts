import { useQuery } from "@tanstack/react-query";

import { toSubscriptionDetailView } from "@/features/subscriptions/lib/mappers";
import { subscriptionRepository } from "@/features/subscriptions/repositories/subscription-repository";

import { subscriptionKeys } from "./query-keys";

export async function loadSubscription(id: string) {
  const now = new Date();
  const subscription = await subscriptionRepository.getById(id);

  return subscription ? toSubscriptionDetailView(subscription, now) : undefined;
}

export function useSubscription(id: string) {
  return useQuery({
    queryKey: subscriptionKeys.detail(id),
    queryFn: () => loadSubscription(id),
    staleTime: Number.POSITIVE_INFINITY,
  });
}
