
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Platform, View, StyleSheet } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Ionicons from "react-native-vector-icons/Ionicons";

import HomeScreen from "../screens/Home";
import ProfileScreen from "../(tabs)/profile";


const Tab = createBottomTabNavigator();

export default function MainTabs() {
  // useEffect(() => {
  //   getFcmToken();
  // }, []);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#4A6FE3",
        tabBarInactiveTintColor: "#999",
        tabBarStyle: Platform.select({
          ios: { position: "absolute", height: 70, paddingBottom: 10 },
          android: { height: 60, paddingBottom: 8 },
        }),
        tabBarBackground: () => <TabBarBackground />,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size || 24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" size={size || 24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Optional: fallback TabBarBackground if you don’t have one
function TabBarBackground() {
  return <View style={styles.tabBarBg} />;
}

const styles = StyleSheet.create({
  tabBarBg: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopColor: "#eee",
    borderTopWidth: 1,
  },
});
