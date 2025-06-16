import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
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
  PermissionsAndroid,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import Geolocation from 'react-native-geolocation-service';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useAuthStore } from '../../stores/authStore';
import { useRouteStore } from '../../stores/useRouteStore';
import modalStyles from './Styles/modalStyles';
import styles from './Styles/styles';
import { ErrorBoundary } from '../../../Debug/ErrorBoundary';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const fetchPickups = async (userId, latitude, longitude) => {
  if (!userId || latitude == null || longitude == null) return { pickups: [], optimizedRoute: [], optimizedPickups: [], pickupOrder: [] };
  const url = `http://193.203.163.114:5000/api/drivers/driver-donations/${userId}?lat=${latitude}&long=${longitude}`;
  const response = await axios.get(url);
  const data = response.data;
  console.log('fetchPickups response:', JSON.stringify(data, null, 2));

  const filteredPickups = Array.isArray(data.donationRequests)
    ? data.donationRequests.map((p) => ({
        ...p,
        id: p.id.toString(),
        donationItems: p.donationItems || p.DonationItems || [],
        pickupLocation: p.address || p.pickupLocation,
        status: p.status || 'pending',
      }))
    : [];

  let optimizedPickups = [];
  let pickupOrder = [];
  if (data.optimizedRoute && Array.isArray(data.optimizedRoute.optimizedRoute)) {
    optimizedPickups = data.optimizedRoute.optimizedRoute
      .filter((route) => route.type === 'pickup')
      .map((route) => {
        const pickupId = route.id.split('_')[1];
        const donation = route.donationRequest || {};
        return {
          id: pickupId,
          donorName: route.name || donation.donorName,
          pickupLocation: route.address || donation.address,
          pickupTime: route.timePreference || donation.pickupTime || 'N/A',
          distance: route.distance || 'N/A',
          latitude: route.latitude || donation.latitude,
          longitude: route.longitude || donation.longitude,
          donationItems: donation.donationItems || donation.DonationItems || [],
          eta: calculateETA(route.distance),
          status: donation.status || 'pending',
        };
      });
    pickupOrder = optimizedPickups.map((p) => p.id);
  } else {
    optimizedPickups = filteredPickups.filter((p) => p.status === 'pending' || p.status === 'assigned');
    pickupOrder = optimizedPickups.map((p) => p.id);
  }

  return { pickups: filteredPickups, optimizedRoute: data.optimizedRoute || [], optimizedPickups, pickupOrder };
};

const calculateETA = (distance) => {
  const distanceKm = parseFloat(distance) || 0;
  const timeMinutes = (distanceKm / 30) * 60;
  const now = new Date();
  now.setMinutes(now.getMinutes() + Math.round(timeMinutes));
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const fetchDriverLocation = async () => {
  if (Platform.OS === 'android') {
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
      Alert.alert('Permission Denied', 'Location permission is required.');
      return null;
    }
  }

  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      (position) => {
        console.log(position);
        resolve(position.coords);
      },
      (error) => {
        console.error(error);
        Alert.alert('Error', 'Could not get location: ' + error.message);
        reject(error);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  });
};

