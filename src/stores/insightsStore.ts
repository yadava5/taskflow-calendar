import { create } from 'zustand';

/** Open/close state for the "Where your week goes" insights panel. */
interface InsightsState {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
}

export const useInsightsStore = create<InsightsState>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
  toggle: () => set((state) => ({ open: !state.open })),
}));
