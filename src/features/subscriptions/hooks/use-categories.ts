import { useQuery } from "@tanstack/react-query";

import { categoryRepository } from "@/features/subscriptions/repositories/category-repository";

import { categoryKeys } from "./query-keys";

export function loadCategories() {
  return categoryRepository.list();
}

export function loadCategory(id: string) {
  return categoryRepository.getById(id);
}

export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.all,
    queryFn: loadCategories,
    staleTime: Number.POSITIVE_INFINITY,
  });
}

export function useCategory(id: string) {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: () => loadCategory(id),
    staleTime: Number.POSITIVE_INFINITY,
    enabled: id !== "new",
  });
}
