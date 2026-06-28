import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useUiStore } from "@/features/subscriptions/store/ui-store";
import { afterSubscriptionDomainChange } from "@/lib/mutations/after-subscription-domain-change";
import { invalidateCategoryQueries } from "@/lib/query/invalidate-queries";

import { seedSubscriptions } from "../dev/seed-subscriptions";

export function useSeedSubscriptions() {
  const queryClient = useQueryClient();
  const showToast = useUiStore((state) => state.showToast);

  return useMutation({
    mutationFn: () => seedSubscriptions(),
    onSuccess: async (result) => {
      await afterSubscriptionDomainChange(queryClient);
      await invalidateCategoryQueries(queryClient);
      showToast(`Seeded ${result.subscriptions} subscriptions.`);
    },
    onError: (error) => {
      if (__DEV__) {
        console.error("[useSeedSubscriptions] failed", error);
      }
      showToast("Could not seed subscriptions.");
    },
  });
}
