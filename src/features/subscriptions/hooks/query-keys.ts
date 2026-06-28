export const categoryKeys = {
  all: ["categories"] as const,
};

export const subscriptionKeys = {
  all: ["subscriptions"] as const,
  stats: ["subscriptions", "stats"] as const,
  detail: (id: string) => ["subscriptions", id] as const,
};
