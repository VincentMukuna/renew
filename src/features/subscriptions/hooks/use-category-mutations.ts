import { useMutation, useQueryClient } from "@tanstack/react-query";

import { categoryRepository } from "@/features/subscriptions/repositories/category-repository";
import { useUiStore } from "@/features/subscriptions/store/ui-store";
import { invalidateCategoryQueries } from "@/lib/query/invalidate-queries";

export function useCreateCategory() {
  const queryClient = useQueryClient();
  const showToast = useUiStore((state) => state.showToast);

  return useMutation({
    mutationFn: (name: string) => categoryRepository.create(name),
    onSuccess: async () => {
      await invalidateCategoryQueries(queryClient);
      showToast("Category saved.");
    },
    onError: (error) => {
      if (__DEV__) {
        console.error("[useCreateCategory] failed", error);
      }
      showToast("Could not save category.");
    },
  });
}

export function useRenameCategory() {
  const queryClient = useQueryClient();
  const showToast = useUiStore((state) => state.showToast);

  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      categoryRepository.rename(id, name),
    onSuccess: async () => {
      await invalidateCategoryQueries(queryClient);
      showToast("Category updated.");
    },
    onError: (error) => {
      if (__DEV__) {
        console.error("[useRenameCategory] failed", error);
      }
      showToast("Could not update category.");
    },
  });
}

export function useArchiveCategory() {
  const queryClient = useQueryClient();
  const showToast = useUiStore((state) => state.showToast);

  return useMutation({
    mutationFn: (id: string) => categoryRepository.archive(id),
    onSuccess: async () => {
      await invalidateCategoryQueries(queryClient);
      showToast("Category archived.");
    },
    onError: (error) => {
      if (__DEV__) {
        console.error("[useArchiveCategory] failed", error);
      }
      showToast("Only unused categories can be archived.");
    },
  });
}
