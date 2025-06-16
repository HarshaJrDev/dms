// RootLayout.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Redirect, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";
import { useAuthStore } from "@/stores/authStore";
import { QueryClientProvider } from "@tanstack/react-query";
import queryClient from "../config/queryClient";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  // Local loading state while we restore AsyncStorage
  const [isLoading, setIsLoading] = useState(true);

  const { isAuthenticated, setUser } = useAuthStore();

  // On mount, load user from AsyncStorage and update Zustand store
  useEffect(() => {
    const restoreUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        }
      } catch (error) {
        console.warn("Failed to restore user from AsyncStorage:", error);
      } finally {
        setIsLoading(false);
      }
    };

    restoreUser();
  }, [setUser]);

  if (!loaded || isLoading) {
    // Wait for fonts to load and AsyncStorage restore to finish
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        {isAuthenticated ? (
          <Redirect href="/(tabs)" />
        ) : (
          <Redirect href="/(auth)/login" />
        )}
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          {/* add other screens here */}
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
