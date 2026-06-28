export const lightStatusColors = {
  active: { bg: "#EEF2FF", text: "#3730A3" },
  inactive: { bg: "#F1F5F9", text: "#64748B" },
  dueSoon: { bg: "#FFFBEB", text: "#B45309" },
} as const;

export const darkStatusColors = {
  active: { bg: "#1E1B4B", text: "#C7D2FE" },
  inactive: { bg: "#1F2937", text: "#CBD5E1" },
  dueSoon: { bg: "#3B2A10", text: "#FCD34D" },
} as const;
