import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  TouchableWithoutFeedback,
  PermissionsAndroid,
  Platform,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Geolocation from "@react-native-community/geolocation";
import { useNavigation } from "@react-navigation/native";
import TodaysPickups from "../components/Pickups/TodaysPickups";
import { ErrorBoundary } from "../../Debug/ErrorBoundary";


// const RouteOptimizationModal = ({ visible, onClose }) => {
//   const [startingPlace, setStartingPlace] = useState("");
//   const [startTime, setStartTime] = useState("");
//   const [returnTime, setReturnTime] = useState("");
//   const [unloadNoon, setUnloadNoon] = useState(false);

//   return (
//     <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
//       <TouchableWithoutFeedback onPress={onClose}>
//         <View style={styles.modalOverlay} />
//       </TouchableWithoutFeedback>

//       <View style={styles.modalContainer}>
//         <View style={styles.modalHeader}>
//           <Text style={styles.modalTitle}>Route Optimization</Text>
//           <TouchableOpacity onPress={onClose}>
//             <MaterialIcons name="close" size={24} color="#666" />
//           </TouchableOpacity>
//         </View>

//         <View style={styles.modalContent}>
//           <View style={styles.inputContainer}>
//             <Text style={styles.inputLabel}>Starting Place</Text>
//             <TextInput
//               style={styles.input}
//               placeholder="Enter starting location"
//               value={startingPlace}
//               onChangeText={setStartingPlace}
//             />
//           </View>

//           <View style={styles.inputContainer}>
//             <Text style={styles.inputLabel}>Start Time</Text>
//             <TextInput
//               style={styles.input}
//               placeholder="HH:MM AM/PM"
//               value={startTime}
//               onChangeText={setStartTime}
//             />
//           </View>

//           <View style={styles.inputContainer}>
//             <Text style={styles.inputLabel}>Return Time</Text>
//             <TextInput
//               style={styles.input}
//               placeholder="HH:MM AM/PM"
//               value={returnTime}
//               onChangeText={setReturnTime}
//             />
//           </View>

//           <View style={styles.checkboxContainer}>
//             <TouchableOpacity
//               style={[styles.checkbox, unloadNoon && styles.checkboxChecked]}
//               onPress={() => setUnloadNoon(!unloadNoon)}
//             >
//               {unloadNoon && <MaterialIcons name="check" size={18} color="#fff" />}
//             </TouchableOpacity>
//             <Text style={styles.checkboxLabel}>Unload truck at noon and continue</Text>
//           </View>

//           <TouchableOpacity style={styles.submitButton}>
//             <Text style={styles.submitButtonText}>Optimize Route</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </Modal>
//   );
// };

const HomeScreen = () => {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [userName, setUserName] = useState("User");
  const [locationName, setLocationName] = useState("Fetching location...");

  const requestLocationPermission = async () => {
    if (Platform.OS === "android") {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        const parsedUser = JSON.parse(userData);
        setUserName(parsedUser?.name || "User");

        const hasPermission = await requestLocationPermission();
        if (!hasPermission) {
          setLocationName("Permission denied");
          return;
        }

        Geolocation.getCurrentPosition(
          async (pos) => {
            const { latitude, longitude } = pos.coords;
            // Optional: use a reverse geocoding API like OpenCage or Google Maps
            setLocationName(`Lat: ${latitude.toFixed(3)}, Lon: ${longitude.toFixed(3)}`);
          },
          (error) => {
            console.log(error);
            setLocationName("Location unavailable");
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
      } catch (err) {
        console.error("Error fetching location:", err);
        setLocationName("Location unavailable");
      }
    };

    fetchData();
  }, []);

  return (
    <ErrorBoundary>
        <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.profileHeader}>
            <View style={styles.profileInfo}>
              <View style={styles.profileImageContainer}>
                <MaterialIcons name="person" size={24} color="#fff" />
              </View>
              <View style={styles.profileText}>
                <Text style={styles.welcomeText}>Good Morning</Text>
                <Text style={styles.userName}>{userName}</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate("Notifications")}
              style={styles.notificationsContainer}
            >
              <MaterialIcons name="notifications" size={24} color="#fff" />
              <View style={styles.notificationBadge} />
            </TouchableOpacity>
          </View>

          <View style={styles.locationContainer}>
            <MaterialIcons name="location-on" size={16} color="#fff" />
            <Text style={styles.locationText}>{locationName}</Text>
          </View>
        </View>
      </View>

      <TodaysPickups />
      {/* <RouteOptimizationModal visible={modalVisible} onClose={() => setModalVisible(false)} /> */}
    </View>

    </ErrorBoundary>
  
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    backgroundColor: "#4A6FE3",
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerContent: {
    paddingTop: 50,
    paddingHorizontal: 24,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  profileText: {
    gap: 4,
  },
  welcomeText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
  },
  userName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  profileImageContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  notificationsContainer: {
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    right: -4,
    top: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF5252",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  locationText: {
    color: "#fff",
    fontSize: 14,
    marginLeft: 6,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  seeAll: {
    fontSize: 14,
    color: "#4A6FE3",
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "50%",
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingTop: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  modalContent: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    marginBottom: 5,
    fontSize: 14,
    color: "#666",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1,
    borderColor: "#4A6FE3",
    borderRadius: 4,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#4A6FE3",
  },
  checkboxLabel: {
    fontSize: 14,
    color: "#333",
  },
  submitButton: {
    backgroundColor: "#4A6FE3",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
