import { create } from 'zustand';

/**
 * Global open/close state for the ⌘K command palette.
 *
 * Kept as its own tiny store so any control (the header search button, a
 * keyboard shortcut, a future onboarding hint) can open the palette without
 * prop-drilling through the layout tree.
 */
interface CommandPaletteState {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
}

export const useCommandPaletteStore = create<CommandPaletteState>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
  toggle: () => set((state) => ({ open: !state.open })),
}));
