import { useMutation, useQueryClient } from "@tanstack/react-query";

import { subscriptionRepository } from "@/features/subscriptions/repositories/subscription-repository";
import { useUiStore } from "@/features/subscriptions/store/ui-store";
import type { CreateSubscriptionInput } from "@/features/subscriptions/view-models";
import { afterSubscriptionDomainChange } from "@/lib/mutations/after-subscription-domain-change";

export function useAddSubscription() {
  const queryClient = useQueryClient();
  const showToast = useUiStore((state) => state.showToast);

  return useMutation({
    mutationFn: (input: CreateSubscriptionInput) => subscriptionRepository.create(input),
    onSuccess: async () => {
      await afterSubscriptionDomainChange(queryClient);
      showToast("Subscription saved.");
    },
    onError: (error) => {
      if (__DEV__) {
        console.error("[useAddSubscription] failed to save subscription", error);
      }
      showToast("Could not save subscription. Try again.");
    },
  });
}
