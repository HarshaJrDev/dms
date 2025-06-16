import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/Home";

import { Platform } from "react-native";
import  MaterialIcons from "react-native-vector-icons/MaterialIcons";
// import { useColorScheme } from "../hooks/useColorScheme";
import { IconSymbol } from "../components/ui/IconSymbol";
import { HapticTab } from "../components/HapticTab";
import TabBarBackground from "../components/ui/TabBarBackground";
import { Colors } from "../constants/Colors";
import { getFcmToken } from "../services/FCMService";
import ProfileScreen from "../(tabs)/profile";

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  React.useEffect(() => {
    getFcmToken();
  }, []);

//   const colorScheme = useColorScheme();

  return (
    <Tab.Navigator
      screenOptions={{
        // tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: () => <TabBarBackground />,
        tabBarStyle: Platform.select({
          ios: { position: "absolute" },
          default: {},
        }),
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="person" size={24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
