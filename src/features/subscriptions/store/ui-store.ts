import { create } from "zustand";

type ToastState = {
  message: string | null;
  showToast: (message: string) => void;
  clearToast: () => void;
};

export const useUiStore = create<ToastState>((set) => ({
  message: null,
  showToast: (message) => set({ message }),
  clearToast: () => set({ message: null }),
}));