const RouteOptimizationModal = ({ visible, onClose, onOptimize }) => {
  const [driverId, setDriverId] = useState('');
  const [stopDuration, setStopDuration] = useState('20');
  const [startTime, setStartTime] = useState('10:00 PM');
  const [startType, setStartType] = useState('store');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);
  const [amPickups, setAmPickups] = useState([]);
  const [pmPickups, setPmPickups] = useState([]);
  const [selectedAmPickups, setSelectedAmPickups] = useState([]);
  const [selectedPmPickups, setSelectedPmPickups] = useState([]);
  const setOptimizedRouteData = useRouteStore((s) => s.setOptimizedRouteData);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    if (visible) {
      (async () => {
        try {
          const userData = await AsyncStorage.getItem('user');
          if (!userData) {
            setError('No user data found in AsyncStorage.');
            Alert.alert('Error', 'No user data found in AsyncStorage.');
            return;
          }
          const parsed = JSON.parse(userData);
          const id = parsed?.driverDetails?.id || parsed?.id;
          if (!id) {
            setError('Driver ID not found in user data.');
            Alert.alert('Error', 'Driver ID not found in user data.');
            return;
          }
          setDriverId(id.toString());

          const coords = await fetchDriverLocation();
          if (!coords) return;
          setLocation(coords);

          const result = await fetchPickups(id.toString(), coords.latitude, coords.longitude);
          if (!Array.isArray(result?.pickups)) {
            setError('Invalid pickups data received from server.');
            Alert.alert('Error', 'Invalid pickups data received from server.');
            return;
          }

          const donationRequests = result.pickups;
          const am = donationRequests.filter((p) => p.pickupTime === 'AM');
          const pm = donationRequests.filter((p) => p.pickupTime === 'PM');

          setAmPickups(am);
          setPmPickups(pm);
          setSelectedAmPickups(am.map((p) => Number(p.id)));
          setSelectedPmPickups(pm.map((p) => Number(p.id)));
        } catch (e) {
          console.error('Error initializing modal:', e);
          setError(`Initialization failed: ${e.message}`);
          Alert.alert('Error', `Initialization failed: ${e.message}`);
        }
      })();
    } else {
      setStopDuration('20');
      setStartTime('10:00 PM');
      setStartType('store');
      setLoading(false);
      setError(null);
      setLocation(null);
      setAmPickups([]);
      setPmPickups([]);
      setSelectedAmPickups([]);
      setSelectedPmPickups([]);
    }
  }, [visible]);

  const togglePickup = (id, type) => {
    const numId = Number(id);
    if (type === 'AM') {
      setSelectedAmPickups((prev) =>
        prev.includes(numId) ? prev.filter((pid) => pid !== numId) : [...prev, numId]
      );
    } else {
      setSelectedPmPickups((prev) =>
        prev.includes(numId) ? prev.filter((pid) => pid !== numId) : [...prev, numId]
      );
    }
  };

  const optimizeRoute = async (userId, latitude, longitude, payload) => {
    const url =
      latitude != null && longitude != null
        ? `http://193.203.163.114:5000/api/drivers/route/optimize/${userId}?lat=${latitude}&long=${longitude}`
        : `http://193.203.163.114:5000/api/drivers/route/optimize/${userId}`;
    const response = await axios.post(url, payload, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  };

  const handleOptimize = async () => {
    setError(null);
    if (!driverId || !stopDuration || !startTime || !startType) {
      Alert.alert('Missing Fields', 'Please fill all fields.');
      return;
    }
    setLoading(true);
    try {
      let lat = null;
      let long = null;
      if (startType === 'driver') {
        const coords = await fetchDriverLocation();
        if (!coords) throw new Error('Could not retrieve driver location.');
        lat = coords.latitude;
        long = coords.longitude;
      }
      const body = {
        driverId,
        startLocation: { type: startType },
        stopDuration: parseInt(stopDuration),
        startTime,
        amPickups: selectedAmPickups,
        pmPickups: selectedPmPickups,
      };
      const res = await optimizeRoute(driverId, lat, long, body);
      setOptimizedRouteData(res);
      onOptimize(res);
    } catch (err) {
      const errorMsg = err.response?.data || err.message;
      setError(
        err.response
          ? `Server Error (${err.response.status}): ${JSON.stringify(err.response.data)}`
          : `Request Failed: ${err.message}`
      );
      console.log(JSON.stringify(errorMsg, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const formattedTime = selectedTime.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      setStartTime(formattedTime);
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
            activeOpacity={0.8}
          >
            <MaterialIcons
              name={selectedIds.includes(Number(pickup.id)) ? 'check-box' : 'check-box-outline-blank'}
              size={20}
              color={selectedIds.includes(Number(pickup.id)) ? '#6366F1' : '#6B7280'}
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
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={modalStyles.overlay} />
      </TouchableWithoutFeedback>
      <View style={modalStyles.bottomSheetContainer}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
        >
          <View style={modalStyles.handle} />
          <View style={modalStyles.header}>
            <View style={modalStyles.titleContainer}>
              <MaterialIcons name="route" size={24} color="#6366F1" />
              <Text style={modalStyles.title}>Route Optimization</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
              <MaterialIcons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <ScrollView style={modalStyles.content} showsHorizontalScrollBar={false}>
            <View style={modalStyles.driverIdContainer}>
              <Text style={modalStyles.fieldLabel}>Driver ID</Text>
              <View style={modalStyles.driverIdBadge}>
                <MaterialIcons name="badge" size={16} color="#6366F1" />
                <Text style={modalStyles.driverIdText}>{driverId}</Text>
              </View>
            </View>
            <View style={modalStyles.switchContainer}>
              <Text style={modalStyles.fieldLabel}>Starting Point</Text>
              <View style={modalStyles.switchRow}>
                <TouchableOpacity
                  style={[modalStyles.switchOption, startType === 'store' && modalStyles.switchOptionActive]}
                  onPress={() => setStartType('store')}
                  activeOpacity={0.8}
                >
                  <MaterialIcons
                    name="store"
                    size={20}
                    color={startType === 'store' ? '#6366F1' : '#9CA3AF'}
                  />
                  <Text
                    style={[modalStyles.switchOptionText, startType === 'store' && modalStyles.switchOptionTextActive]}
                  >
                    Store
                  </Text>
                </TouchableOpacity>
                <Switch
                  value={startType === 'driver'}
                  onValueChange={(val) => setStartType(val ? 'driver' : 'store')}
                  trackColor={{ false: '#E5E7EB', true: '#6366F1' }}
                  thumbColor="#FFFFFF"
                />
                <TouchableOpacity
                  style={[modalStyles.switchOption, startType === 'driver' && modalStyles.switchOptionActive]}
                  onPress={() => setStartType('driver')}
                  activeOpacity={0.8}
                >
                  <MaterialIcons
                    name="person-pin-circle"
                    size={20}
                    color={startType === 'driver' ? '#6366F1' : '#9CA3AF'}
                  />
                  <Text
                    style={[modalStyles.switchOptionText, startType === 'driver' && modalStyles.switchOptionTextActive]}
                  >
                    Current Location
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={modalStyles.inputGroup}>
              <Text style={modalStyles.fieldLabel}>Stop Duration</Text>
              <View style={modalStyles.inputContainer}>
                <MaterialIcons name="schedule" size={20} color="#6B7280" />
                <TextInput
                  value={stopDuration}
                  onChangeText={setStopDuration}
                  keyboardType="numeric"
                  style={modalStyles.input}
                  placeholder="20"
                  placeholderTextColor="#9CA3AF"
                />
                <Text style={modalStyles.inputSuffix}>minutes</Text>
              </View>
            </View>
            <View style={modalStyles.inputGroup}>
              <Text style={modalStyles.fieldLabel}>Start Time</Text>
              <TouchableOpacity onPress={() => setShowTimePicker(true)} activeOpacity={0.8}>
                <View style={modalStyles.inputContainer}>
                  <MaterialIcons name="access-time" size={20} color="#6B7280" />
                  <TextInput
                    value={startTime}
                    style={modalStyles.input}
                    placeholder="Select Start Time"
                    placeholderTextColor="#9CA3AF"
                    editable={false}
                    pointerEvents="none"
                  />
                </View>
              </TouchableOpacity>
              {showTimePicker && (
                <DateTimePicker
                  value={new Date()}
                  mode="time"
                  display="default"
                  is24Hour={false}
                  onChange={handleTimeChange}
                />
              )}
            </View>
            {renderPickupSelection(amPickups, 'AM', selectedAmPickups)}
            {renderPickupSelection(pmPickups, 'PM', selectedPmPickups)}
            {error && (
              <View style={modalStyles.errorContainer}>
                <MaterialIcons name="error-outline" size={20} color="#EF4444" />
                <Text style={modalStyles.errorText}>{error}</Text>
              </View>
            )}
            <TouchableOpacity
              style={[modalStyles.optimizeButton, loading && modalStyles.optimizeButtonDisabled]}
              onPress={handleOptimize}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <MaterialIcons name="alt-route" size={20} color="#FFFFFF" />
              )}
              <Text style={modalStyles.optimizeButtonText}>
                {loading ? 'Optimizing Route...' : 'Optimize Route'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default function TodaysPickups() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { user } = useAuthStore();
  const [location, setLocation] = useState(null);
  const [ongoingPickups, setOngoingPickups] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [optimizedPickups, setOptimizedPickups] = useState([]);
  const [pickupOrder, setPickupOrder] = useState([]);
  const [completedPickups, setCompletedPickups] = useState([]);
  const [driverId, setDriverId] = useState('');
  const [error, setError] = useState(null);
  const queryClient = useQueryClient();

  const userId = user?.id?.toString() || user?.data?.id?.toString();

  useEffect(() => {
    (async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (!userData) {
          setError('No user data found in AsyncStorage.');
          Alert.alert('Error', 'No user data found in AsyncStorage.');
          return;
        }
        const parsed = JSON.parse(userData);
        const id = parsed?.driverDetails?.id || parsed?.id;
        if (!id) {
          setError('Driver ID not found in user data.');
          Alert.alert('Error', 'Driver ID not found in user data.');
          return;
        }
        setDriverId(id.toString());

        const coords = await fetchDriverLocation();
        if (coords) {
          setLocation(coords);
        }
      } catch (e) {
        console.error('Error initializing component:', e);
        setError(`Initialization failed: ${e.message}`);
        Alert.alert('Error', `Initialization failed: ${e.message}`);
      }
    })();
  }, []);

  const { data, isLoading, error: queryError } = useQuery({
    queryKey: ['pickups', userId, location?.latitude, location?.longitude],
    queryFn: () => fetchPickups(userId, location?.latitude, location?.longitude),
    enabled: !!userId && !!location,
    onSuccess: (data) => {
      console.log('useQuery onSuccess:', {
        pickups: data.pickups.map((p) => ({ id: p.id, status: p.status })),
        optimizedPickups: data.optimizedPickups.map((p) => ({ id: p.id, status: p.status })),
        pickupOrder: data.pickupOrder,
      });
      const completed = data.pickups
        .filter((p) => p.status === 'completed' || p.status === 'rejected')
        .map((p) => p.id);
      setCompletedPickups(completed);
      setOptimizedPickups(
        data.optimizedPickups.filter((p) => p.status === 'pending' || p.status === 'assigned')
      );
      setPickupOrder(data.pickupOrder.filter((id) => !completed.includes(id)));
    },
  });

  const pickups = optimizedPickups.length > 0 ? optimizedPickups : data?.pickups || [];

  const handleRefresh = async () => {
    try {
      await queryClient.invalidateQueries(['pickups', userId, location?.latitude, location?.longitude]);
      console.log('Data refreshed manually');
    } catch (err) {
      console.error('Refresh error:', err);
      Alert.alert('Error', 'Failed to refresh data.');
    }
  };

  useEffect(() => {
    if (isFocused) {
      handleRefresh();
    }
  }, [isFocused, userId, location]);

  const handleRouteOptimization = async (optimizedData) => {
    try {
      const optimizedRoutePickups = optimizedData.optimizedRoute
        .filter((route) => route.type === 'pickup')
        .map((route) => {
          const pickupId = route.id.split('_')[1];
          return {
            id: pickupId,
            donorName: route.name,
            pickupLocation: route.address,
            pickupTime: route.timePreference,
            distance: route.distance || 0,
            latitude: route.latitude,
            longitude: route.longitude,
            donationItems: route.donationRequest?.donationItems || route.donationRequest?.DonationItems || [],
            eta: calculateETA(route.distance),
            status: 'pending',
          };
        });
      console.log('Optimized pickups:', optimizedRoutePickups);
      setOptimizedPickups(optimizedRoutePickups);
      setPickupOrder(optimizedRoutePickups.map((p) => p.id));
      setModalVisible(false);
    } catch (error) {
      console.error('Error in handleRouteOptimization:', error);
      Alert.alert('Error', 'Failed to process optimized route. Please try again.');
    }
  };

  const handleStartRide = async () => {
    if (!driverId || !location) {
      Alert.alert('Error', 'Missing driver ID or location.');
      return;
    }
    if (pickupOrder.length === 0) {
      Alert.alert('Error', 'No pickups available to start.');
      return;
    }
    try {
      const response = await axios.post(
        `http://193.203.163.114:5000/api/drivers/start-route/${driverId}`
      );
      console.log('Start Ride response:', JSON.stringify(response.data, null, 2));
      const { route } = response.data;
      if (!route || !Array.isArray(route.optimizedRoute) || route.optimizedRoute.length === 0) {
        Alert.alert('Error', 'No optimized route data found.');
        return;
      }
      const orders = route.optimizedRoute
        .filter((stop) => stop.type === 'pickup')
        .map((pickup) => {
          const donation = pickup.donationRequest || {};
          return {
            id: donation.id?.toString(),
            donorName: donation.donorName,
            address: donation.address,
            scheduledTime: pickup.timePreference || donation.pickupTime || 'N/A',
            distance: pickup.distance || 'N/A',
            latitude: donation.latitude,
            longitude: donation.longitude,
            donationItems: donation.donationItems || donation.DonationItems || [],
            eta: calculateETA(pickup.distance),
            status: donation.status || 'onGoing',
          };
        });
      const firstPickup = orders[0];
      if (firstPickup) {
        setOngoingPickups([{ ...firstPickup, status: 'onGoing' }]);
        setOptimizedPickups((prev) => prev.filter((p) => p.id !== firstPickup.id));
        setPickupOrder((prev) => prev.filter((id) => id !== firstPickup.id));
      }
      navigation.navigate('MapNavigation', {
        orders: JSON.stringify([firstPickup]),
        currentLat: location.latitude,
        currentLong: location.longitude,
      });
    } catch (err) {
      console.error('Failed to start route:', err);
      Alert.alert('Error', 'Failed to start route: ' + (err.response?.data?.message || err.message));
    }
  };

  useEffect(() => {
    const handleBackFromNavigation = async () => {
      if (!userId || !location) return;
      try {
        const { pickups: updatedPickups } = await fetchPickups(userId, location.latitude, location.longitude);
        console.log(
          'Updated pickups:',
          JSON.stringify(updatedPickups.map((p) => ({ id: p.id, status: p.status })), null, 2)
        );

        const completed = updatedPickups
          .filter((p) => p.status === 'completed' || p.status === 'rejected')
          .map((p) => p.id);
        setCompletedPickups(completed);

        setOngoingPickups((prev) => prev.filter((p) => !completed.includes(p.id)));

        const pending = updatedPickups.filter((p) => p.status === 'pending' || p.status === 'assigned');
        setOptimizedPickups(pending);
        setPickupOrder(pending.map((p) => p.id));

        if (pending.length > 0 && ongoingPickups.length === 0) {
          const nextPickupId = pickupOrder[0] || pending[0].id;
          const nextPickup = pending.find((p) => p.id === nextPickupId);
          if (nextPickup) {
            setOngoingPickups([
              {
                id: nextPickup.id.toString(),
                donorName: nextPickup.donorName,
                pickupLocation: nextPickup.address || nextPickup.pickupLocation,
                pickupTime: nextPickup.pickupTime,
                distance: nextPickup.distance || 0,
                latitude: nextPickup.latitude,
                longitude: nextPickup.longitude,
                donationItems: nextPickup.donationItems || [],
                eta: calculateETA(nextPickup.distance),
                status: 'onGoing',
              },
            ]);
            setOptimizedPickups((prev) => prev.filter((p) => p.id !== nextPickupId));
            setPickupOrder((prev) => prev.filter((id) => id !== nextPickupId));
            navigation.navigate('MapNavigation', {
              orders: JSON.stringify([
                {
                  id: nextPickup.id,
                  donorName: nextPickup.donorName,
                  address: nextPickup.address || nextPickup.pickupLocation,
                  scheduledTime: nextPickup.pickupTime,
                  distance: nextPickup.distance || 'N/A',
                  latitude: nextPickup.latitude,
                  longitude: nextPickup.longitude,
                  donationItems: nextPickup.donationItems || [],
                  eta: calculateETA(nextPickup.distance),
                  status: 'onGoing',
                },
              ]),
              currentLat: location.latitude,
              currentLong: location.longitude,
            });
          }
        }

        console.log('After update:', {
          ongoingPickups: ongoingPickups.map((p) => ({ id: p.id, status: p.status })),
          completedPickups,
          optimizedPickups: pending.map((p) => ({ id: p.id, status: p.status })),
          pickupOrder: pending.map((p) => p.id),
        });
      } catch (err) {
        console.error('Error updating pickups:', err);
        Alert.alert('Error', 'Failed to update pickups: ' + err.message);
      }
    };
    if (isFocused) {
      handleBackFromNavigation();
    }
  }, [isFocused, userId, location, ongoingPickups, pickupOrder]);

  const renderPickupItem = ({ item, index }) => (
    <View style={[styles.pickupCard, { marginBottom: index === pickups.length - 1 ? 100 : 16 }]}>
      <View style={styles.cardHeader}>
        <View style={styles.donationBadge}>
          <MaterialIcons name="volunteer-activism" size={18} color="#FFFFFF" />
          <Text style={styles.donationBadgeText}>{item.donationItems?.length || 0} Items</Text>
        </View>
        <View style={styles.distanceBadge}>
          <MaterialIcons name="directions-car" size={14} color="#6366F1" />
          <Text style={styles.distanceBadgeText}>{item.distance}</Text>
        </View>
      </View>
      <View style={styles.cardContent}>
        <View style={styles.donorInfo}>
          <View style={styles.donorAvatar}>
            <MaterialIcons name="person" size={20} color="#6366F1" />
          </View>
          <View style={styles.donorDetails}>
            <Text style={styles.donorName} numberOfLines={1}>
              {item.donorName}
            </Text>
            <View style={styles.timeInfo}>
              <MaterialIcons name="schedule" size={14} color="#6B7280" />
              <Text style={styles.timeText}>{item.pickupTime}</Text>
            </View>
          </View>
        </View>
        <View style={styles.locationInfo}>
          <View style={styles.locationDot} />
          <View style={styles.locationDetails}>
            <Text style={styles.locationLabel}>Pickup Location</Text>
            <Text style={styles.locationText} numberOfLines={2}>
              {item.pickupLocation}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderOngoingPickups = () => (
    <View style={styles.ongoingContainer}>
      <View style={styles.ongoingHeader}>
        <View style={styles.ongoingTitleContainer}>
          <MaterialIcons name="local-shipping" size={24} color="#10B981" />
          <Text style={styles.ongoingTitle}>Ongoing Pickups</Text>
        </View>
        <View style={styles.statusBadge}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Active ({ongoingPickups.length})</Text>
        </View>
      </View>
      <View style={styles.ongoingCard}>
        {ongoingPickups.map((pickup, index) => (
          <View key={pickup.id} style={{ marginBottom: 16 }}>
            <View style={styles.ongoingCardHeader}>
              <View style={styles.pickupIdContainer}>
                <Text style={styles.pickupIdLabel}>Pickup #{pickupOrder.indexOf(pickup.id) + 1}</Text>
                <Text style={styles.pickupId}>#{pickup.id}</Text>
              </View>
              <View style={styles.scheduledTimeContainer}>
                <MaterialIcons name="schedule" size={16} color="#6B7280" />
                <Text style={styles.scheduledTime}>
                  {pickup.pickupTime} (ETA: {pickup.eta})
                </Text>
              </View>
            </View>
            <View style={styles.ongoingDonorSection}>
              <View style={styles.ongoingDonorAvatar}>
                <MaterialIcons name="person" size={20} color="#FFFFFF" />
              </View>
              <View style={styles.ongoingDonorInfo}>
                <Text style={styles.donorLabel}>Donor</Text>
                <Text style={styles.donorValue}>{pickup.donorName}</Text>
              </View>
            </View>
            <View style={styles.ongoingLocationSection}>
              <View style={styles.locationRoute}>
                <View style={styles.routeDot} />
                <View style={styles.routeLine} />
              </View>
              <View style={styles.ongoingLocationInfo}>
                <Text style={styles.locationLabel}>Pickup Location</Text>
                <Text style={styles.ongoingLocationText}>{pickup.pickupLocation}</Text>
              </View>
            </View>
            <View style={styles.ongoingStats}>
              <View style={styles.statItem}>
                <MaterialIcons name="inventory" size={18} color="#6B7280" />
                <Text style={styles.statText}>{pickup.donationItems?.length || 0} Items</Text>
              </View>
              <View style={styles.statItem}>
                <MaterialIcons name="directions-car" size={18} color="#6B7280" />
                <Text style={styles.statText}>{pickup.distance}</Text>
              </View>
              <View style={styles.statItem}>
                <MaterialIcons name="access-time" size={18} color="#6B7280" />
                <Text style={styles.statText}>ETA: {pickup.eta}</Text>
              </View>
            </View>
            {index < ongoingPickups.length - 1 && <View style={styles.divider} />}
          </View>
        ))}
      </View>
    </View>
  );

  const renderEmptyState = (title, subtitle, icon) => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <MaterialIcons name={icon} size={48} color="#9CA3AF" />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySubtitle}>{subtitle}</Text>
    </View>
  );

  return (
    <ErrorBoundary>
         <View style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="trending-up" size={20} color="#1F2937" />
            <Text style={styles.sectionTitle}>Ongoing Pickups</Text>
          </View>
          {ongoingPickups.length > 0
            ? renderOngoingPickups()
            : renderEmptyState(
                'No Active Pickups',
                "You don't have any ongoing pickups at the moment",
                'local-shipping'
              )}
        </View>
        <View style={[styles.headerContainer, { flexDirection: 'row' }]}>
          <View style={styles.headerTitleContainer}>
            <MaterialIcons name="today" size={28} color="#1F2937" />
            <Text style={styles.headerTitle}>Today's Pickups</Text>
          </View>
          <View style={[styles.headerActions, { flexDirection: 'row' }]}>
            <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh} activeOpacity={0.8}>
              <MaterialIcons name="refresh" size={18} color="#6366F1" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.optimizeButton}
              onPress={() => setModalVisible(true)}
              activeOpacity={0.8}
            >
              <MaterialIcons name="alt-route" size={18} color="#6366F1" />
            </TouchableOpacity>
            {pickups.length > 0 && (
              <TouchableOpacity style={styles.startRideButton} onPress={handleStartRide} activeOpacity={0.8}>
                <MaterialIcons name="play-circle-outline" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="list-alt" size={20} color="#1F2937" />
            <Text style={styles.sectionTitle}>Available Pickups</Text>
            {pickups.length > 0 && (
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{pickups.length}</Text>
              </View>
            )}
          </View>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6366F1" />
              <Text style={styles.loadingText}>Loading pickups...</Text>
            </View>
          ) : pickups.length > 0 ? (
            <FlatList
              data={pickups.filter(
                (p) => !completedPickups.includes(p.id) && (p.status === 'pending' || p.status === 'assigned')
              )}
              renderItem={renderPickupItem}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            renderEmptyState('No Pickups Available', 'Check back later for new pickup requests', 'inbox')
          )}
        </View>
      </ScrollView>
      <RouteOptimizationModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onOptimize={handleRouteOptimization}
      />
    </View>

      </ErrorBoundary>

 
  );
}