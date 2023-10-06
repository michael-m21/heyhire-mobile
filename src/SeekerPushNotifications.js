import messaging from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';
import NavigationService from './utils/NavigationService';
import { postJSON } from './utils/network';

const navigateToHome = () => {
  NavigationService.navigate('SeekerHome', {})
}

async function sendTokenToServer (deviceToken, userToken) {
  if (!deviceToken?.length) {
    return
  }
  console.log('getAndUpdateToken -> sendTokenToServer -> deviceToken', deviceToken);

  try {
    let fireBaseToken = deviceToken;// CommonUtils.deviceToken;
    console.log('Firebase token -> firebase token', fireBaseToken);
    const body = {
      token: fireBaseToken
    };
    const res = await postJSON("/job-seeker/auth/push-token",body, userToken);
    console.log('sendDeviceTokentoServer -> res', res);
    const json = await res.json()
    console.log('sendDeviceTokentoServer -> json', json);
  } catch (error) {
    console.log('sendDeviceTokentoServer -> error', error);
  }
}

async function requestUserPermission () {
  try {
    const authStatus = await messaging().requestPermission()
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL

    if (enabled) {
      console.log('Authorization status:', authStatus)
    } else {
      console.log('not enabled', authStatus)
    }
  } catch (err) {
    console.log('notification permission error:', err)
  }
  PushNotification.getChannels(function (channel_ids) {})
}

async function getAndUpdateToken (userToken) {
  const token = await messaging().getToken();
  console.log('getAndUpdateToken -> token', token);
  setTimeout(() => sendTokenToServer(token, userToken), 10000)
}

export default async (userToken) => {
  console.log('notification -> notification -> notification -> userToken', userToken);

  messaging().onMessage(async remoteMessage => {
    PushNotification.localNotification({
      channelId: remoteMessage.notification?.android?.channelId,
      title: remoteMessage.notification?.title, // (optional)
      message: remoteMessage.notification?.body, // (required)
    })
    navigateToHome()

    console.log('A new FCM message arrived!', JSON.stringify(remoteMessage));
  })

  // Register background handler
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('setBackgroundMessageHandler -> remoteMessage', remoteMessage);
    navigateToHome()
  })

  messaging().onTokenRefresh(token =>
    setTimeout(() => sendTokenToServer(token, userToken), 10000),
  )

  messaging().onNotificationOpenedApp(remoteMessage => {
    console.log('onNotificationOpenedApp -> remoteMessage', remoteMessage);
    navigateToHome()
  })

  // Check whether an initial notification is available
  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      console.log('getInitialNotification -> remoteMessage', remoteMessage);
      if (remoteMessage) {
      }
    })
  await requestUserPermission()
  await getAndUpdateToken(userToken)
}

