// FCMService.js
import messaging from '@react-native-firebase/messaging';
import { Alert } from 'react-native';

export const requestUserPermission = async () => {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
    getFcmToken(); // Request token after permission
  } else {
    Alert.alert('Notification permission denied');
  }
};

export const getFcmToken = async () => {
  try {
    const fcmToken = await messaging().getToken();
    if (fcmToken) {
      console.log('FCM Token:', fcmToken);
      // TODO: Save or send token to your server
    } else {
      console.log('No token received');
    }
  } catch (error) {
    console.error('Error getting FCM token:', error);
  }
};

export const notificationListener = () => {
  // Foreground messages
  messaging().onMessage(async remoteMessage => {
    console.log('FCM Message in foreground:', remoteMessage);
    Alert.alert(remoteMessage.notification.title, remoteMessage.notification.body);
  });

  // Background / Quit state messages (when app is opened by tapping notification)
  messaging()
    .onNotificationOpenedApp(remoteMessage => {
      console.log('Notification caused app to open from background:', remoteMessage);
    });

  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        console.log('App opened from quit state by notification:', remoteMessage);
      }
    });
};
