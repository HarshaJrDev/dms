import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id?: string;
  name?: string;
  email?: string;
  // ... other fields
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create(
  persist<AuthState>(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: user !== null }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: "auth-storage", // unique name for storage key
      getStorage: () => AsyncStorage, // use AsyncStorage here
    }
  )
);
