import React from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Alert,
  Image
} from "react-native";
import {
  DrawerContentScrollView,
  DrawerItem,
} from '@react-navigation/drawer';
import { DrawerActions } from '@react-navigation/native';
import { Drawer } from 'react-native-paper';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import { useDispatch, useSelector } from "react-redux";

import CommonUtils from '../utils/CommonUtils';
import { deleteJSON } from "../utils/network";


const CustomDrawer = (props) => {

  const dispatch = useDispatch();
  const userData = useSelector((state) => state.UserData);

  async function deleteDeviceTokentoServer() {
    deleteJSON(`/job-seeker/auth/push-token/${CommonUtils.deviceToken}`, userData.token)
    .then((res) => {
      return res.json();
    })
    .then((json) => {
      console.log('deleteDeviceTokentoServer -> json', json);
    })
    .catch((err) => {
      console.log(err);
    });
  }

  function _onLogout() {
    Alert.alert("HeyHire", `Are you sure you want to logout now?`, [
      {
        text: "Logout",
        onPress: () => {
          dispatch({type:'UserData/setState',payload: {token: null, profile: {}}});
          deleteDeviceTokentoServer();
        },
      },
      { text: "Cancel", onPress: () => console.log("OK Pressed") },
    ]);
  }

  return (
      <DrawerContentScrollView {...props} contentContainerStyle={{flex: 1}}>
        <View style={styles.mainContainer}>
          <View style={styles.subContainer_1}>
            <DrawerItem
              icon={() => (
                <Image
                  source={require('../../assets/ic_home_menu.png')}
                  style={styles.iconStyle}
                />
              )}
              label="Home"
              onPress={() => props.navigation.dispatch(DrawerActions.closeDrawer())}
            />
            <DrawerItem
              icon={() => (
                <Image
                  source={require('../../assets/ic_edit_menu.png')}
                  style={styles.iconStyle}
                />
              )}
              label="Edit Profile"
              onPress={() => props.navigation.jumpTo('EditProfile')}
            />
            <DrawerItem
              icon={() => (
                <Image
                  source={require('../../assets/ic_help_menu.png')}
                  style={styles.iconStyle}
                />
              )}
              label="Help"
              onPress={() => alert('Help')}
            />
            <DrawerItem
              icon={() => (
                <Image
                  source={require('../../assets/ic_about_menu.png')}
                  style={styles.iconStyle}
                />
              )}
              label="About"
              onPress={() => props.navigation.navigate('SeekerAbout')}
            />
            <Drawer.Section style={styles.bottomContainer}>
              <DrawerItem
                icon={() => (
                  <Image
                    source={require('../../assets/ic_logout_sideMenu.png')}
                    style={styles.iconStyle}
                  />
                )}
                label="Logout"
                onPress={() => _onLogout()}
              />
              <Image
                source={require('../../assets/headerImage.png')}
                style={{ width: wp('35%'), height: hp('10%'), resizeMode: 'contain', alignSelf: 'center' }}
              />
            </Drawer.Section>
          </View>
          <View style={{flex: 2}}>
            <TouchableOpacity style={styles.subContainer_2} onPress={() => props.navigation.dispatch(DrawerActions.closeDrawer())} />
          </View>
        </View>
      </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    flexDirection: 'row',
    width: wp('100%'),
    height: hp('100%'),
    marginTop: -getStatusBarHeight()
  },
  subContainer_1: {
    flex: 8,
    paddingTop: getStatusBarHeight(),
    backgroundColor: 'white',
    height: hp('100%')
  },
  subContainer_2: {
    flex: 1,
    width: '100%',
    height: '100%'
  },
  bottomContainer: {
    position: 'absolute',
    bottom: hp('5%'),
    left: 0,
    width: '100%',
  },
  iconStyle: {
    marginRight: -wp('5%'),
    width: hp('2.5%'),
    height: hp('2.5%'),
    resizeMode: 'contain'
  }
});
export default CustomDrawer;
