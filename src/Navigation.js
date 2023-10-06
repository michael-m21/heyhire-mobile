import React, { useEffect } from "react";
import { View, Image } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createDrawerNavigator } from '@react-navigation/drawer';
import messaging from '@react-native-firebase/messaging';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

import { strings } from "./translation/config";
import { getUser } from "./utils/utils.js";
import HomeScreen from "./HomeScreen";
import SeekerUserWizard from './SeekerUserWizard';
import SeekerLogin from "./SeekerLogin";
import SeekerForgotPassword from "./SeekerForgotPassword";
import SeekerSignup from "./SeekerSignup";
import SeekerVerificationCode from "./SeekerVerificationCode";
import SeekerHome from "./SeekerHome";
import SeekerScanQrCode from "./SeekerScanQrCode";
import SeekerAppliedJobs from "./SeekerAppliedJobs";
import SeekerNotifications from "./SeekerNotifications";
import SeekerEditProfile from "./SeekerEditProfile";
import SeekerFinishRegistration from "./SeekerFinishRegistration";
import SeekerJobDetail from "./SeekerJobDetail";
import SeekerArchivedJobs from "./SeekerArchivedJobs";
import SeekerAvailableJobs from "./SeekerAvailableJobs";
import SeekerAddLang from "./SeekerAddLang";
import SeekerAddPastPosition from "./SeekerAddPastPosition";
import TestLinks from "./TestLinks";
import SeekerEditPastPosition from "./SeekerEditPastPosition";
import ForgotPassword from './ForgotPassword';
import SeekerBusinessList from './SeekerBusinessList';
import CustomHeader from "./components/CustomHeader.js";
import CustomBack from "./components/CustomBack.js";
import CustomDrawer from "./components/CustomDrawer";
import SeekerAbout from "./SeekerAbout";

const Stack = createStackNavigator();
const Stack2 = createStackNavigator();
const Stack3 = createStackNavigator();
const EditProfileStack = createStackNavigator();
const Tab = createBottomTabNavigator();
const SeekerHomeStack = createStackNavigator();
const AppNavigationStack = createStackNavigator();

const AuthNavigationStack = createStackNavigator();
const Drawer = createDrawerNavigator();

import NavigationService from "./utils/NavigationService";
import PushNotificationIOS from "@react-native-community/push-notification-ios";
import { getRequest } from "./utils/network.js";
import { useDispatch, useSelector } from "react-redux";
// const currentUser = getUser()

