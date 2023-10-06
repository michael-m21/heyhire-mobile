import React, { useState, useEffect } from "react";
import { Platform, Linking, View, Text ,Alert,I18nManager} from "react-native";
import Navigation, { AppNavigation, AuthNavigation, MyDrawer } from "./src/Navigation";
import PushNotificationIOS from "@react-native-community/push-notification-ios";
import Constants from "expo-constants";
import * as SplashScreen from "expo-splash-screen";
import NavigationService from "./src/utils/NavigationService";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { AuthContext } from "./src/navigation/context";
import { getUser } from "./src/utils/utils.js";
import messaging from '@react-native-firebase/messaging';
import CommonUtils from './src/utils/CommonUtils';
import {Provider, useSelector} from 'react-redux';
import store from './src/redux/store';
import { PersistGate } from 'redux-persist/lib/integration/react';
import { getPersistor } from '@rematch/persist';
import { getRequest } from './src/utils/network';



console.disableYellowBox = true;

SplashScreen.preventAutoHideAsync()
  .then((result) =>
    console.log(`SplashScreen.preventAutoHideAsync() succeeded: ${result}`)
  )
  .catch(console.warn);

const RootStack = createStackNavigator();

const temp = () => <View>
  <Text>Hello</Text>
</View>

const RootStackScreen = () => {



  const userData = useSelector(state => state.UserData)

  console.log('userData',userData)

  return <RootStack.Navigator headerMode="none">
    {userData?.token ? (
      <RootStack.Screen
        name="App"
        component={MyDrawer}
        options={{
          animationEnabled: false,
        }}
        // initialParams={{
        //   screen: userToken.user_type == 2 ? "Seeker" : "Business",
        // }}
        initialParams={{
          screen: "Screen",
        }}
      />
    ) : (
      <RootStack.Screen
        name="Auth"
        component={AuthNavigation}
        options={{
          animationEnabled: false,
        }}
      />
    )}
  </RootStack.Navigator>
}

export default function App() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [url, setURL] = React.useState(null);


  const authContext = React.useMemo(() => {
    return {
      signIn: (u) => {
        setIsLoading(false);
        setUserToken(u);
      },
      signUp: (u) => {
        setIsLoading(false);
        setUserToken(u);
      },
      signOut: () => {
        setIsLoading(false);
        setUserToken(null);
      },
    };
  }, []);

  

  React.useEffect(() => {
    // if(Platform.OS=="ios"){
      CommonUtils.deviceTokenSet();
    // }

  // I18nManager.allowRTL(true);

  //   getUser().then((u) => {
  //     var userData = JSON.parse(u);
  //     if (userData && userData.is_verified == 1) {
  //       setUserToken(JSON.parse(u));
  //     } else {
  //       setUserToken(null);
  //     }
  //     setIsLoading(false);
  //   });
  }, []);

  useEffect(() => {
   

    Linking.getInitialURL().then((url) => {
      if (url) handleOpenURL(url);
    }).catch(err => {console.log('err',err)});

    Linking.addEventListener('url',event => {handleOpenURL(event.url)})

    setTimeout(async () => {
      await SplashScreen.hideAsync();
      if (Constants.platform.ios) {
        // PushNotificationIOS.requestPermissions();
      }
    }, Platform.OS=="android"?1000: 2000);

    // return unsubscribe;
  });

  // Notification handlers
  React.useEffect(async () => {
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log(remoteMessage);
    });

    messaging().getInitialNotification().then((remoteMessage) => {
      if (remoteMessage) {
        console.log(
          'Notification caused app to open from quit state:',
          remoteMessage.notification,
        );
      }
    });

    messaging().onMessage(remoteMessage => {
      console.log(remoteMessage);
    });

    const token = await messaging().getToken();

    console.log(token, 'token');
  }, []);

  const checkUuid = async (uuid) => {
    try {
      const res = await getRequest(`/business/qr-code-uuid/${uuid}`,'');
      const json = await res.json()
      } catch (error) {
        console.log('error while getting user profile',JSON.stringify(error))
      }  
  }

  function handleOpenURL(url) {
    console.log('handleOpenURL -> url', url);
    let qrUuid = url.split("/").filter(Boolean).pop();
    if (qrUuid) {
      checkUuid(qrUuid);
    }
  }

  if (isLoading) {
    return null;
  }

  const deepLinkingConfig = {
    prefixes: ['https://heyhire.app', 'heyhire.app://'],
  }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={getPersistor()}>
        <AuthContext.Provider value={authContext}>
          <NavigationContainer
            ref={(navigatorRef) => {
              NavigationService.setTopLevelNavigator(navigatorRef);
            }}
            linking={deepLinkingConfig}
          >
            <RootStackScreen  url={url} />
          </NavigationContainer>
        </AuthContext.Provider>
      </PersistGate>
    </Provider>
  );

  // return <Navigation></Navigation>;
}
