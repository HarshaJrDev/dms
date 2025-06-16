import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "react-native";
import queryClient from "./src/config/queryClient";

import { useFCM } from "./src/helpers/Notification";
import AppNavigator from "./src/navigation/AppNavigator";
import { ErrorBoundary } from "./Debug/ErrorBoundary";

export default function App() {

  useFCM()
  return (
    <ErrorBoundary>
          <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <AppNavigator />
      </NavigationContainer>
    </QueryClientProvider>

    </ErrorBoundary>

  );
}
