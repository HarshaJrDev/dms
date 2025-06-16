import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "react-native";
import queryClient from "./src/config/queryClient";

import { useFCM } from "./src/helpers/Notification";
import AppNavigator from "./src/navigation/AppNavigator";
import { ErrorBoundary } from "./Debug/ErrorBoundary";
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://02c9e54e9d235bf29c294a845bc31227@o4509506603188224.ingest.us.sentry.io/4509506605023232',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,
enableNative: true,
  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
   spotlight: __DEV__,
});

export default Sentry.wrap(function App() {

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
});