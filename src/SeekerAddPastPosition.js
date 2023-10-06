import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Image,
  Text,
  TextInput,
  Platform,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert
} from "react-native";
import { useSelector } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { getUser, getToken } from "./utils/utils.js";
import { postJSON } from "./utils/network.js";
import { KeyboardAccessoryNavigation } from "react-native-keyboard-accessory";
import {strings} from './translation/config';

function SeekerAddPastPosition({ route,navigation }) {
  const [user, setUser1] = useState({});
  const [deviceToken, setDeviceToken] = useState("");
  const [error, setError] = useState("");

  const [position, setPosition] = useState("");
  const [company, setCompany] = useState("");
  const [city, setCity] = useState("");
  const [from, setFrom] = useState(null);
  const [showFrom, setShowFrom] = useState(false);
  const [to, setTo] = useState(null);
  const [showTo, setShowTo] = useState(false);
  const [activeInputIndex, setActiveInputIndex] = useState(0);
  const [inputs, setInputs] = useState([]);
  const [nextFocusDisabled, setNextFocusDisabled] = useState(false);
  const [previousFocusDisabled, setPreviousFocusDisabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const userData = useSelector(state => state.UserData)

  function hideFrom(i) {
    if (i) setFrom(i);
    setShowFrom(false);
  }

  function hideTo(i) {
    if (i) setTo(i);
    setShowTo(false);
  }

  function formatDate(d) {
    return `${d.getFullYear()}-${("0" + (d.getMonth() + 1)).slice(-2)}-${(
      "0" + d.getDate()
    ).slice(-2)}`;
  }

  useEffect(() => {
    getUser().then((u) => {
      let u2 = JSON.parse(u);
      // console.log(u2)
      setUser1(u2);
      getToken().then((t) => setDeviceToken(t));
    });
  }, []);

  const handleUpdate = () => {
    if(validation() == true){
    const body = {
      position : position,
      employer : company,
      location : city,
      start_date : formatDate(from),
      end_date : formatDate(to)
    };
    console.log('handleUpdate -> body', body);
    const token = route.params.token ? route.params.token : userData.token;
      setLoading(true);
      postJSON("/job-seeker/past-position", body, token)
      .then((res) => {
        return res.json();
      })
      .then((json) => {
        if (!json.data || !json.data.id) {
          setError(json.message);
        } else {
          let tempPositions = route.params.positions;
          tempPositions.push(json.data);
          if(route.params && route.params.onGoBack){
            route.params.onGoBack(tempPositions);
          }
          setLoading(false);
          navigation.goBack();
        }
      })
      .catch((err) => {
        setLoading(false);
        console.log(err);
      });
    }
  };

  function validation() {
    if (!position || isValidatePresence(position) == "") {
      Alert.alert("Error...", "Enter a valid Position before continuing!")
      return false
    }
    else if (!company || isValidatePresence(company) == "") {
      Alert.alert("Error...", "Enter a valid Company name before continuing!")
      return false
    }
    else if (!city || isValidatePresence(city) == "") {
      Alert.alert("Error...", "Enter a valid Location before continuing!")
      return false
    }
    else if(from >= new Date) {
      Alert.alert("Error...", "Start date Must be less then current date")
      return false
    } else {
      return true
    }
  }

  function isValidatePresence(string) {
    return string.trim();
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

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {loading && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              width: "100%",
              height: "100%",
              zIndex: 999,
            }}
          >
            <ActivityIndicator
              animating={true}
              size={"large"}
              style={{ top: "50%" }}
              color={"#fff"}
            />
          </View>
        )}
    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <View style={{ height: 60 }}>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              paddingBottom: 20,
              paddingTop: 20,
            }}
          >
            <View style={{ width: "20%", marginLeft: 15 }}>
              <TouchableOpacity onPress={() => {
                console.log(route.params)
                navigation.goBack()
                }}>
                <Image
                  source={require("../assets/ic_back.png")}
                  style={{ width: 28, height: 22 }}
                />
              </TouchableOpacity>
            </View>
            <View style={{ width: "70%" }}>
              <Text style={{ color: "#4834A6", fontSize: hp('2%'), fontFamily: 'VisbySemibold' }}>
                {strings.ADD_YOUR_PAST_POSITION}
              </Text>
            </View>
          </View>
        </View>

        <View style={{ margin: 20 }}>
          <View style={{}}>
            <Text style={styles.fieldsText}>{strings.WHAT_WAS_YOUR_POSITION}</Text>
            <View style={styles.inputField}>
              <Image
                source={require("../assets/ic_description.png")}
                style={styles.icon}
              />
              <TextInput
                style={{ width: "100%", paddingLeft: 10, color: "#000" }}
                onChangeText={(text) => setPosition(text)}
                placeholder={strings.POSITON}
                value={position}
                onFocus={() => {
                  handleFocus(0);
                }}
                ref={(ref) => {
                  handleRef(0, ref);
                }}
              />
            </View>
          </View>

          <View style={{}}>
            <Text style={styles.fieldsText}>{strings.WHO_WAS_YOUR_EMPLOYER}</Text>
            <View style={styles.inputField}>
              <Image
                source={require("../assets/ic_business.png")}
                style={styles.icon}
              />
              <TextInput
                style={{ width: "100%", paddingLeft: 10, color: "#000" }}
                onChangeText={(text) => setCompany(text)}
                placeholder={strings.COMPANY_NAME}
                value={company}
                onFocus={() => {
                  handleFocus(1);
                }}
                ref={(ref) => {
                  handleRef(1, ref);
                }}
              />
            </View>
          </View>

          <View style={{}}>
            <Text style={styles.fieldsText}>{strings.WHERE_WAS_YOUR_WORK_LOCATED}</Text>
            <View style={styles.inputField}>
              <Image
                source={require("../assets/ic_location_small.png")}
                style={styles.icon}
              />
              <TextInput
                style={{ width: "100%", paddingLeft: 10, color: "#000" }}
                onChangeText={(text) => setCity(text)}
                placeholder={strings.CITY_COUNTRY}
                value={city}
                onFocus={() => {
                  handleFocus(2);
                }}
                ref={(ref) => {
                  handleRef(2, ref);
                }}
              />
            </View>
          </View>

          <View style={{}}>
            <Text style={styles.fieldsText}>{strings.HOW_LONG_HAVE_YOU_BEEN_WORKING}</Text>
            <View style={{ flexDirection: "row", width: "85%" }}>
            <TouchableOpacity
                  style={{ width:'55%' }}
                  onPress={(val) => setShowFrom(!showFrom)}
                >
              <View style={styles.inputField}>
                <Image
                  source={require("../assets/ic_calendar.png")}
                  style={styles.icon}
                />
               
                  {from ? (
                    <Text style={{ paddingLeft:10,width: 120 }}>{formatDate(from)}</Text>
                  ) : (
                    <Text style={{ paddingLeft:10,width: 120, color: "#B1B4C7" }}>From Date</Text>
                  )}
              </View>
              </TouchableOpacity>

              <View style={{ width: "2%" }}></View>
              <TouchableOpacity
                  style={{width:'55%' }}
                  onPress={(val) => setShowTo(!showTo)}
                >
              <View style={styles.inputField}>
                <Image
                  source={require("../assets/ic_calendar.png")}
                  style={styles.icon}
                />
                
                  {to ? (
                    <Text style={{ paddingLeft:10, width: 120 }}>{formatDate(to)}</Text>
                  ) : (
                    <Text style={{ paddingLeft:10, width: 120, color: "#B1B4C7" }}>To Date</Text>
                  )}
                
              </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={{
                width: "100%",
                backgroundColor: "#5F46BF",
                alignItems: "center",
                padding: 15,
                borderRadius: 50,
              }}
              onPress={() => handleUpdate()}
            >
              <Text style={{ color: "#fff", fontSize: hp('2.1%'), fontFamily: 'VisbyBold' }}>{strings.ADD_POSITION}</Text>
            </TouchableOpacity>
          </View>

          <DateTimePickerModal
            isVisible={showFrom}
            mode="date"
            onConfirm={(i) => hideFrom(i)}
            onCancel={(i) => hideFrom(i)}
            maximumDate={new Date()}
            display="spinner"
          />
          <DateTimePickerModal
            isVisible={showTo}
            mode="date"
            onConfirm={(i) => hideTo(i)}
            onCancel={(i) => hideTo(i)}
            maximumDate={new Date()}
            display="spinner"
          />
        </View>
      </View>
     
    </SafeAreaView>
    </ScrollView>
 <KeyboardAccessoryNavigation
 onNext={handleFocusNext}
 onPrevious={handleFocusPrev}
 nextDisabled={nextFocusDisabled}
 previousDisabled={previousFocusDisabled}
 androidAdjustResize={Platform.OS == "android"}
 avoidKeyboard={Platform.OS == "android"}
 style={Platform.OS == "android" && { top: 0 }}
/></View>

  );
}

export default SeekerAddPastPosition;

const styles = StyleSheet.create({
  inputField: {
    backgroundColor: "#fff",
    borderColor: "#eee",

    paddingLeft: 10,
    paddingTop: 5,
    paddingRight: 10,
    paddingBottom: 5,

    marginTop: 10,
    marginBottom: 15,
    marginRight: 0,
    marginLeft: 0,

    borderWidth: 1,
    borderRadius: 10,
    shadowColor: "#bbb",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
    // flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: 50,
  },
  fieldsText: {
    fontSize: hp('1.6%'),
    fontFamily: 'VisbySemibold',
    color: '#3D3B4E'
  },
  icon: {
    width: hp('2.5%'),
    height: hp('2.5%'),
    resizeMode: 'contain'
  }
});
