import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

export default function PickupHistoryScreen() {
  const [pickupHistory, setPickupHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchPickupHistory = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        const parsedUser = JSON.parse(userData);
        const driverId = parsedUser?.id;

        if (!driverId) {
          console.warn("Driver ID not found");
          return;
        }

        const response = await axios.get(
          `http://193.203.163.114:5000/api/drivers/driver-pickup-history/${driverId}`
        );

        setPickupHistory(response.data || []);
      } catch (err) {
        console.error("Error fetching pickup history", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPickupHistory();
  }, []);

  const formatDate = (dateString) => {
    const options = { weekday: "short", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pickup History</Text>
      </View>

      <ScrollView style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#4A6FE3" />
        ) : pickupHistory.length === 0 ? (
          <Text style={{ textAlign: "center", marginTop: 20, color: "#888" }}>
            No pickup history found.
          </Text>
        ) : (
          pickupHistory.map((pickup) => (
            <View key={pickup.id} style={styles.pickupCard}>
              {/* Date and Status */}
              <View style={styles.pickupHeader}>
                <View style={styles.dateContainer}>
                  <Text style={styles.dateText}>
                    {formatDate(pickup.pickupDate)}
                  </Text>
                  <Text style={styles.timeText}>--</Text>
                </View>
                <View style={styles.statusBadge}>
                  <MaterialIcons name="check-circle" size={14} color="#4CAF50" />
                  <Text style={styles.statusText}>Completed</Text>
                </View>
              </View>

              {/* Donor Info */}
              <View style={styles.donorInfo}>
                <View style={styles.donorAvatar}>
                  <Text style={styles.avatarText}>
                    {pickup.donorName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </Text>
                </View>
                <View style={styles.donorDetails}>
                  <Text style={styles.donorName}>{pickup.donorName}</Text>
                  <View style={styles.locationContainer}>
                    <MaterialIcons name="location-on" size={14} color="#757575" />
                    <Text style={styles.addressText}>{pickup.pickupLocation}</Text>
                  </View>
                </View>
              </View>

              {/* Items */}
              <View style={styles.itemsContainer}>
                <Text style={styles.itemsLabel}>Items:</Text>
                <Text style={styles.itemsText}>
                  {pickup.donationItems.map((item) => item.name).join(", ")}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F8FF" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    paddingTop: 50,
    backgroundColor: "#4A6FE3",
  },
  backButton: { marginRight: 16 },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
  },
  content: { flex: 1, padding: 16 },
  pickupCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  pickupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  dateContainer: { flexDirection: "column" },
  dateText: { fontSize: 14, fontWeight: "600", color: "#4A6FE3" },
  timeText: { fontSize: 12, color: "#757575", marginTop: 2 },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: "#4CAF50",
    marginLeft: 4,
    fontWeight: "500",
  },
  donorInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  donorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4A6FE3",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  donorDetails: { flex: 1 },
  donorName: { fontSize: 16, fontWeight: "600", color: "#333", marginBottom: 4 },
  locationContainer: { flexDirection: "row", alignItems: "center" },
  addressText: { fontSize: 13, color: "#757575", marginLeft: 4 },
  itemsContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  itemsLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#757575",
    marginRight: 6,
  },
  itemsText: { fontSize: 13, color: "#333" },
});