export function Navigation(props) {
  // useEffect(()=>{
  //   Linking.addEventListener('url',handleOpenURL);
  // },[])

  // function handleOpenURL(event){
  //   console.log('Handle open url',props,event);
  // }

  React.useEffect(() => {
    const unsubscribe = messaging().onMessage(async (message) => {
        console.log('Notifications Test -> Notifications Test', message);
        PushNotificationIOS.addNotificationRequest({
          id: 'notificationWithSound',
          title: message?.notification?.title,
          body: message?.notification?.body,
          sound: 'customSound.wav',
          badge: 1
        })
    })

    return unsubscribe;
  }, []);

  return (
    <NavigationContainer
      ref={(navigatorRef) => {
        NavigationService.setTopLevelNavigator(navigatorRef);
      }}
    >
      <Stack.Navigator initialRouteName="HomeScreen">
        <Stack.Screen
          name="Seeker"
          component={Seeker}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="SeekerLinks"
          component={SeekerLinks}
          options={{
            headerShown: false,
            gestureEnabled: false
          }}
        />


        <Stack.Screen
          name="HomeScreen"
          component={HomeScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="SeekerUserWizard"
          component={SeekerUserWizard}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="SeekerLogin"
          component={SeekerLogin}
          options={{
            headerShown: false,
          }}
        />
        
        <Stack.Screen
          name="SeekerSignup"
          component={SeekerSignup}
          options={{
            headerShown: true,
            headerBackTitleVisible: false,
            headerTitle: "REGISTRATION",
            headerStyle: {
              backgroundColor: "#fff",
            },
            headerTintColor: "#4E35AE",
          }}
        />
        <Stack.Screen
          name="SeekerVerificationCode"
          component={SeekerVerificationCode}
          options={{
            headerShown: false,
          }}
        />
        
        <Stack.Screen
          name="SeekerForgotPassword"
          component={SeekerForgotPassword}
          options={{
            headerShown: false,
            headerBackTitleVisible: false,
            headerTitle: "Forgot Password",
            headerStyle: {
              backgroundColor: "#4E35AE",
            },
            headerTintColor: "#fff",
          }}
        />
        

        <Stack.Screen name="TestLinks" component={TestLinks} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default Navigation;


export function AppNavigation({ navigation }) {

  const userData = useSelector(state => state.UserData)
  const dispatch = useDispatch()

  useEffect(() => {
    getUserProfile()
  },[])

  const getUserProfile = async () => {
    try {
    const res = await getRequest(`/job-seeker/profile/${userData.profile.id}`,userData.token)
      const json = await res.json()
      dispatch({type: 'UserData/setState',payload: {profile: json.data}})
    } catch (error) {
      console.log('error while getting user profile',JSON.stringify(error))
    }
  }

  return (
    <AppNavigationStack.Navigator initialRouteName={'Seeker'}>
      <AppNavigationStack.Screen
        name="Seeker"
        component={Seeker}
        options={{
          headerShown: false,
          gestureEnabled: false

        }}
      />

      <AppNavigationStack.Screen
        name="SeekerLinks"
        component={SeekerLinks}
        options={{
          headerShown: false,
          gestureEnabled: false

        }}
      />

      
    </AppNavigationStack.Navigator>
  );
}

export function EditProfileNavigation({ navigation }) {
  const userData = useSelector(state => state.UserData)

  return (
    <EditProfileStack.Navigator initialRouteName={'Edit Profile'}>
      <EditProfileStack.Screen
        name="SeekerEditProfile"
        component={SeekerEditProfile}
        options={{
          headerShown: false,
          headerBackTitleVisible: false,
          //gestureEnabled: false
        }}
        initialParams={{ profile: userData.profile }}
      />

      <EditProfileStack.Screen
        name="SeekerAddPastPosition"
        component={SeekerAddPastPosition}
        options={{
          headerShown: false,
        }}
      />

      <EditProfileStack.Screen
        name="SeekerEditPastPosition"
        component={SeekerEditPastPosition}
        options={{
          headerShown: false,
        }}
      />
    </EditProfileStack.Navigator>
  );
}

export function AuthNavigation({ navigation }) {
  return (
    <AuthNavigationStack.Navigator >
      {/* <AuthNavigationStack.Screen
          name="HomeScreen"
          component={HomeScreen}
          options={{
            headerShown: false,
            gestureEnabled:false

          }}
        /> */}
      <AuthNavigationStack.Screen
        name="SeekerUserWizard"
        component={SeekerUserWizard}
        options={{
          headerShown: false,
          gestureEnabled: false

        }}
      />
      <AuthNavigationStack.Screen
        name="SeekerLogin"
        component={SeekerLogin}
        options={{
          headerShown: true,
          gestureEnabled: false,
          headerTitle: "",
          headerBackTitleVisible: false,
          headerLeft: () => (<CustomBack navigation={navigation} />)

        }}
      />
      
      <AuthNavigationStack.Screen
        name="SeekerSignup"
        component={SeekerSignup}
        options={{
          headerShown: true,
          headerBackTitleVisible: false,
          headerTitle: () => (<CustomHeader title="REGISTRATION" />),
          headerStyle: {
            backgroundColor: "#fff",
          },
          headerLeft: () => (<CustomBack navigation={navigation} />),
          headerTintColor: "#4E35AE",
          gestureEnabled: false

        }}
      />
      <AuthNavigationStack.Screen
        name="SeekerVerificationCode"
        component={SeekerVerificationCode}
        options={{
          headerShown: false,
          gestureEnabled: false

        }}
      />
      
      <AuthNavigationStack.Screen
        name="SeekerForgotPassword"
        component={SeekerForgotPassword}
        options={{
          headerShown: false,
          headerBackTitleVisible: false,
          headerTitle: "Forgot Password",
          headerStyle: {
            backgroundColor: "#4E35AE",
          },
          headerTintColor: "#fff",
          gestureEnabled: false

        }}
      />
      
      <Stack2.Screen
        name="SeekerFinishRegistration"
        component={SeekerFinishRegistration}
        options={{
          headerShown: true,
          headerBackTitleVisible: false,
          headerTitle: () => (<CustomHeader title="REGISTRATION" />),
          headerStyle: {
            backgroundColor: "#fff",
          },
          headerLeft: false,
          headerTintColor: "#4E35AE",
          gestureEnabled: false
        }}
      />
      <Stack2.Screen
        name="SeekerAddPastPosition"
        component={SeekerAddPastPosition}
        options={{
          headerShown: false,
        }}
      />

      <Stack2.Screen
        name="SeekerEditPastPosition"
        component={SeekerEditPastPosition}
        options={{
          headerShown: false,
        }}
      />


      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPassword}
        options={{
          headerShown: true,
          headerBackTitleVisible: false,
          headerTitle: "Forgot Password",
          headerStyle: {
            backgroundColor: "#4E35AE",
          },
          headerTintColor: "#fff",
        }}
      />

    </AuthNavigationStack.Navigator>
  )
}

function Seeker({ navigation }) {
  let home = require("../assets/tabbar_home_active.png");
  let home2 = require("../assets/tab_home_off.png");
  let qr = require("../assets/tab_qr.png");
  let qr2 = require("../assets/tab_qr_off.png");
  let jobs = require("../assets/tab_jobs.png");
  let jobs2 = require("../assets/tab_jobs_off.png");
  let notification = require("../assets/tabbar_notification_active.png");
  let notification2 = require("../assets/tab_notification_off.png");

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          let border = focused ? true : false;

          if (route.name === "SeekerHome") {
            iconName = focused ? home : home2;
          } else if (route.name === "SeekerScanQrCode") {
            iconName = focused ? qr : qr2;
          } else if (route.name === "SeekerAppliedJobs0") {
            iconName = focused ? jobs : jobs2;
          } else if (route.name === "SeekerNotifications") {
            iconName = focused ? notification : notification2;
          }

          return (
            <Icon iconName={iconName} border={border} navigation={navigation} />
          );
        },
      })}
      tabBarOptions={{
        // activeTintColor: 'purple',
        // inactiveTintColor: 'gray',
        showLabel: false,
      }}
    >
      <Tab.Screen name="SeekerHome" component={SeekerHomeRoute} />
      <Tab.Screen name="SeekerScanQrCode" component={SeekerScanQrCode} />
      <Tab.Screen
        name="SeekerAppliedJobs0"
        component={SeekerAppliedJobs0}
        initialRouteName={"SeekerAppliedJobs"}
      />
      <Tab.Screen name="SeekerNotifications" component={SeekerNotifications} />
    </Tab.Navigator>
  );
}
function SeekerHomeRoute({ navigation }) {
  return (
    <SeekerHomeStack.Navigator initialRouteName="SeekerHome">
      <Stack3.Screen
        name="SeekerHome"
        component={SeekerHome}
        options={{
          headerShown: false,
        }}
      />
      <Stack3.Screen
        name="SeekerBusinessList"
        component={SeekerBusinessList}
        options={{
          headerShown: false,
        }}
      />
      <Stack3.Screen
        name="SeekerHomeAvailableJobs"
        component={SeekerAvailableJobs}
        options={{
          headerShown: false,
        }}
      />
      <Stack3.Screen
        name="SeekerHomeJobDetail"
        component={SeekerJobDetail}
        options={{
          headerShown: false,
        }}
      />
    </SeekerHomeStack.Navigator>
  );
}

