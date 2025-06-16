// RouteOptimizationModal.js
import { useDriverSetup } from "@/hooks/useDriverSetup";
import { usePickups } from "@/hooks/usePickups";
import { useRouteStore } from "@/stores/useRouteStore";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import axios from "axios";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import modalStyles from "../Pickups/Styles/modalStyles";


const RouteOptimizationModal = ({ visible, onClose, onOptimize }) => {
  const [driverId, setDriverId] = useState("");
  const [stopDuration, setStopDuration] = useState("20");
  const [startTime, setStartTime] = useState("10:00 PM");
  const [startType, setStartType] = useState("store");
  const [location, setLocation] = useState(null);
  const [amPickups, setAmPickups] = useState([]);
  const [pmPickups, setPmPickups] = useState([]);
  const [selectedAmPickups, setSelectedAmPickups] = useState([]);
  const [selectedPmPickups, setSelectedPmPickups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const setOptimizedRouteData = useRouteStore((s) => s.setOptimizedRouteData);

  const { getDriverIdAndLocation } = useDriverSetup();

  useEffect(() => {
    if (visible) {
      (async () => {
        try {
          const { driverId, location } = await getDriverIdAndLocation();
          setDriverId(driverId);
          setLocation(location);
        } catch (e) {
          setError(e.message);
        }
      })();
    } else {
      setStopDuration("20");
      setStartTime("10:00 PM");
      setStartType("store");
      setLoading(false);
      setError(null);
      setLocation(null);
      setAmPickups([]);
      setPmPickups([]);
      setSelectedAmPickups([]);
      setSelectedPmPickups([]);
    }
  }, [visible]);

  const { data: pickups, isLoading: pickupsLoading, isError: pickupsError } =
    usePickups(driverId, location?.latitude, location?.longitude, !!(driverId && location));

  useEffect(() => {
    if (pickups && Array.isArray(pickups)) {
      const am = pickups.filter((p) => p.pickupTime === "AM");
      const pm = pickups.filter((p) => p.pickupTime === "PM");
      setAmPickups(am);
      setPmPickups(pm);
      setSelectedAmPickups(am.map((p) => Number(p.id)));
      setSelectedPmPickups(pm.map((p) => Number(p.id)));
    }
  }, [pickups]);

  const togglePickup = (id, type) => {
    const numId = Number(id);
    const update = (prev) =>
      prev.includes(numId) ? prev.filter((pid) => pid !== numId) : [...prev, numId];
    type === "AM"
      ? setSelectedAmPickups(update)
      : setSelectedPmPickups(update);
  };

  const optimizeRoute = async (userId, latitude, longitude, payload) => {
    const url =
      latitude != null && longitude != null
        ? `http://193.203.163.114:5000/api/drivers/route/optimize/${userId}?lat=${latitude}&long=${longitude}`
        : `http://193.203.163.114:5000/api/drivers/route/optimize/${userId}`;
    const response = await axios.post(url, payload, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  };

  const handleOptimize = async () => {
    if (!driverId || !stopDuration || !startTime || !startType) {
      Alert.alert("Missing Fields", "Please fill all fields.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let lat = null;
      let long = null;

      if (startType === "driver") {
        const { location: currentLoc } = await getDriverIdAndLocation();
        lat = currentLoc.latitude;
        long = currentLoc.longitude;
      }

      const body = {
        driverId,
        startLocation: { type: startType },
        stopDuration: parseInt(stopDuration),
        startTime,
        amPickups: selectedAmPickups,
        pmPickups: selectedPmPickups,
      };

      const result = await optimizeRoute(driverId, lat, long, body);
      setOptimizedRouteData(result);
      onOptimize(result);
    } catch (err) {
      const msg = err.response?.data || err.message;
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  const renderPickupSelection = (pickups, type, selectedIds) => (
    <View style={modalStyles.pickupSection}>
      <Text style={modalStyles.sectionTitle}>{type} Pickups</Text>
      {pickups.length === 0 ? (
        <Text style={modalStyles.noPickupsText}>No {type} pickups available</Text>
      ) : (
        pickups.map((pickup) => (
          <TouchableOpacity
            key={pickup.id}
            style={modalStyles.pickupItem}
            onPress={() => togglePickup(pickup.id, type)}
          >
            <MaterialIcons
              name={selectedIds.includes(Number(pickup.id)) ? "check-box" : "check-box-outline-blank"}
              size={20}
              color={selectedIds.includes(pickup.id) ? "#6366F1" : "#6B7280"}
            />
            <View style={modalStyles.pickupInfo}>
              <Text style={modalStyles.pickupText}>{pickup.donorName}</Text>
              <Text style={modalStyles.pickupSubText}>{pickup.pickupLocation}</Text>
            </View>
          </TouchableOpacity>
        ))
      )}
    </View>
  );

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={modalStyles.overlay} />
      </TouchableWithoutFeedback>
      <View style={modalStyles.bottomSheetContainer}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
          <View style={modalStyles.handle} />
          <ScrollView style={modalStyles.content}>
            <Text style={modalStyles.fieldLabel}>Driver ID: {driverId}</Text>

            <View style={modalStyles.switchContainer}>
              <Text style={modalStyles.fieldLabel}>Starting Point</Text>
              <View style={modalStyles.switchRow}>
                <TouchableOpacity
                  style={[modalStyles.switchOption, startType === "store" && modalStyles.switchOptionActive]}
                  onPress={() => setStartType("store")}
                >
                  <Text>Store</Text>
                </TouchableOpacity>
                <Switch
                  value={startType === "driver"}
                  onValueChange={(val) => setStartType(val ? "driver" : "store")}
                />
                <TouchableOpacity
                  style={[modalStyles.switchOption, startType === "driver" && modalStyles.switchOptionActive]}
                  onPress={() => setStartType("driver")}
                >
                  <Text>Current Location</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TextInput
              value={stopDuration}
              onChangeText={setStopDuration}
              keyboardType="numeric"
              placeholder="Stop Duration (minutes)"
              style={modalStyles.input}
            />

            <TextInput
              value={startTime}
              onChangeText={setStartTime}
              placeholder="Start Time"
              style={modalStyles.input}
            />

            {renderPickupSelection(amPickups, "AM", selectedAmPickups)}
            {renderPickupSelection(pmPickups, "PM", selectedPmPickups)}

            {error && <Text style={modalStyles.errorText}>{error}</Text>}

            <TouchableOpacity
              style={[modalStyles.optimizeButton, loading && modalStyles.optimizeButtonDisabled]}
              onPress={handleOptimize}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#FFF" /> : <Text>Optimize Route</Text>}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default RouteOptimizationModal;
