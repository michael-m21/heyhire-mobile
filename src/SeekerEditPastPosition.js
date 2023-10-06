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
} from "react-native";
import { useSelector } from "react-redux";
import moment from "moment";
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { putJSON, deleteJSON } from "./utils/network.js";
import { KeyboardAccessoryNavigation } from "react-native-keyboard-accessory";
import {strings} from './translation/config';

function SeekerEditPastPosition({ route, navigation }) {
  console.log(route);
  const [error, setError] = useState("");

  const [position, setPosition] = useState(route.params.position.position);
  const [company, setCompany] = useState(route.params.position.employer);
  const [city, setCity] = useState(route.params.position.location);
  const [from, setFrom] = useState(route.params.position.start_date);
  const [showFrom, setShowFrom] = useState(false);
  const [to, setTo] = useState(route.params.position.end_date);
  const [showTo, setShowTo] = useState(false);
  const [activeInputIndex, setActiveInputIndex] = useState(0);
  const [inputs, setInputs] = useState([]);
  const [nextFocusDisabled, setNextFocusDisabled] = useState(false);
  const [previousFocusDisabled, setPreviousFocusDisabled] = useState(false);
  const userData = useSelector((state) => state.UserData);

  function hideFrom(i) {
    if (i) setFrom(i);
    setShowFrom(false);
  }

  function hideTo(i) {
    if (i) setTo(i);
    setShowTo(false);
  }

  const handleUpdate = () => {
    if(validation() == true){
    const body = {
      position : position,
      employer : company,
      location : city,
      start_date : moment.utc(from).format('YYYY-MM-DD'),
      end_date : moment.utc(to).format('YYYY-MM-DD')
    };
    const token = route.params.token ? route.params.token : userData.token;
      putJSON(`/job-seeker/past-position/${route.params.position.id}`, body, token)
      .then((res) => {
        return res.json();
      })
      .then((json) => {
        if (!json.data || !json.data.id) {
          setError(json.message);
        } else {
          if(route.params && route.params.onGoBack){
            let tempPositions = route.params.positions.map(obj => {
              if (obj.id == json.data.id) {
                return json.data;
              } else {
                return obj;
              }
            })
            route.params.onGoBack(tempPositions);
          }
          navigation.goBack();
        }
      })
      .catch((err) => {
        console.log('Update Past Position error', JSON.stringify(err));
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

  function handleDelete() {
    const token = route.params.token ? route.params.token : userData.token;
    deleteJSON(`/job-seeker/past-position/${route.params.position.id}`, token)
      .then((res) => {
        return res.json();
      })
      .then((json) => {
          let tempPostions = route.params.positions;
          tempPostions = tempPostions.filter(
            (item) => item.id != route.params.position.id
          );
          route.params.onGoBack(tempPostions);
          navigation.goBack();
      })
      .catch((err) => {
        console.log(err);
      });
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
              <SafeAreaView style={{ flex: 1 }}>

      <View style={{ height: 80 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingBottom: 20,
                  paddingTop: 20,
                }}
              >
                <View style={{ width: "20%", marginLeft: 15 }}>
                  <TouchableOpacity
                    onPress={() => {
                      console.log(route.params);
                      navigation.goBack();
                    }}
                  >
                    <Image
                      source={require("../assets/ic_back.png")}
                      style={{ width: 28, height: 22 }}
                    />
                  </TouchableOpacity>
                </View>
                <View style={{ width: "70%" }}>
                  <Text style={{ color: "#4834A6", fontSize: hp('2%'), fontFamily: 'VisbySemibold'  }}>
                    {strings.EDIT_YOUR_PAST_POSTION}
                  </Text>
                </View>
              </View>
            </View>

      <ScrollView  showsVerticalScrollIndicator={false}>
          <View style={{ flex: 1 }}>
            
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
               
                  <Text style={{ paddingLeft:10,width: 120 }}>{moment.utc(from).format('MM-DD-YYYY')}</Text>
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
                
                  <Text style={{ paddingLeft:10, width: 120 }}>{moment.utc(to).format('MM-DD-YYYY')}</Text>
                
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
                  <Text style={{ color: "#fff", fontSize: hp('2.1%'), fontFamily: 'VisbyBold' }}>
                    {strings.UPDATE_POSTION}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    marginVertical: 10,
                    width: "100%",
                    backgroundColor: "#5F46BF",
                    alignItems: "center",
                    padding: 15,
                    borderRadius: 50,
                  }}
                  onPress={() => handleDelete()}
                >
                  <Text style={{ color: "#fff", fontSize: hp('2.1%'), fontFamily: 'VisbyBold' }}>
                    {strings.DELETE_POSTION}
                  </Text>
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
      </ScrollView>
      </SafeAreaView>

      <KeyboardAccessoryNavigation
        onNext={handleFocusNext}
        onPrevious={handleFocusPrev}
        nextDisabled={nextFocusDisabled}
        previousDisabled={previousFocusDisabled}
        androidAdjustResize={Platform.OS == "android"}
        avoidKeyboard={Platform.OS == "android"}
        style={Platform.OS == "android" && { top: 0 }}
      />
    </View>
  );
}

export default SeekerEditPastPosition;

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