function SeekerLinks({ navigation }) {
  return (
    <Stack2.Navigator>
      <Stack2.Screen
        name="SeekerEditProfile"
        component={SeekerEditProfile}
        options={{
          headerShown: true,
          headerBackTitleVisible: false,
          headerTitle: () => (<CustomHeader title="REGISTRATION" />),
          headerStyle: {
            backgroundColor: "#fff",
          },
          headerLeft: () => (<CustomBack navigation={navigation} />),
          headerTintColor: "#4E35AE",
          gestureEnabled: false
        }}
      />
      <Stack2.Screen
        name="SeekerFinishRegistration"
        component={SeekerFinishRegistration}
        options={{
          headerShown: true,
          headerBackTitleVisible: false,
          headerTitle: () => (<CustomHeader title="REGISTRATION" />),
          headerStyle: {
            backgroundColor: "#fff",
          },
          headerLeft: () => (<CustomBack navigation={navigation} />),
          headerTintColor: "#4E35AE",
          gestureEnabled: false
        }}
      />
      <Stack2.Screen
        name="SeekerArchivedJobs"
        component={SeekerArchivedJobs}
        options={{
          headerShown: false,
        }}
      />
      {/* <Stack2.Screen name="SeekerJobDetail" component={SeekerJobDetail} options={{
          headerShown: false,
          }} /> */}
      <Stack2.Screen
        name="SeekerAddLang"
        component={SeekerAddLang}
        options={{
          headerShown: false,
        }}
      />
      <Stack2.Screen
        name="SeekerAddPastPosition"
        component={SeekerAddPastPosition}
        options={{
          headerShown: false,
        }}
      />
      <Stack2.Screen
        name="SeekerEditPastPosition"
        component={SeekerEditPastPosition}
        options={{
          headerShown: false,
        }}
      />
    </Stack2.Navigator>
  );
}

