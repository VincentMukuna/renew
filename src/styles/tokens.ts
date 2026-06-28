/** Semantic status colors — independent of the selected brand color theme. */
export const lightStatusColors = {
  active: { bg: "#EEF2FF", text: "#253A8A" },
  inactive: { bg: "#F1F5F9", text: "#64748B" },
  dueSoon: { bg: "#FFF7ED", text: "#EA580C" },
} as const;

export const darkStatusColors = {
  active: { bg: "#1E1B4B", text: "#C7D2FE" },
  inactive: { bg: "#1F2937", text: "#CBD5E1" },
  dueSoon: { bg: "#431407", text: "#FB923C" },
} as const;
