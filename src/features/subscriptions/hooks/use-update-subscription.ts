import { useMutation, useQueryClient } from "@tanstack/react-query";

import { subscriptionRepository } from "@/features/subscriptions/repositories/subscription-repository";
import { useUiStore } from "@/features/subscriptions/store/ui-store";
import type { UpdateSubscriptionInput } from "@/features/subscriptions/view-models";
import { afterSubscriptionDomainChange } from "@/lib/mutations/after-subscription-domain-change";

type UpdateSubscriptionMutationInput = {
  id: string;
  input: UpdateSubscriptionInput;
};

export function useUpdateSubscription() {
  const queryClient = useQueryClient();
  const showToast = useUiStore((state) => state.showToast);

  return useMutation({
    mutationFn: ({ id, input }: UpdateSubscriptionMutationInput) =>
      subscriptionRepository.update(id, input),
    onSuccess: async (_result, { id }) => {
      await afterSubscriptionDomainChange(queryClient, { id });
      showToast("Subscription updated.");
    },
    onError: (error) => {
      if (__DEV__) {
        console.error("[useUpdateSubscription] failed", error);
      }
      showToast("Could not update subscription. Try again.");
    },
  });
}
