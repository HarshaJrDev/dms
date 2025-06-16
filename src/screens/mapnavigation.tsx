import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import { launchImageLibrary } from 'react-native-image-picker';
import Geolocation from 'react-native-geolocation-service';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  PermissionsAndroid,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useNavigation, useRoute } from '@react-navigation/native';

// Assuming styles are in the same directory structure
import styles from '../Styles/styles';

// ====== CONFIGURATION ======
const RADAR_API_KEY = "prj_test_pk_a802b5e90e1bbd8d7cd6b518e91fc4638189e66c";
const API_URL = "http://193.203.163.114:5000/api/donations/updateDonationStatus";

// ====== MAIN COMPONENT ======
export default function MapNavigationScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { orders, currentLat, currentLong } = route.params || {};
  const [order, setOrder] = useState(null);
  const [location, setLocation] = useState(null);
  const [polylineCoords, setPolylineCoords] = useState([]);
  const [routeLoading, setRouteLoading] = useState(false);
  const [totalDistance, setTotalDistance] = useState("");
  const [totalDuration, setTotalDuration] = useState("");
  const [orderDetailsModal, setOrderDetailsModal] = useState({ visible: false });
  const [completionModal, setCompletionModal] = useState({ visible: false });
  const [failureModal, setFailureModal] = useState({ visible: false });
  const [itemImages, setItemImages] = useState({});
  const [checkedItems, setCheckedItems] = useState({});
  const [failureReason, setFailureReason] = useState("");
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  // Parse orders from navigation params
  useEffect(() => {
    try {
      const parsedOrders = JSON.parse(orders || "[]");
      if (parsedOrders.length > 0) {
        setOrder(parsedOrders[0]);
      } else {
        Alert.alert("Error", "No orders available.");
        navigation.goBack();
      }
    } catch (e) {
      console.error("Error parsing orders:", e);
      Alert.alert("Error", "Invalid order data.");
      navigation.goBack();
    }
  }, [orders]);

  // ====== LOCATION ======
  useEffect(() => {
    const requestLocationPermission = async () => {
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: 'Location Permission',
              message: 'This app needs access to your location.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          );
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            Alert.alert("Permission to access location was denied");
            return;
          }
        } catch (err) {
          console.warn(err);
          return;
        }
      }

      Geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: parseFloat(currentLat) || position.coords.latitude,
            longitude: parseFloat(currentLong) || position.coords.longitude,
          });
        },
        (error) => {
          console.error(error);
          Alert.alert("Error", "Could not get location: " + error.message);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    };

    requestLocationPermission();
  }, [currentLat, currentLong]);

  // ====== RADAR ROUTING FOR SINGLE STOP ======
  useEffect(() => {
    const getRadarRoute = async (origin, destination) => {
      const url = `https://api.radar.io/v1/route/distance?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&modes=car&geometry=linestring&units=metric`;
      const response = await fetch(url, {
        headers: { Authorization: RADAR_API_KEY },
      });
      const data = await response.json();
      if (data.routes && data.routes.car) {
        const dist = data.routes.car.distance.text;
        const dur = data.routes.car.duration.text;
        let coords = [];
        const lineString = data.routes.car.geometry;
        if (lineString && lineString.type === "LineString") {
          coords = lineString.coordinates.map(([lng, lat]) => ({
            latitude: lat,
            longitude: lng,
          }));
        } else {
          coords = [origin, destination];
        }
        return {
          coords,
          dist,
          dur,
          distValue: data.routes.car.distance.value,
          durValue: data.routes.car.duration.value,
        };
      }
      return {
        coords: [origin, destination],
        dist: "?",
        dur: "?",
        distValue: 0,
        durValue: 0,
      };
    };

    const getRoute = async () => {
      if (!location || !order) return;
      setRouteLoading(true);
      try {
        const { coords, dist, dur } = await getRadarRoute(location, {
          latitude: order.latitude,
          longitude: order.longitude,
        });
        setPolylineCoords(coords);
        setTotalDistance(dist);
        setTotalDuration(dur);
      } catch (e) {
        console.error("Error fetching route:", e);
        setPolylineCoords([location, { latitude: order.latitude, longitude: order.longitude }]);
      } finally {
        setRouteLoading(false);
      }
    };
    getRoute();
  }, [location, order]);

  // ====== ORDER CARD ======
  const renderOrderCard = () => {
    if (!order) return null;
    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => setOrderDetailsModal({ visible: true })}
        activeOpacity={0.85}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>B</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.donorName}>{order.donorName}</Text>
            <Text style={styles.orderTime}>
              {order.scheduledTime} (ETA: {order.eta})
            </Text>
            <Text style={styles.orderAddress}>{order.address}</Text>
            <Text style={styles.orderStatus}>
              Status: {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // ====== MODALS ======
  const openCompletionModal = () => {
    const initialChecked = {};
    order.donationItems.forEach((item) => (initialChecked[item.id] = false));
    setCheckedItems(initialChecked);
    setItemImages({});
    setCompletionModal({ visible: true });
  };

  const pickImageFromCamera = async (itemId) => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'This app needs access to your camera.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert("Permission Required", "Camera access is required to take photos.");
          return;
        }

        const grantedStorage = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'This app needs access to your storage to save photos.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (grantedStorage !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert("Permission Required", "Storage access is required to save photos.");
          return;
        }
      }

      const result = await launchImageLibrary({
        mediaType: 'photo',
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.didCancel && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setItemImages((prev) => ({
          ...prev,
          [itemId]: uri,
        }));
      }
    } catch (error) {
      console.error("Error in pickImageFromCamera:", error);
      Alert.alert("Error", "Something went wrong while taking a photo.");
    }
  };

  const toggleItemCheck = (itemId) => {
    setCheckedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const submitCompletion = async () => {
    if (!order) return;
    setLoadingSubmit(true);
    try {
      const formData = new FormData();
      formData.append("requestId", String(order.id));
      const itemsArr = order.donationItems.map((item) => {
        const obj = {
          id: String(item.id),
          status: checkedItems[item.id] ? "completed" : "rejected",
        };
        if (!checkedItems[item.id]) {
          obj.rejectionReason = "Not collected";
        }
        return obj;
      });
      formData.append("items", JSON.stringify(itemsArr));
      formData.append("requestStatus", "completed");
      formData.append("rejectionReason", "completed the request with selected items");
      for (const item of order.donationItems) {
        const imgUri = itemImages[item.id];
        if (imgUri) {
          let name = imgUri.split("/").pop() || `item-${item.id}.jpg`;
          let type = "image/jpeg";
          if (name.endsWith(".png")) type = "image/png";
          formData.append(`item-image-${item.id}`, {
            uri: imgUri,
            name,
            type,
          });
        }
      }
      await axios.post(API_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      Alert.alert("Completed!", "Pickup completed and status updated.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      console.error("Error submitting completion:", e);
      Alert.alert("Error", "Could not update pickup status: " + (e.message || ""));
    } finally {
      setLoadingSubmit(false);
    }
  };

  const submitFailure = async () => {
    if (!order) return;
    setLoadingSubmit(true);
    try {
      const formData = new FormData();
      formData.append("requestId", String(order.id));
      formData.append("requestStatus", "rejected");
      formData.append("rejectionReason", failureReason);
      await axios.post(API_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      Alert.alert("Marked Failed", failureReason, [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      console.error("Error submitting failure:", e);
      Alert.alert("Error", "Could not update pickup status.");
    } finally {
      setLoadingSubmit(false);
    }
  };

  // ====== UI MODERN MODALS ======
  const renderOrderDetailsModal = () => {
    if (!order) return null;
    return (
      <Modal
        visible={orderDetailsModal.visible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setOrderDetailsModal({ visible: false })}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Order Details</Text>
            <Text style={styles.modalLabel}>
              Donor: <Text style={{ color: "#333" }}>{order.donorName}</Text>
            </Text>
            <Text style={styles.modalLabel}>
              Time: <Text style={{ color: "#333" }}>{order.scheduledTime}</Text>
            </Text>
            <Text style={styles.modalLabel}>
              ETA: <Text style={{ color: "#333" }}>{order.eta}</Text>
            </Text>
            <Text style={styles.modalLabel}>
              Address: <Text style={{ color: "#333" }}>{order.address}</Text>
            </Text>
            <Text style={styles.modalLabel}>
              Items: <Text style={{ color: "#333" }}>{order.donationItems.length} items</Text>
            </Text>
            <View>
              {order.donationItems.map((item) => (
                <View key={item.id} style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                  <MaterialIcons name="inventory" size={18} color="#4A6FE3" />
                  <Text style={{ marginLeft: 6 }}>
                    {item.name || "Item"} - {item.description || "No description"}
                  </Text>
                </View>
              ))}
            </View>
            <View style={{ flexDirection: "row", marginTop: 20 }}>
              <TouchableOpacity
                style={[styles.actionButton, styles.failButton]}
                onPress={() => {
                  setOrderDetailsModal({ visible: false });
                  setFailureModal({ visible: true });
                }}
              >
                <MaterialIcons name="close" size={18} color="#fff" />
                <Text style={styles.actionButtonText}>Failed</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.completeButton]}
                onPress={() => {
                  setOrderDetailsModal({ visible: false });
                  openCompletionModal();
                }}
              >
                <MaterialIcons name="check" size={18} color="#fff" />
                <Text style={styles.actionButtonText}>Complete</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={{ marginTop: 15, alignSelf: "center" }}
              onPress={() => setOrderDetailsModal({ visible: false })}
            >
              <Text style={{ color: "#4A6FE3" }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  const renderCompletionModal = () => {
    if (!order) return null;
    return (
      <Modal
        visible={completionModal.visible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCompletionModal({ visible: false })}
      >
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalTitle}>Complete Pickup</Text>
            <Text style={styles.modalLabel}>Select items collected and add photos:</Text>
            {order.donationItems.map((item) => (
              <View
                key={item.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: "#eee",
                  paddingBottom: 10,
                }}
              >
                <TouchableOpacity onPress={() => toggleItemCheck(item.id)}>
                  <MaterialIcons
                    name={checkedItems[item.id] ? "check-box" : "check-box-outline-blank"}
                    size={26}
                    color={checkedItems[item.id] ? "green" : "gray"}
                  />
                </TouchableOpacity>
                <Text style={{ marginLeft: 12, flex: 1 }}>{item.name || "Item"}</Text>
                <TouchableOpacity
                  style={styles.evidenceImageBox}
                  onPress={() => pickImageFromCamera(item.id)}
                >
                  {itemImages[item.id] ? (
                    <Image source={{ uri: itemImages[item.id] }} style={styles.evidencePhoto} />
                  ) : (
                    <MaterialIcons name="camera-alt" size={26} color="gray" />
                  )}
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity
              style={[
                styles.modalButton,
                (Object.values(checkedItems).every((v) => !v) ||
                  order.donationItems.some((item) => checkedItems[item.id] && !itemImages[item.id])) &&
                  styles.modalButtonDisabled,
              ]}
              onPress={submitCompletion}
              disabled={
                Object.values(checkedItems).every((v) => !v) ||
                order.donationItems.some((item) => checkedItems[item.id] && !itemImages[item.id])
              }
            >
              {loadingSubmit ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.modalButtonText}>Submit Completion</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={{ marginTop: 15, alignSelf: "center" }}
              onPress={() => setCompletionModal({ visible: false })}
            >
              <Text style={{ color: "#4A6FE3" }}>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    );
  };

  const renderFailureModal = () => {
    if (!order) return null;
    return (
      <Modal
        visible={failureModal.visible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setFailureModal({ visible: false })}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Failed Pickup</Text>
            <Text style={styles.modalLabel}>Please provide a reason:</Text>
            <TextInput
              style={styles.failureInput}
              placeholder="Enter reason for failure"
              value={failureReason}
              onChangeText={setFailureReason}
              multiline={true}
              numberOfLines={4}
            />
            <View style={styles.failureOptions}>
              <TouchableOpacity
                style={styles.failureOption}
                onPress={() => setFailureReason("Donor not available")}
              >
                <Text style={styles.failureOptionText}>Donor not available</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.failureOption}
                onPress={() => setFailureReason("Items not ready")}
              >
                <Text style={styles.failureOptionText}>Items not ready</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.failureOption}
                onPress={() => setFailureReason("Unable to access pickup location")}
              >
                <Text style={styles.failureOptionText}>Unable to access pickup location</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[styles.modalButton, !failureReason && styles.modalButtonDisabled]}
              onPress={submitFailure}
              disabled={!failureReason}
            >
              {loadingSubmit ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.modalButtonText}>Submit</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={{ marginTop: 15, alignSelf: "center" }}
              onPress={() => setFailureModal({ visible: false })}
            >
              <Text style={{ color: "#4A6FE3" }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  // ====== UI ======
  return (
    <View style={styles.container}>
      {/* MAP */}
      <MapView
        style={StyleSheet.absoluteFillObject}
        initialRegion={{
          latitude: location?.latitude || order?.latitude || 33.4577,
          longitude: location?.longitude || order?.longitude || -112.073,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {/* Driver marker (A) */}
        {location && (
          <Marker coordinate={location} title="Driver Location (A)">
            <MaterialIcons name="person-pin-circle" size={30} color="#4A6FE3" />
          </Marker>
        )}
        {/* Order marker (B) */}
        {order && (
          <Marker
            coordinate={{ latitude: order.latitude, longitude: order.longitude }}
            title={`${order.donorName} (B)`}
            pinColor="#FF5252"
            onPress={() => setOrderDetailsModal({ visible: true })}
          >
            <MaterialIcons
              name={order.scheduledTime.includes("AM") ? "wb-sunny" : "nightlight-round"}
              size={28}
              color="#FF5252"
            />
          </Marker>
        )}
        {/* Polyline */}
        {polylineCoords.length > 1 && (
          <Polyline coordinates={polylineCoords} strokeColor="#4A6FE3" strokeWidth={6} />
        )}
      </MapView>

      {/* Order Card (Bottom card) */}
      <View style={styles.ordersCardContainer}>
        <Text style={styles.ordersHeading}>Current Pickup</Text>
        {order ? (
          renderOrderCard()
        ) : (
          <Text style={{ color: "#A7A7A7" }}>No order selected</Text>
        )}
        {routeLoading ? (
          <ActivityIndicator color="#4A6FE3" />
        ) : (
          <Text style={{ color: "#4A6FE3" }}>
            {polylineCoords.length > 1
              ? `Route ready! Distance: ${totalDistance}, ETA: ${totalDuration}`
              : "Loading route..."}
          </Text>
        )}
      </View>
      {/* Modals */}
      {renderOrderDetailsModal()}
      {renderCompletionModal()}
      {renderFailureModal()}
    </View>
  );
}