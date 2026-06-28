import { z } from "zod";

import type { Recurrence } from "@/types";

const recurrenceValues = [
  "weekly",
  "bi_weekly",
  "monthly",
  "bi_monthly",
  "quarterly",
  "yearly",
  "bi_yearly",
  "every_3_years",
] as const satisfies readonly Recurrence[];

export const addSubscriptionSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  categoryId: z.string().min(1, "Category is required"),
  planName: z.string().trim().min(1, "Plan name is required"),
  cost: z
    .string()
    .trim()
    .refine((value) => {
      const parsed = parseInt(value, 10);
      return !Number.isNaN(parsed) && parsed > 0;
    }, "Cost must be greater than zero"),
  startDate: z.string().min(1, "Start date is required"),
  recurrence: z.enum(recurrenceValues),
  isActive: z.boolean(),
});

export type AddSubscriptionFormValues = z.infer<typeof addSubscriptionSchema>;

export function formValuesToCreateInput(values: AddSubscriptionFormValues) {
  return {
    name: values.name.trim(),
    categoryId: values.categoryId,
    planName: values.planName.trim(),
    costAmount: parseInt(values.cost, 10),
    startDate: values.startDate,
    recurrence: values.recurrence,
    isActive: values.isActive,
  };
}
