import { create } from 'zustand';

type RouteState = {
  optimizedRouteData: any;
  setOptimizedRouteData: (data: any) => void;
};

export const useRouteStore = create<RouteState>((set) => ({
  optimizedRouteData: null,
  setOptimizedRouteData: (data) => set({ optimizedRouteData: data }),
}));