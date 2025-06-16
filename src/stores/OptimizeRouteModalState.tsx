import { create } from 'zustand';

interface OptimizeRouteModalState {
  visible: boolean;
  open: () => void;
  close: () => void;
}

export const useOptimizeRouteModalStore = create<OptimizeRouteModalState>((set) => ({
  visible: false,
  open: () => set({ visible: true }),
  close: () => set({ visible: false }),
}));