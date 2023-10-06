import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  Alert,
  Keyboard,
  Linking
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import * as ImagePicker from 'expo-image-picker'
import { countries } from './utils/consts.js'
import { postJSON } from './utils/network.js'
import * as Location from 'expo-location'
import { KeyboardAccessoryNavigation, KeyboardAccessoryView } from 'react-native-keyboard-accessory'
import { strings } from './translation/config'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import DeviceInfo from 'react-native-device-info';
import parsePhoneNumber from 'libphonenumber-js'
import examples from 'libphonenumber-js/examples.mobile.json'
import { getExampleNumber } from 'libphonenumber-js';
import Loader from './components/Loader';
const isIphoneX = DeviceInfo.hasNotch();
function SeekerSignup({ navigation, route }) {
  const scrollViewRef = useRef();

  const [modalVisible, setModalVisible] = useState(false)
  const [location, setLocation] = useState(null)
  const [error, setError] = useState('')

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [address, setAddress] = useState('')
  const [country, setCountry] = useState('US')
  const [state, setState] = useState('')
  const [city, setCity] = useState('')
  const [zipcode, setZipcode] = useState('')
  const [phCode, setPhCode] = useState('1')
  const [phone, setPhone] = useState(route.params.contact)
  const [email, setEmail] = useState('')
  const [activeInputIndex, setActiveInputIndex] = useState(0)
  const [inputs, setInputs] = useState([])
  const [nextFocusDisabled, setNextFocusDisabled] = useState(false)
  const [previousFocusDisabled, setPreviousFocusDisabled] = useState(false)

  const [phoneMaxLength, setPhoneMaxLength] = useState(20);
  const [phCountryCode, setPhCountryCode] = useState("US");
  const [keyboardHeight, setKeyboardHeight] = useState(301);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const phoneNumber = getExampleNumber(phCountryCode, examples)
    setPhoneMaxLength(phoneNumber.formatNational().length);

    Keyboard.addListener("keyboardDidShow", _keyboardDidShow);
    Keyboard.addListener("keyboardDidHide", _keyboardDidHide);

    ; (async () => {
      let { status } = await Location.requestPermissionsAsync()
      if (status !== 'granted') {
        setError('Permission to access location was denied')
      }
      /*
      const status1 = await ImagePicker.requestCameraRollPermissionsAsync();
      if (status1.status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!')
      }
*/
      Location.getLastKnownPositionAsync().then((loc) => {
        setAddressField(loc)
        setLocation(loc)
      }).catch(error => {
        Location.getCurrentPositionAsync({}).then((location) => {
          setAddressField(location)
          setLocation(location)
        }).catch(err => {
          Alert.alert("", err.message)
        });
      });
    })()
  }, [])


  const _keyboardDidShow = (event) => {
    console.log("Keyboard Shown", event);
    setKeyboardHeight(event.endCoordinates.height)
  };

  const _keyboardDidHide = (event) => {
    console.log("Keyboard Hidden", event);
    setKeyboardHeight(301)

  };


  async function setAddressField(location) {
    const loc = {
      latitude: location?.coords?.latitude,
      longitude: location?.coords?.longitude
    };
    setTimeout(() => {
      Location.reverseGeocodeAsync(loc).then((addressObject) => {
        console.log(addressObject);
        let name = addressObject[0].name || '';
        let street = addressObject[0].street || '';


        if (street && !(name.includes(street))) {
          name = name + ' ' + street;
        }

        const country = countries.find(
          item => item.code == addressObject[0].isoCountryCode
        );
        // setAddress(name)
        setState(addressObject[0].region)
        // setCity(addressObject[0].city)
        setCountry(country.name)
        setPhCode(country.dial_code)
        // setZipcode(addressObject[0].postalCode)
      }).catch((error) => {
        console.log('setAddressField error', error);
      })
    }, 1000)
  }

  function formatPhone(str) {
    // let cleaned = str.replace(/\D/g, '')
    // let match = cleaned.match(/^(\d{3})(\d{3})(\d+)$/)
    // if (match) {
    //   return '(' + match[1] + ') ' + match[2] + '-' + match[3]
    // }
    // return str;
    const phoneNumber = parsePhoneNumber(phone, phCountryCode);
    if (phoneNumber) {
      return (phoneNumber.formatNational().replace(/^0+/, ''));
    }
  }

  function formatPhoneAPI(str) {
    let cleaned = str.replace(/\D/g, '')
    let match = cleaned.match(/^(\d{3})(\d{3})(\d+)$/)
    if (match) {
      return '(' + match[1] + ') ' + match[2] + '-' + match[3]
    }
    return str;
  }

  // function _updatePhone(text){
  //   if(text.length > 3){
  //     let areaCode = text.substring(0, 3).replace(/[^0-9]/g, '')
  //     let ph = text.substring(3).replace(/[^0-9]/g, '')
  //     setPhone(areaCode + ' ' + ph)
  //   }else{
  //     setPhone(text)
  //   }

  // }

  function _onPress(item) {
    setModalVisible(false)
    const phoneNumber = getExampleNumber(item.code, examples)
    setPhCountryCode(item.code);
    setPhoneMaxLength(phoneNumber.formatNational().length)
    setPhCode(item.dial_code)
  }

  function _onPress2(item) {
    setModalVisible(false)
    const phoneNumber = getExampleNumber(item.code, examples)
    setPhCountryCode(item.code);
    setPhoneMaxLength(phoneNumber.formatNational().length)
    setCountry(item.name)
    setPhCode(item.dial_code)
  }

  function deviceToken(length) {
    let chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    var result = ''
    for (var i = length; i > 0; --i)
      result += chars[Math.floor(Math.random() * chars.length)]
    return result
  }

  createAccount = async () => {
    if (validation() == true) {
      if (
        firstName &&
        lastName &&
        address &&
        city &&
        state &&
        email &&
        phone
      ) {
      try {
        const body = {
          first_name: firstName,
          last_name: lastName,
          address: address,
          zip_code: zipcode,
          state: state,
          city: city,
          email: email,
          phone: route.params.contact
      }
        const res = await postJSON("/job-seeker/profile", body)
        const json = await res.json();
        if (json.token) {
          navigation.navigate('SeekerFinishRegistration',{token: json.token, user: json.user, profile: body});
        } else if (json.errors && json.errors.email) {
          setError(json.errors.email[0]);
        } else if (json.message) {
          setError('The Phone number is already been registered use another Phone number.');
        }
      } catch (error) {
        Alert.alert('Error Over Here ',error)
        console.log('error while creating profile',error)
      }
      }
      else{
        setError(strings.PLEASE_FILL_MISSING)
      }
    }
  }

  function isValidatePresence(string) {

    return string.trim();

  }

  function validation() {
    if (!firstName || isValidatePresence(firstName) == "") {
      Alert.alert("Error...", "Enter a valid First name before continuing!")
      return false
    }
    else if (!lastName || isValidatePresence(lastName) == "") {
      Alert.alert("Error...", "Enter a valid Last name before continuing!")
      return false
    }
    else if (!country || isValidatePresence(country) == "") {
      Alert.alert("Error...", "Enter a valid Country before continuing!")
      return false
    }
    else if (!address || isValidatePresence(address) == "") {
      Alert.alert("Error...", "Enter a valid Address before continuing!")
      return false
    }
    else if (!state || isValidatePresence(state) == "") {
      Alert.alert("Error...", "Enter a valid State name before continuing!")
      return false
    }
    else if (!zipcode || isValidatePresence(zipcode) == "") {
      Alert.alert("Error...", "Enter a valid Zipcode before continuing!")
      return false
    }
    else if (!city || isValidatePresence(city) == "") {
      Alert.alert("Error...", "Enter a valid City name before continuing!")
      return false
    }

    else if (!phone || isValidatePresence(phone) == "") {
      Alert.alert("Error...", "Enter a valid Phone Number before continuing!")
      return false
    }
    else if (!email || isValidatePresence(email) == "") {
      Alert.alert("Error...", "Enter a valid Email before continuing!")
      return false
    }
    else if (!email.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/)) {
      Alert.alert("Error...", "Enter a valid email before continuing!")
      return false
    }
    else {
      return true
    }
  }

  // function onSelectCountry(country){
  //   setCountry(country);
  //   setPhCode(country);
  // }

  function handleFocus(index) {
    setActiveInputIndex(index);
    setNextFocusDisabled(index === inputs.length - 1);
    setPreviousFocusDisabled(index === 0);

  }

  function handleFocusNext() {
    inputs[activeInputIndex + 1].focus()
  }

  function handleFocusPrev() {
    inputs[activeInputIndex - 1].focus()
  }

  function handleRef(index, ref) {
    let tempInputs = inputs
    tempInputs[index] = ref
    setInputs(inputs)
  }

  function gotoPrivacyPolicy() {
    Linking.openURL('https://app.apployme.com/privacy_policy')
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAwareScrollView style={[styles.container]} extraScrollHeight={Platform.OS === "ios" ? 50 : 0} extraHeight={Platform.OS === "ios" ? 140 : null} >
      <View
          style={{
            flex: 1,
            marginTop: '5%',
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: "#4834A6",
              fontSize: hp("2.1%"),
              fontFamily: 'VisbyExtrabold',
            }}
          >
            {strings.REGISTRATION}
          </Text>
        </View>

        <Loader loading={loading} />

        <View style={{ flex: 1, alignItems: 'center', paddingHorizontal: 20, marginBottom: hp('5%') }} />

        <View style={styles.inputField}>
          <Image
            source={require('../assets/ic_user.png')}
            style={{ height: 20, width: 20 }}
          />
          <TextInput
            style={[{ paddingLeft: 10, width: '100%', color: '#000', borderWidth: 0 }, Platform.OS === "ios" && { height: 30 }]}
            onChangeText={text => setFirstName(text)}
            placeholder={strings.FIRSTNAME}
            value={firstName}
            textContentType='givenName'
            autoCompleteType={'name'}
            keyboardType={'default'}
            autoCapitalize={'words'}
            onFocus={() => {
              handleFocus(0)
            }}
            ref={ref => {
              handleRef(0, ref)
            }}
          />
        </View>

        <View style={styles.inputField}>
          <Image
            source={require('../assets/ic_user.png')}
            style={{ height: 20, width: 20 }}
          />
          <TextInput
            style={[{ paddingLeft: 10, width: '100%', color: '#000' }, Platform.OS === "ios" && { height: 30 }]}
            onChangeText={text => setLastName(text)}
            placeholder={strings.LASTNAME}
            value={lastName}
            textContentType='familyName'
            autoCompleteType={'name'}
            keyboardType={'default'}
            autoCapitalize={'words'}
            onFocus={() => {
              handleFocus(1)
            }}
            ref={ref => {
              handleRef(1, ref)
            }}
          />
        </View>

        <View style={styles.inputField}>
          <Image
            source={require('../assets/ic_address.png')}
            style={{ height: 20, width: 20 }}
          />
          <TextInput
            style={[{ paddingLeft: 10, width: '100%', color: '#000' }, Platform.OS === "ios" && { height: 30 }]}
            onChangeText={text => setAddress(text)}
            placeholder={strings.ADDRESS}
            value={address}
            textContentType='fullStreetAddress'
            autoCompleteType={'street-address'}
            keyboardType={'default'}
            onFocus={() => {
              handleFocus(2)
            }}
            ref={ref => {
              handleRef(2, ref)
            }}
          />
        </View>

        <View style={styles.inputField}>
          <Image
            source={require('../assets/ic_country.png')}
            style={{ height: 20, width: 20 }}
          />
          <TextInput
            style={[{ paddingLeft: 10, width: '100%', color: '#000' }, Platform.OS === "ios" && { height: 30 }]}
            onChangeText={text => setCity(text)}
            placeholder={strings.CITY}
            value={city}
            textContentType='addressCity'
            keyboardType={'default'}
            onFocus={() => {
              handleFocus(4)
            }}
            ref={ref => {
              handleRef(4, ref)
            }}
          />
        </View>

        <View style={styles.inputField}>
          <Image
            source={require('../assets/ic_country.png')}
            style={{ height: 20, width: 20 }}
          />
          <TextInput
            style={[{ paddingLeft: 10, width: '100%', color: '#000' }, Platform.OS === "ios" && { height: 30 }]}
            onChangeText={text => setState(text)}
            placeholder={strings.STATE}
            value={state}
            textContentType='addressState'
            keyboardType={'default'}
            autoCompleteType={'street-address'}
            onFocus={() => {
              handleFocus(3)
            }}
            ref={ref => {
              handleRef(3, ref)
            }}
          />
        </View>

        <View style={styles.inputField}>
          <Image
            source={require('../assets/ic_zip.png')}
            style={{ height: 20, width: 20 }}
          />
          <TextInput
            style={[{ paddingLeft: 10, width: '100%', color: '#000' }, Platform.OS === "ios" && { height: 30 }]}
            onChangeText={text => setZipcode(text)}
            placeholder={strings.ZIP}
            value={zipcode}
            keyboardType='number-pad'
            textContentType='postalCode'
            autoCompleteType={'postal-code'}
            onFocus={() => {
              handleFocus(5)
            }}
            ref={ref => {
              handleRef(5, ref)
            }}
          />
        </View>

        <View
          style={{
            flex: 2,
            alignItems: 'center'
          }}
        >
          <View style={styles.inputField}>
            <Image
              source={require('../assets/ic_call.png')}
              style={{ height: 20, width: 20 }}
            />
            <TextInput
              style={[{ paddingLeft: 10, width: '100%', color: '#000' }, Platform.OS === "ios" && { height: 30 }]}
              editable={false}
              onChangeText={text => setPhone(text)}
              placeholder={strings.PHONE}
              value={formatPhone(phone)}
              maxLength={phoneMaxLength}

              keyboardType={'phone-pad'}
              textContentType='telephoneNumber'
              autoCompleteType={'tel'}
              onFocus={() => {
                handleFocus(6)
              }}
              ref={ref => {
                handleRef(6, ref)
              }}
            />
          </View>
        </View> 

        <View style={styles.inputField}>
          <Image
            source={require('../assets/ic_mail.png')}
            style={{ height: 20, width: 20 }}
          />
          <TextInput
            style={[{ paddingLeft: 10, width: '100%', color: '#000', }, Platform.OS === "ios" && { height: 30 }]}
            onChangeText={text => setEmail(text)}
            placeholder={strings.EMAIL}
            value={email}
            type='email'
            textContentType='username'
            keyboardType={'email-address'}
            autoCompleteType={'email'}
            autoCapitalize='none'
            returnKeyType='done'
            onSubmitEditing={() => createAccount()}
            onFocus={() => {
              handleFocus(7)
            }}
            ref={ref => {
              handleRef(7, ref)
            }}

          />
        </View>

        {error ? (
          <View style={{ flex: 1, padding: 20 }}>
            <Text style={{ color: 'red' }}>{error}</Text>
          </View>
        ) : null}

        <View style={{ flex: 1, marginBottom: 20 }}>
          <TouchableOpacity
            style={{
              flex: 1,
              alignContent: 'center',
              backgroundColor: '#5B42BB',
              padding: 15,
              borderRadius: 30,
              marginTop: 20
            }}
            onPress={() => createAccount()}
          >
            <Text
              style={{ color: '#fff', textAlign: 'center', fontSize: 18 }}
            >
              {strings.CREATE_ACCOUNT}
            </Text>
          </TouchableOpacity>
          <Text style={styles.terms} onPress={gotoPrivacyPolicy}>{strings.VIEW_TERMS_PRIVACY}</Text>
        </View>
        <View style={{ height: 50 }}></View>
      </KeyboardAwareScrollView>
      <KeyboardAccessoryNavigation
        onNext={handleFocusNext}
        onPrevious={handleFocusPrev}
        nextDisabled={nextFocusDisabled}
        previousDisabled={previousFocusDisabled}
        androidAdjustResize={Platform.OS == 'android'}
        avoidKeyboard={Platform.OS == 'android'}
        style={Platform.OS == "android" ? { top: 0 } : { top: isIphoneX ? keyboardHeight > 301 ? -310 : -270 : keyboardHeight > 216 ? -260 : -230 }}
      />
    </SafeAreaView>
  )
}

