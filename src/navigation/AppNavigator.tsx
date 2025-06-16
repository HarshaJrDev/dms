import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuthStore } from "../stores/authStore";
import LoginScreen from "../screens/Login";
import MainTabs from "./MainTabs";
import MapNavigationScreen from "../screens/mapnavigation";
import NotificationsScreen from "../screens/notifications";
import PickupHistoryScreen from "../screens/pickup-history";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen
            name="MapNavigation"
            component={MapNavigationScreen}
            options={{
              headerShown: true,
              title: "Navigation",
              headerStyle: { backgroundColor: "#4A6FE3" },
              headerTintColor: "#fff",
            }}
          />
          <Stack.Screen
            name="Notifications"
            component={NotificationsScreen}
            options={{
              headerShown: true,
              title: "Notifications",
              headerStyle: { backgroundColor: "#4A6FE3" },
              headerTintColor: "#fff",
            }}
          />
          <Stack.Screen
            name="PickupHistory"
            component={PickupHistoryScreen}
          />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}
