import { useQuery } from "@tanstack/react-query";

import {
  toSubscriptionListItemView,
  toSubscriptionStatsView,
} from "@/features/subscriptions/lib/mappers";
import { subscriptionRepository } from "@/features/subscriptions/repositories/subscription-repository";

import { subscriptionKeys } from "./query-keys";

export async function loadSubscriptions() {
  const now = new Date();
  const summaries = await subscriptionRepository.listSummaries();

  return summaries.map((subscription) => toSubscriptionListItemView(subscription, now));
}

export async function loadSubscriptionSummaries() {
  return subscriptionRepository.listSummaries();
}

export async function loadSubscriptionStats() {
  const now = new Date();
  const summaries = await subscriptionRepository.listSummaries();

  return toSubscriptionStatsView(summaries, now);
}

export function useSubscriptions() {
  return useQuery({
    queryKey: subscriptionKeys.all,
    queryFn: loadSubscriptions,
    staleTime: Number.POSITIVE_INFINITY,
  });
}

export function useSubscriptionSummaries() {
  return useQuery({
    queryKey: subscriptionKeys.summaries,
    queryFn: loadSubscriptionSummaries,
    staleTime: Number.POSITIVE_INFINITY,
  });
}

export function useSubscriptionStats() {
  return useQuery({
    queryKey: subscriptionKeys.stats,
    queryFn: loadSubscriptionStats,
    staleTime: Number.POSITIVE_INFINITY,
  });
}
