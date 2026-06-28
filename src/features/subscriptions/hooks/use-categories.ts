import { useQuery } from "@tanstack/react-query";

import { categoryRepository } from "@/features/subscriptions/repositories/category-repository";

import { categoryKeys } from "./query-keys";

export function loadCategories() {
  return categoryRepository.list();
}

export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.all,
    queryFn: loadCategories,
    staleTime: Number.POSITIVE_INFINITY,
  });
}