export default SeekerSignup

const styles = StyleSheet.create({
  container: {
    //  flex: 1,
    flexDirection: 'column',
    paddingHorizontal: 20,
    backgroundColor: 'white'
  },
  inputField: {
    height: Platform.OS == "ios" ? 40 : 50,
    padding: 10,
    width: '100%',
    backgroundColor: '#fff',
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    borderColor: "#eee",
    // borderWidth: 1,
    marginBottom: 15,
    borderRadius: 8,
    shadowColor: "#bbb",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
    alignItems: 'center',
    paddingVertical: 5

  },
  terms: {
    marginTop: hp('3%'),
    color: '#727272',
    textAlign: 'center',
    textDecorationLine: 'underline',
    fontFamily: 'VisbyRegular'
    //textDecorationStyle: 'under'

  },
  code: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    borderRadius: 8,
    borderColor: "#eee",
    borderWidth: 1,
    paddingTop: 10,
    paddingLeft: 10,
    // color: '#fff',
    width: '25%',
    height: Platform.OS == "ios" ? 40 : 50,
    marginBottom: 10,
    shadowColor: "#bbb",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,

  },
  code2: {
    color: '#000',
    backgroundColor: '#fff',
    flexDirection: 'row',
    borderRadius: 8,
    borderColor: "#eee",
    borderWidth: 1,
    padding: 10,
    // color: '#fff',123
    width: '69%',
    // height: 40,
    marginLeft: '5%',
    marginBottom: 10,
    shadowColor: "#bbb",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  }
})
