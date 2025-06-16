import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function OngoingPickups() {
  const router = useRouter();
  // Sample data - in a real app, this would come from props or state
  const pickup = {
    id: "PK-78245",
    customer: "John Smith",
    pickupLocation: "123 Main Street, San Francisco",
    dropoffLocation: "456 Market St, San Francisco",
    estimatedTime: "15 min",
    distance: "3.2 mi",
    amount: "$24.50",
    status: "On the way to pickup",
    timeSlot: "12:30 PM - 1:00 PM",
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ongoing Pickup</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{pickup.status}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.orderInfo}>
          <View style={styles.orderIdSection}>
            <Text style={styles.orderIdLabel}>Order ID</Text>
            <Text style={styles.orderId}>{pickup.id}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.locationSection}>
          <View style={styles.locationLine}>
            <View style={styles.locationDot} />
            <View style={styles.locationInfo}>
              <Text style={styles.label}>Pickup</Text>
              <Text style={styles.value}>{pickup.pickupLocation}</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.mainButton}
            onPress={() => {
              router.push("/map-navigation");
            }}
          >
            <Text style={styles.mainButtonText}>Navigate</Text>
            <MaterialIcons
              name="navigation"
              size={18}
              color="#FFFFFF"
              style={styles.buttonIcon}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  statusBadge: {
    backgroundColor: "#e3f2fd",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    color: "#4A6FE3",
    fontSize: 12,
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#FFFFFF",
  },
  orderInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  orderIdSection: {},
  orderIdLabel: {
    fontSize: 12,
    color: "#757575",
  },
  orderId: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#212121",
  },
  timeSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeSlot: {
    fontSize: 14,
    color: "#424242",
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "#EEEEEE",
    marginVertical: 12,
  },
  customerSection: {
    flexDirection: "row",
    marginBottom: 16,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#2196F3",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  customerInfo: {
    flex: 1,
  },
  locationSection: {
    marginBottom: 16,
  },
  locationLine: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginVertical: 6,
  },
  locationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#FF9800",
    marginTop: 5,
    marginRight: 12,
  },
  locationConnector: {
    width: 2,
    height: 34,
    backgroundColor: "#BDBDBD",
    marginLeft: 5,
  },
  locationInfo: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: "#757575",
    marginBottom: 2,
  },
  value: {
    fontSize: 14,
    color: "#212121",
    lineHeight: 20,
  },
  detailsSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#555",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    alignItems: "center",
    marginRight: 8,
  },
  cancelButtonText: {
    color: "#757575",
    fontWeight: "600",
  },
  mainButton: {
    flex: 2,
    flexDirection: "row",
    backgroundColor: "#4A6FE3",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  mainButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    marginRight: 6,
  },
  buttonIcon: {
    marginLeft: 4,
  },
});
