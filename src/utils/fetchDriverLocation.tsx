import { useQuery } from "@tanstack/react-query";
import * as Location from "expo-location";
import { Alert } from "react-native";

const fetchDriverLocation = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    Alert.alert("Permission Denied", "Location permission is required.");
    throw new Error("Location permission denied");
  }

  const location = await Location.getCurrentPositionAsync({});
  return location.coords;
};

export const useDriverLocation = (enabled = true) => {
  return useQuery({
    queryKey: ["driverLocation"],
    queryFn: fetchDriverLocation,
    enabled, // Only fetch if enabled is true
    staleTime: 1000 * 30, // Cache for 30 seconds
    retry: false,
  });
};