function BusinessLinks({ navigation }) {
  return (
    <Stack2.Navigator>
      <Stack2.Screen
        name="BusinessEditAccount"
        component={BusinessEditAccount}
        options={{
          headerShown: false,
        }}
      />
    </Stack2.Navigator>
  );
}

function SeekerAppliedJobs0({ navigation }) {
  return (
    <Stack2.Navigator initialRouteName="SeekerAppliedJobs">
      <Stack2.Screen
        name="SeekerAppliedJobs"
        component={SeekerAppliedJobs}
        options={{
          headerShown: false,
        }}
      />
      <Stack2.Screen
        name="SeekerJobDetail"
        component={SeekerJobDetail}
        options={{
          headerShown: false,
        }}
      />
      <Stack2.Screen
        name="SeekerAvailableJobs"
        component={SeekerAvailableJobs}
        options={{
          headerShown: false,
        }}
      />
    </Stack2.Navigator>
  );
}

export function MyDrawer({navigation}) {
  const userData = useSelector(state => state.UserData)

  return (
    <Drawer.Navigator
      drawerType={'front'}
      initialRouteName="Home"
      hideStatusBar={true}
      drawerStyle={{flex: 1, width: '100%', height: hp('100%'), backgroundColor: 'transparent'}}
      drawerContent={(props) => <CustomDrawer {...props} />}
    >
      <Drawer.Screen
        name="Home"
        component={AppNavigation}
        options={{
          headerShown: false,
          gestureEnabled: false
        }}/>
      <Drawer.Screen 
        name="EditProfile"
        component={EditProfileNavigation}
        options={{
          headerShown: false,
          gestureEnabled: false
        }}
      />
      <Drawer.Screen 
        name="SeekerAbout"
        component={SeekerAbout}
        options={{
          headerShown: true,
          headerBackTitleVisible: false,
          headerTitle: () => (<CustomHeader />),
          headerStyle: {
            backgroundColor: "#fff",
          },
          headerLeft: () => (<CustomBack navigation={navigation} />),
          headerTintColor: "#4E35AE",
          gestureEnabled: false

        }}
      />
    </Drawer.Navigator>
  );
}
  

function Icon(props) {
  return (
    <View
      style={
        props.border
          ? {
            borderBottomWidth: 2,
            borderBottomColor: "#5F46BF",
            paddingBottom: 5,
          }
          : { paddingBottom: 5 }
      }
    >
      <Image source={props.iconName} />
    </View>
  );
}
