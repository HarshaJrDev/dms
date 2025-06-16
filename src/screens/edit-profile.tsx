import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function EditProfile() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    profileImage: ''
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const userString = await AsyncStorage.getItem('user');
        if (userString) {
          const user = JSON.parse(userString);
          setFormData({
            fullName: user?.name || '',
            email: user?.email || '',
            phone: user?.phone || '',
            address: user?.storeAddress || '',
            profileImage: user?.profilePicture || '',
          });
        }
      } catch (err) {
        console.log('Error loading user profile', err);
      }
    };
    loadProfile();
  }, []);
  

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.profileImageSection}>
          <View style={styles.imageContainer}>
            <Image source={{ uri: formData.profileImage }} style={styles.profileImage} />
          </View>
        </View>

        <View style={styles.formContainer}>
          <InputField label="Full Name" icon="person" value={formData.fullName} />
          <InputField label="Email" icon="email" value={formData.email} />
          <InputField label="Phone" icon="phone" value={formData.phone} />
          <InputField label="Store Address" icon="location-on" value={formData.address} multiline />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const InputField = ({ label, icon, value, multiline = false }) => (
  <View style={styles.inputContainer}>
    <Text style={styles.inputLabel}>{label}</Text>
    <View style={styles.inputWrapper}>
      <MaterialIcons name={icon} size={20} color="#4A6FE3" style={styles.inputIcon} />
      <TextInput
        style={[styles.textInput, multiline && styles.multilineInput]}
        value={value}
        editable={false}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F8FF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#4A6FE3',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#FFF' },
  placeholder: { width: 24 },
  content: { flex: 1 },
  profileImageSection: { alignItems: 'center', marginVertical: 20 },
  imageContainer: { position: 'relative' },
  profileImage: {
    width: 120, height: 120, borderRadius: 60, borderWidth: 4, borderColor: '#FFF',
  },
  formContainer: { paddingHorizontal: 20, paddingBottom: 30 },
  inputContainer: { marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 8 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  inputIcon: { marginRight: 10 },
  textInput: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
    color: '#333',
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 15,
  },
});
