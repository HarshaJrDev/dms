import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [pickupCount, setPickupCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const menuItems = [
    {
      icon: 'person',
      text: 'Personal Information',
      description: 'Update your profile details',
      route: 'EditProfile',
    },
    {
      icon: 'history',
      text: 'Pickup History',
      description: 'View your past pickups',
      route: 'PickupHistory',
    },
    {
      icon: 'help-outline',
      text: 'Help & Support',
      description: 'Get assistance',
      route: 'HelpSupport',
    },
    {
      icon: 'logout',
      text: 'Sign Out',
      description: 'Exit from your account',
      route: 'Logout',
    },
  ];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          setUser(parsed);
          fetchPickupHistory(parsed.id);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const fetchPickupHistory = async (driverId) => {
    try {
      if (!driverId) {
        console.warn('Driver ID not found');
        return;
      }

      const response = await axios.get(
        `http://193.203.163.114:5000/api/drivers/driver-pickup-history/${driverId}`
      );

      const completedItemCount = response.data.reduce((count, pickup) => {
        const completedInPickup = pickup.donationItems.filter(
          (item) => item.status === 'completed'
        ).length;
        return count + completedInPickup;
      }, 0);

      setCompletedCount(completedItemCount);
    } catch (err) {
      console.error('Error fetching pickup history', err);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <Image
            source={{
              uri: user?.profilePicture || 'https://via.placeholder.com/100',
            }}
            style={styles.avatar}
          />
          <TouchableOpacity
            style={styles.editIcon}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <MaterialIcons name="edit" size={18} color="#4A6FE3" />
          </TouchableOpacity>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.userName}>{user?.name || 'Loading...'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'Email...'}</Text>
          <Text style={styles.userPhone}>{user?.phone || 'Phone...'}</Text>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <MaterialIcons name="local-shipping" size={20} color="#4A6FE3" />
              <Text style={styles.statText}>
                <Text style={styles.statText}>{completedCount} Pickups</Text>
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Menu */}
      <View style={styles.menuCard}>
        {menuItems.map((item, index) => (
          <MenuItem
            key={item.text}
            icon={item.icon}
            text={item.text}
            description={item.description}
            lastItem={index === menuItems.length - 1}
            onPress={() => navigation.navigate(item.route)}
          />
        ))}
      </View>
    </View>
  );
}

const MenuItem = ({ icon, text, description, lastItem, onPress }) => (
  <TouchableOpacity
    style={[styles.menuItem, !lastItem && styles.menuItemBorder]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.menuItemContent}>
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: icon === 'logout' ? '#FFF0F0' : '#F0F4FF' },
        ]}
      >
        <MaterialIcons
          name={icon}
          size={24}
          color={icon === 'logout' ? '#FF5252' : '#4A6FE3'}
        />
      </View>
      <View style={styles.menuTextContainer}>
        <Text
          style={[
            styles.menuItemText,
            { color: icon === 'logout' ? '#FF5252' : '#333' },
          ]}
        >
          {text}
        </Text>
        <Text style={styles.menuItemDescription}>{description}</Text>
      </View>
    </View>
    {icon !== 'logout' && (
      <MaterialIcons name="chevron-right" size={20} color="#BDBDBD" />
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8FF',
  },
  header: {
    padding: 24,
    paddingTop: 50,
    backgroundColor: '#4A6FE3',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    margin: 20,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  editIcon: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  infoContainer: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F4FF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  statText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#4A6FE3',
  },
  menuCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginHorizontal: 20,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  menuItem: {
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
  },
  menuItemDescription: {
    fontSize: 13,
    color: '#8D8D8D',
    marginTop: 4,
  },
});