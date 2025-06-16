// hooks/useFCM.js
import messaging from '@react-native-firebase/messaging';
import { useEffect } from 'react';
import { Alert, Platform } from 'react-native';

export const useFCM = () => {
  useEffect(() => {
    const initFCM = async () => {
      try {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
          const fcmToken = await messaging().getToken();
          console.log('FCM Token:', fcmToken);
          if (Platform.OS === 'android') {
            Alert.alert('FCM Token', fcmToken);
          }
        } else {
          console.log('Notification permission not granted');
        }
      } catch (error) {
        console.error('Error getting FCM token:', error);
      }
    };

    initFCM();

    const unsubscribe = messaging().onTokenRefresh(token => {
      console.log('FCM token refreshed:', token);
    });

    return unsubscribe;
  }, []);
};
