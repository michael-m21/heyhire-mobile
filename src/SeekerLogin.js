import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TextInput,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  TouchableHighlight,
  Alert,
  Dimensions,
  Platform,
  Keyboard,
  PermissionsAndroid
} from "react-native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Countdown } from 'react-native-element-timer';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import * as Location from "expo-location";
import { countries } from "./utils/consts.js";
import RoundButton from "./components/RoundButton";
import { postFormData, postJSON } from "./utils/network.js";
import { setUser, setToken } from "./utils/utils.js";
import { KeyboardAccessoryNavigation } from "react-native-keyboard-accessory";
import { useIsFocused } from "@react-navigation/native";
import { strings } from "./translation/config";
import { AuthContext } from "./navigation/context";
import CommonUtils from './utils/CommonUtils';
import GeolocationNew from '@react-native-community/geolocation';
import OTPInputView from "@twotalltotems/react-native-otp-input";
import { useDispatch, useSelector } from "react-redux";
import notification from './SeekerPushNotifications';

function SeekerLogin({ navigation }) {
  const isFocused = useIsFocused();

  const [modalVisible, setModalVisible] = useState(false);
  const [phCode, setPhCode] = useState("1");
  const [phone, setPhone] = useState("");
  const [activeInputIndex, setActiveInputIndex] = useState(0);
  const [inputs, setInputs] = useState([]);
  const [nextFocusDisabled, setNextFocusDisabled] = useState(false);
  const [previousFocusDisabled, setPreviousFocusDisabled] = useState(false);
  const [otp,setOtp] = useState();
  const [resendButton, setResendButton] = useState(false);
  const [otpSent,setOtpSent] = useState(false);
  const [registrationOptSent, setRegistrationOptSent] = useState(false);
  const { signIn } = React.useContext(AuthContext);
  const [codeError, setCodeError] = useState(false);
  
  const timerRef = useRef(null);

  const dispatch = useDispatch()

  const userData = useSelector(state => state.UserData)

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

  async function getOtp() {
    try {
      const tempNumber = phone.replace("(", "").replace(")", "").replace(" ", "").replace("-", "");
      const body = {
        phone_number: tempNumber
      }
      const res = await postJSON("/job-seeker/sms-login/initiate",body)
      const json = await res.json();
      if(json.message == 'User found'){
        setOtpSent(true)
      } else if (json.errors && json.errors.phone_number && json.errors.phone_number[0] == "User not found.") {
        const _body = {
          phone_number: tempNumber
        };
        const response = await postJSON("/job-seeker/sms-registration/send-code", _body);
        const _json = await response.json();
        if ( _json.message == "Registration Code Sent" ) {
          setRegistrationOptSent(true);
          setOtpSent(true);
        } else {
          Alert.alert("Error", "Invalid Phone number. Please enter a valid phone number to continue.");
        }
      } else {
        Alert.alert("Error", "Invalid Phone number. Please enter a valid phone number to continue.");
      }
    } catch (error) {
      console.log('error', JSON.stringify(error))
    } 
  }

  async function verifyOtp() {
    try {
      const tempNumber = phone.replace("(", "").replace(")", "").replace(" ", "").replace("-", "");
      const body = {
        phone_number: tempNumber,
        validation_code: otp
      }
      if(registrationOptSent) {
        const res = await postJSON("/job-seeker/sms-registration/verify-code",body)
        const json = await res.json()
        if(json.message == "Registration Code Validated") {
          navigation.navigate("SeekerSignup", {
            contact: tempNumber
          });
        } else {
          setCodeError(true);
          //setRegistrationOptSent(false);
          //setOtpSent(false);
        }
      } else {
        const res = await postJSON("/job-seeker/sms-login/finalize",body)
        const json = await res.json()
        if(json.user && Object.keys(json.user).length > 0 && json.token){
          dispatch({type: 'UserData/setState',payload: {profile: json.user, token: json.token}});
          notification(json.token);
        } else {
          setCodeError(true);
          //navigation.navigate("SeekerSignup",{token: json.token})
        }
      }
    } catch (error) {
      console.log('error',error)
    } 
  }

  function handleResend(tempUserData) {
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

    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAwareScrollView
        style={styles.container}
        enableOnAndroid={true}
        extraScrollHeight={hp('15%')}
      >
        <View
          style={{
            flex: 1,
            marginTop: hp('10%'),
          }}
        >

          <View
            style={{
              marginHorizontal: "5%",
              marginBottom: 5
            }}
          >
            <Modal
              animationType="slide"
              transparent={false}
              visible={modalVisible}
              onRequestClose={() => {
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

            <Text style={{ color: '#000000', fontSize: hp('3%'), fontFamily: 'VisbyBold' }}>{strings.MY_PHONE_NO}</Text>
            <View
              style={{
                flexDirection: "row",
                marginTop: hp('5%')
              }}
            >

              <TouchableOpacity
                style={styles.code}
                onPress={() => setModalVisible(true)}
              >
                <Text style={{ color: "#000000", fontSize: hp('3%'), fontFamily: 'VisbySemibold' }}>+{phCode}</Text>
              </TouchableOpacity>

              <TextInput
                style={styles.code2}
                onChangeText={(text) => {
                  if(text.length < 15) {
                    setOtpSent(false);
                    setPhone(text);
                  }
                }}
                placeholder={strings.PHONE}
                value={formatPhone(phone)}
                textContentType="telephoneNumber"
                autoCompleteType={"tel"}
                keyboardType={"phone-pad"}
                placeholderTextColor={'#000000'}
                cursorColor={'#000000'}
                selectionColor={'#000000'}
                onFocus={() => {
                  handleFocus(0);
                }}
                ref={(ref) => {
                  handleRef(0, ref);
                }}
              />
            </View>
          </View>
          
        {otpSent ? 
          <>
            <View
              style={{
                marginHorizontal: "5%",
                marginVertical: 10,

              }}
            >
              <Text style={{ color: '#000000', fontSize: 16, marginBottom: 5 }}>{strings.CODE}</Text>
              <OTPInputView
                code={otp}
                style={{width: '100%', height: 50, alignSelf: 'center'}}
                pinCount={6}
                codeInputFieldStyle={styles.inputFieldStyle}
                codeInputHighlightStyle={styles.inputHighlightStyle}
                onCodeFilled = {(code) => {
                  setOtp(code);
                  setCodeError(false);
                }}
                placeholderTextColor='#000000'
                selectionColor='#000000'
            />
            </View>


            <View
              style={{
                alignItems: "center",
                marginHorizontal: "5%",
                marginVertical: 5,

              }}
            >
              < RoundButton backgroundColor='#594A9E' text={strings.VERIFY_OTP} textColor="#FFFFFF" onPress={() => verifyOtp()} />
              <View style={{flexDirection: 'row', width: '100%', alignItems: 'flex-start'}}>
              <Text style={styles.timerText}>Try </Text>
                <TouchableOpacity
                  onPress={() => {
                    setResendButton(false);
                    setOtp();
                    getOtp();
                    timerRef.current.start();
                    setCodeError(false);
                  }}
                  disabled={!resendButton}
                >
                  <Text style={[styles.timerText, {fontWeight: '600', color: resendButton ? '#594A9E' : 'gray'}]}>Resend Code</Text>
                </TouchableOpacity>
                <Text style={styles.timerText}> in: </Text>
                <Countdown
                  ref={timerRef}
                  initialSeconds={30}
                  autoStart={true}
                  textStyle={styles.timerText}
                  onTimes={e => {}}
                  onEnd={e => setResendButton(true)}
                />
              </View>
            </View>
          </> :
          <View
            style={{
              alignItems: "center",
              marginHorizontal: "8%",
              marginVertical: 5,
            }}
          >
            <Text style={styles.verificationText}>{strings.VERIFICATION_CODE_TEXT}</Text>
            <RoundButton backgroundColor='#594A9E' text={strings.CONTINUE} textColor="#FFFFFF" onPress={() => getOtp()} />
          </View>
        }
        {codeError && (
          <Text style={styles.errorText}>Invalid code. Please try again.</Text>
        )}
        </View>
      </KeyboardAwareScrollView>

      <KeyboardAccessoryNavigation
        androidAdjustResize={Platform.OS == "android"}
        avoidKeyboard={Platform.OS == "android"}
        onNext={handleFocusNext}
        onPrevious={handleFocusPrev}
        onDone={_onButtonClick}
        nextDisabled={nextFocusDisabled}
        previousDisabled={previousFocusDisabled}
        style={Platform.OS == "android" ? { top: 0 } : { top: 0 }}
      />
    </SafeAreaView>
  );
}

export default SeekerLogin;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  header: {
    flex: 1,
    alignItems: "flex-start",
  },
  code: {
    flexDirection: "row",
    borderBottomColor: "#000000",
    borderBottomWidth: 2,
    color: "#000000",
    width: "15%",
    alignItems: 'center',
    justifyContent: 'center'
  },
  code2: {
    fontFamily: 'VisbySemibold',
    fontSize: hp('3%'),
    borderBottomColor: "#000000",
    borderBottomWidth: 2,
    color: "#000000",
    width: "78%",
    height: hp('6%'),
    marginLeft: wp("5%"),
    paddingLeft: wp('5%')
  },
  code3: {
    flexDirection: "row",
    borderRadius: 5,
    borderColor: "#fff",
    borderWidth: 1,
    color: "#fff",
    width: "100%",
    height: 50,
    paddingTop: 10,
    paddingRight: 10,
    paddingBottom: 10,
    paddingLeft: 30,
    justifyContent: 'center'
  },
  button: {
    width: '100%',
    alignItems: 'center',
    alignContent: 'center',
    padding: 10,
    paddingVertical: 15,
    backgroundColor: '#F1F2F9',
    marginBottom: 10,
    borderRadius: 10,
  },
  inputFieldStyle: {
    width: (Dimensions.get('window').width * 0.9 - 45) / 6 ,
    height: 50,
    borderRadius: 5,
    borderColor: '#000000',
    borderWidth: 1,
    color: '#000000'
  },
  inputHighlightStyle: {
    width: (Dimensions.get('window').width * 0.9 - 45) / 6 ,

    height: 50,
    borderRadius: 5,
    borderColor: '#000000',
    borderWidth: 1
  },
  verificationText: {
    fontSize: hp('1.2%'),
    color: '#727272',
    textAlign: 'center',
    fontFamily: 'VisbySemibold',
    marginTop: hp('4%'),
    marginBottom: hp('5%'),
  },
  timer: {
    marginVertical: 10,
},
timerText: {
  fontSize: hp('1.6%'),
},
errorText: {
  paddingLeft: 20,
  fontSize: hp('1.4%'),
  color: 'red',
  fontWeight: '400'
},
});
