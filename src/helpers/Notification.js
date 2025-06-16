import messaging from '@react-native-firebase/messaging';
import { useEffect } from 'react';
import { Alert } from 'react-native';

export const useFCM = () => {
  useEffect(() => {
    const requestPermissionAndGetToken = async () => {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        const fcmToken = await messaging().getToken();
        if (fcmToken) {
          console.log('FCM Token:', fcmToken);
          Alert.alert('Your FCM Token', fcmToken);
          // You can send this to your backend
        } else {
          console.log('Failed to get FCM token');
        }
      }
    };

    requestPermissionAndGetToken();

    // Token refresh listener
    const unsubscribe = messaging().onTokenRefresh(token => {
      console.log('Refreshed FCM Token:', token);
    });

    return unsubscribe;
  }, []);
};
