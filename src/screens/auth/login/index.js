import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  
  TextInput,
  SafeAreaView,
  Image,
  TouchableOpacity,
  FlatList,
  TouchableHighlight,
  ScrollView,
  KeyboardAvoidingView,
  Alert,
  Dimensions,
  Linking,
  Platform,
  Keyboard,
  PermissionsAndroid
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { countries } from "../../../utils/consts.js";
import { postFormData, getBaseURL } from "../../../utils/network.js";
import { setUser, setToken } from "./utils/utils.js";
import { KeyboardAccessoryNavigation } from "react-native-keyboard-accessory";
import { useIsFocused } from "@react-navigation/native";
import { strings } from "./translation/config";
import { AuthContext } from "./navigation/context";
import DeviceInfo from 'react-native-device-info';
import CommonUtils from './utils/CommonUtils';
import GeolocationNew from '@react-native-community/geolocation';
import {styles} from './style';
import { sharedImages } from "../../../images.js";

const isIphoneX = DeviceInfo.hasNotch();
const window = Dimensions.get("window");

function SeekerLogin({ navigation }) {
  const isFocused = useIsFocused();

  const [modalVisible, setModalVisible] = useState(false);
  const [loginBotton, setLoginButton] = useState(false);
  const [phCode, setPhCode] = useState("1");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [activeInputIndex, setActiveInputIndex] = useState(0);
  const [inputs, setInputs] = useState([]);
  const [nextFocusDisabled, setNextFocusDisabled] = useState(false);
  const [previousFocusDisabled, setPreviousFocusDisabled] = useState(false);
  const { signIn } = React.useContext(AuthContext);

  const [value, setValue] = useState("");
  const [contentHeight, setContentHeight] = useState(0);


  useEffect(() => {

    if (Platform.OS == "android") {
      setTimeout(() => {
        GeolocationNew.getCurrentPosition((position) => {
          console.log('Geo location Permission', position);
        }, (error) => {
          console.log('Geo location Permission Error', error);

        }, {
          enableHighAccuracy: true
        });
      }, 2500);
      setTimeout(() => {

        PermissionsAndroid.requestMultiple(
          [PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION]).then((granted) => {
           
          }).catch((error) => {
            
          });
      }, 3000);
    } else {

      (async () => {

        try {
          let { status } = await Location.requestPermissionsAsync();
          console.log('Location Permission', status);
          
        } catch (error) {


        }
      })();
    }

  }, [isFocused]);


  function _onPress(item) {
    setModalVisible(false);
    setPhCode(item.dial_code);
  }

  function handlePassword(pass) {
    if (pass.length > 0)
      setLoginButton(true);
    setPassword(pass);
  }

  function deviceToken(length) {
    let chars =
      "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var result = "";
    for (var i = length; i > 0; --i)
      result += chars[Math.floor(Math.random() * chars.length)];
    return result;
  }

  function handleLogin() {
    let token = deviceToken(128);
    let fireBaseToken = CommonUtils.deviceToken;
    console.log('Firebase token', fireBaseToken);
    let form = new FormData();
    form.append("phone", phCode + " " + formatPhone(phone));
    form.append("password", password);
    form.append("user_type", "2");

    form.append("device_tocken", fireBaseToken);
    console.log('Login form', form);
    postFormData("user_login", form)
      .then((res) => {
        return res.json();
      })
      .then((json) => {
        console.log(json);
        if (json.data) {
          if (json.data.user_type == "2") {
            let tempUserData = json.data;
            if (tempUserData.is_verified == 0) {
              setUser(tempUserData);
              setToken(token);
              handleResend(tempUserData);
            } else {
              tempUserData.avatar_image =
                tempUserData.avatar_image +
                "?random_number=" +
                new Date().getTime();
              setUser(tempUserData);
              setToken(token);
              signIn(tempUserData);
            } 
          } else {
            console.log(json.data.user_type);
          }
        } else {
          Alert.alert("", json.msg || json);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function handleResend(tempUserData) {
    console.log(phCode + " " + formatPhone(phone))
    let form = new FormData();
    form.append("user_type", tempUserData.user_type);
    form.append("phone", phCode + " " + formatPhone(phone));


    postFormData("send_verification_code", form)
      .then((res) => {
        return res.json();
      })
      .then((json) => {
        console.log('send verification', json);
        if (json.status_code == "300") {
          console.log(json.msg);
        } else {
          navigation.navigate("SeekerVerificationCode", {
            number: phCode + " " + phone,
            email: tempUserData.email,
            otp: json.otp,
            userId: tempUserData.user_id
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function formatPhone(str) {
    let cleaned = str.replace(/\D/g, "");
    let match = cleaned.match(/^(\d{3})(\d{3})(\d+)$/);
    if (match) {
      return "(" + match[1] + ") " + match[2] + "-" + match[3];
    }
    return str;


  }

  function onContentSizeChange(contentWidth, contentHeight) {
    // Save the content height in state
    setContentHeight(contentHeight);
  };

  // function _updatePhone(text){
  //   if(text.length > 3){
  //     let areaCode = text.substring(0, 3).replace(/[^0-9]/g, '')
  //     let ph = text.substring(3).replace(/[^0-9]/g, '')
  //     setPhone(areaCode + ' ' + ph)
  //   }else{
  //     setPhone(text)
  //   }

  // }

  function gotoPrivacyPolicy() {
    Linking.openURL('https://app.apployme.com/privacy_policy')
  }

  function gotoTermService() {
    Linking.openURL('https://app.apployme.com/terms_of_service')

  }


  function gotoForgotPassword() {
    const baseURL = getBaseURL('employee_forgot_password');
    navigation.navigate('ForgotPassword', { url: baseURL });
  }

  function handleFocus(index) {
    setActiveInputIndex(index);
    setNextFocusDisabled(index === inputs.length - 1);
    setPreviousFocusDisabled(index === 0);
  }

  function handleFocusNext() {
    inputs[activeInputIndex + 1].focus();
  }

  function handleFocusPrev() {
    inputs[activeInputIndex - 1].focus();
  }

  function handleRef(index, ref) {
    let tempInputs = inputs;
    tempInputs[index] = ref;
    setInputs(inputs);
  }

  function _onButtonClick() {
    inputs[0].focus()
    Keyboard.dismiss();


  }

  return (

    <LinearGradient style={styles.container} colors={["#4E35AE", "#775ED7"]} >
      <SafeAreaView style={styles.container}>
        <View style={{ flexDirection: 'row', position: 'absolute', top: 0, left: 0, bottom: 0 }}>
          <Image
            style={styles.imageBackground}
            source={sharedImages.image}
            resizeMode={'cover'}
          />

        </View>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={true} scrollEnabled={contentHeight + 50 > window.height}
          onContentSizeChange={onContentSizeChange}
          keyboardShouldPersistTaps='always' keyboardDismissMode='on-drag'     >


          <View style={{ height: window.height - (isIphoneX ? 200 : 135), justifyContent: 'center' }}>

            {/* <View
              style={{
                alignItems: "flex-start",
                marginHorizontal: "5%",
              }}
            >
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Image
                  source={require("../assets/ic_back_w.png")}
                  style={{
                    width: 40,
                    height: 30,
                    marginTop: 20,

                  }}
                />
              </TouchableOpacity>
            </View> */}

            <View
              style={{
                alignItems: "center",
                marginHorizontal: "5%",
                marginBottom: window.height * (isIphoneX ? 0.05 : 0.02)
              }}
            >
              <Image
                source={require("../assets/home-logo.png")}
                style={{
                  width: 120,
                  height: 120,
                  marginTop: 0,
                  opacity: 1,
                }}
                resizeMode={"stretch"}
              />
            </View>

            <View style={{ alignItems: 'center', justifyContent: 'center', marginVertical: isIphoneX ? 10 : 5, marginTop: 10 }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#fff', textAlign: 'center' }}>{strings.SIGN_IN}</Text>
            </View>



            <View
              style={{
                // alignItems: "center",
                marginHorizontal: "5%",
                marginBottom: 5
              }}
            >
              <Modal
                animationType="slide"
                transparent={false}
                visible={modalVisible}
                onRequestClose={() => {
                  // Alert.alert('Modal has been closed.');
                  setModalVisible(false)
                }}
              >
                <SafeAreaView>
                  <View style={{ marginTop: 22, marginHorizontal: "5%" }}>
                    <View
                      style={{
                        justifyContent: "flex-end",
                        alignItems: 'flex-end',
                      }}
                    >

                      <View style={{ marginRight: 20, paddingVertical: 5 }}>
                        <TouchableOpacity
                          onPress={() => setModalVisible(false)}
                        >
                          <Text style={{ color: "#4834A6", fontSize: 18 }}>
                            {strings.DONE}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View>
                      <FlatList
                        // ItemSeparatorComponent={<Separator />}
                        data={countries}
                        keyExtractor={(item) => item.code}
                        renderItem={({ item, index, separators }) => (
                          <TouchableHighlight
                            key={index}
                            onPress={() => _onPress(item)}
                            onShowUnderlay={separators.highlight}
                            onHideUnderlay={separators.unhighlight}
                          >
                            <View style={{ backgroundColor: "white" }}>
                              <View
                                style={{
                                  flex: 1,
                                  flexDirection: "row",
                                  justifyContent: "space-between",
                                  padding: 10,
                                  borderBottomWidth: 1,
                                  borderBottomColor: "#eee",
                                }}
                              >
                                <Text
                                  style={{
                                    fontSize: 20,
                                    color: "#222",
                                  }}
                                >
                                  {item.name}
                                </Text>
                                <Text
                                  style={{
                                    fontSize: 20,
                                    color: "#666",
                                  }}
                                >
                                  +{item.dial_code}
                                </Text>
                              </View>
                            </View>
                          </TouchableHighlight>
                        )}
                      />
                    </View>
                  </View>
                </SafeAreaView>
              </Modal>

              <Text style={{ color: '#fff', fontSize: 16 }}>{strings.PHONE_NUMBER}</Text>
              <View
                style={{
                  // flex: 1,
                  flexDirection: "row",
                  marginTop: 5

                }}
              >

                <TouchableOpacity
                  style={styles.code}
                  onPress={() => setModalVisible(true)}
                >
                  <Image
                    source={require("../assets/ic_call-1.png")}
                    style={{ width: 20, height: 20, marginRight: 5 }}
                  />
                  <Text style={{ color: "#fff" }}>+{phCode}</Text>
                </TouchableOpacity>

                <TextInput
                  style={styles.code2}
                  onChangeText={(text) => setPhone(text)}
                  placeholder={strings.PHONE}
                  value={formatPhone(phone)}
                  textContentType="telephoneNumber"
                  autoCompleteType={"tel"}
                  keyboardType={"phone-pad"}
                  placeholderTextColor={'#fff'}
                  cursorColor={'#fff'}
                  selectionColor={'#fff'}
                  onFocus={() => {
                    handleFocus(0);
                  }}
                  ref={(ref) => {
                    handleRef(0, ref);
                  }}
                />
              </View>
            </View>

            <View
              style={{
                marginHorizontal: "5%",
                marginVertical: 10,

              }}
            >
              <Text style={styles.labelText}>{strings.PASSWORD}</Text>
              <View style={{ flexDirection: "row", }}>
                <Image
                  source={require("../assets/ic_lock.png")}
                  style={{
                    width: 15,
                    height: 15,
                    position: "absolute",
                    top: 15,
                    left: 10,
                  }}
                />
                <TextInput
                  style={styles.code3}
                  secureTextEntry={true}
                  onChangeText={(text) => handlePassword(text)}
                  placeholder={strings.PASSWORD}
                  value={password}
                  textContentType="none"
                  autoCompleteType={"password"}
                  placeholderTextColor={'#fff'}
                  cursorColor={'#fff'}
                  selectionColor={'#fff'}
                  underlineColor={'#fff'}
                  onFocus={() => {
                    handleFocus(1);
                  }}
                  ref={(ref) => {
                    handleRef(1, ref);
                  }}
                />
              </View>
            </View>

            <View
              style={{
                alignItems: "center",
                marginHorizontal: "5%",
                marginVertical: 5,

              }}
            >

              <TouchableOpacity style={[styles.button,
              { backgroundColor: "#fff", }]}
                onPress={() => handleLogin()}>

                <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{strings.SIGN_IN}</Text>
              </TouchableOpacity>
            </View>


            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                marginVertical: 5
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 16,
                }}
              >
                {strings.DONT_ACCOUNT}
              </Text>
              <View style={{ borderBottomWidth: 0.5, borderBottomColor: '#fff' }}>

                <Text
                  style={{
                    marginLeft: 6,
                    color: "#fff",
                    fontSize: 16,
                    fontWeight: 'bold'
                  }}
                  onPress={() => navigation.navigate("SeekerSignup")}
                >
                  {strings.SIGN_UP}
                </Text>
              </View>
            </View>



            <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: isIphoneX ? 25 : 15 }}>
              <View style={{ borderBottomWidth: 0.5, borderBottomColor: '#fff' }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#fff', textAlign: 'center' }} onPress={gotoForgotPassword}>{strings.FORGOT_YOUR_PASSWORD}</Text>
              </View>
            </View>



          </View>
          <View >
            <View style={{ alignItems: 'center', justifyContent: 'center', marginVertical: 10 }}>
              <View style={{ borderBottomWidth: 0.5, borderBottomColor: '#fff' }}>
                <Text style={{ fontSize: 14, color: '#fff', textAlign: 'center' }} onPress={() => gotoTermService()} >{strings.TERM_OF_SERVICE}</Text>

              </View>
            </View>

            <View style={{ alignItems: 'center', justifyContent: 'center', }}>
              <View style={{ borderBottomWidth: 0.5, borderBottomColor: '#fff' }}>
                <Text style={{ fontSize: 14, color: '#fff', textAlign: 'center' }} onPress={() => gotoPrivacyPolicy()} >{strings.PRIVACY_POLICY}</Text>

              </View>
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                marginTop: 10,
                bottom: 0,
                borderTopWidth: 0.5,
                borderTopColor: '#fff',
                paddingTop: 10,
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 16,
                }}
              >
                {strings.BUSINESS_OWNER}
              </Text>
              <View style={{ borderBottomWidth: 0.5, borderBottomColor: '#fff' }}>
                <Text
                  style={{
                    marginLeft: 6,
                    color: "#fff",

                    fontSize: 16,
                    fontWeight: 'bold'
                  }}
                  onPress={() => navigation.navigate("BusinessLogin")}
                >
                  {strings.CLICK_HERE_TO_LOGIN}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      <KeyboardAccessoryNavigation
        androidAdjustResize={Platform.OS == "android"}
        avoidKeyboard={Platform.OS == "android"}
        onNext={handleFocusNext}
        onPrevious={handleFocusPrev}
        onDone={_onButtonClick}
        nextDisabled={nextFocusDisabled}
        previousDisabled={previousFocusDisabled}
        avoidKeyboard={true}
        style={Platform.OS == "android" ? { top: 0 } : { top: 0 }}
      />
    </LinearGradient>
  );
}

export default SeekerLogin;

