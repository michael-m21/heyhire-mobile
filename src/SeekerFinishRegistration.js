import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Modal,
  Image,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AwesomeAlert from 'react-native-awesome-alerts';
import Toast from 'react-native-toast-message';
import Tags from "react-native-tags";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useDispatch } from "react-redux";
import * as ImagePicker from "expo-image-picker";
import Constants from "expo-constants";
import { educationLevels, countries, languages } from "./utils/consts.js";
import { getUser, setUser,removeUser } from "./utils/utils.js";
import {
  getRequest,
  putJSON,
  postJSON,
  autocompleteLocation,
  getLatLong
} from "./utils/network.js";
import RNPickerSelect from "react-native-picker-select";
import { useIsFocused } from "@react-navigation/native";
import { KeyboardAccessoryNavigation } from "react-native-keyboard-accessory";
import { strings } from "./translation/config";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import DeviceInfo from "react-native-device-info";
import { Alert } from "react-native";
import notification from './SeekerPushNotifications';

const isIphoneX = DeviceInfo.hasNotch();
function SeekerFinishRegistration({ navigation, route }) {
  const scrollViewRef = useRef();

  const isFocused = useIsFocused();
  const [modalVisible, setModalVisible] = useState(false);
  const [showAwsomeAlert, setShowAwsomeAlert] = useState(false);
  const [awsomeAlertMessage, setAwsomeAlertMessage] = useState('');
  const [modalVisible2, setModalVisible2] = useState(false);
  const [modalVisible3, setModalVisible3] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filteredLangs, setFilteredLangs] = useState(languages);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  const [image, setImage] = useState(null);

  const [country, setCountry] = useState("US");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState([]);
  const [eduLevel, setEduLevel] = useState("");
  const [langs, setlangs] = useState("");
  const [eligible, setEligible] = useState(false);
  const [sixteen, setSixteen] = useState(false);

  const [institution, setInstitution] = useState("");
  const [certificate, setCertificate] = useState([]);
  const [convictions, setConvictions] = useState(false);
  const [availability, setAvailability] = useState("");
  const [positions, setPositions] = useState([]);
  const [covid_vaccinated,setCovid_vaccinated] = useState(false);

  const [activeInputIndex, setActiveInputIndex] = useState(0);
  const [inputs, setInputs] = useState([]);
  const [nextFocusDisabled, setNextFocusDisabled] = useState(false);
  const [previousFocusDisabled, setPreviousFocusDisabled] = useState(false);
  const [skill, setSkill] = useState("");
  const [loading, setLoading] = useState(false);
  const [multiline, setMultiline] = useState(false);
  const [categoriesList, setCategoriesList] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [bioLimitWarning, setBioLimitWarning] = useState(false);
  const dispatch = useDispatch();

  const BIO_PLACEHOLDER = `Example: Greetings, my name is Benjamin, I am 20 years old. I am currently studying my degree at UT, TX.
  I am a hard working overachiever. And I know I will only benefit your business goals and accomplishments. I have past experience working in the kitchen, as my past job was at Mario’s Pizza downtown. I am easy going, and will bring only good and positive vibes in to your business, I would gladly appreciate it you consider my submission and set an interview this following week! Thanks for reading and hope to see you soon!`;

  useEffect(() => {
    (async () => {
      if (Constants.platform.ios) {
        const { status } =
          await ImagePicker.requestCameraRollPermissionsAsync();
        if (status !== "granted") {
          alert("Sorry, we need camera roll permissions to make this work!");
        }
      }
      getJobCategories();
      setLatLong();
    })();
  }, []);

  function getJobCategories() {
    getRequest("/job-seeker/business-category", route.params.token)
      .then((res) => {
        console.log("ressss while  getting jobs categories ", res);
        return res.json();
      })
      .then((json) => {
        const jsonCategories = json.data;
        setCategoriesList(jsonCategories);
      });
  };

  const setLatLong = () => {
    autocompleteLocation(route.params.profile.address + " " +  country)
    .then((response) => {
      if (response?.predictions[0]?.description) {
        getLatLong(response?.predictions[0]?.description)
        .then(async (res) => {
          if (res?.results) {
            setLatitude(res?.results[0]?.geometry?.location?.lat);
            setLongitude(res?.results[0]?.geometry?.location?.lng);
          }
        })
      }
    })
    .catch((error) => {
      console.log('setLatLong -> error', error);
    })
  }

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.1,
    });

    if (!result.cancelled) {
      setImage(result.uri);
      uploadImage(result.base64);
    }
  };

  function uploadImage(image) {
    const body = {
      image: "data:image/png;base64," + image
    };
    setLoading(true);
    postJSON('/job-seeker/photo', body, route.params.token)
    .then((response) => {
      return response.json();
    })
    .then((json1) => {
      console.log('json1', json1);
      setLoading(false);
    })
    .catch((err1) => {
      setLoading(false);
      console.log("Update Profile Image error", JSON.stringify(err1));
    });
  }

  function dateFormat(date) {
    if (date) {
      let d = date.split("-");
      return `${d[1]}/${d[2]}/${d[0]}`;
    } else {
      return "";
    }
  }

  function isLangSelected(lang) {
    let langList = langs
      .split(",")
      .map((i) => i.trim())
      .filter((i) => i != "");
    return langList.includes(lang);
  }

  function removeFromLangs(item) {
    let langList = langs
      .split(",")
      .map((i) => i.trim())
      .filter((i) => i != "");
    langList = langList.filter((i) => i !== item).join(", ");
    setlangs(langList);
  }

  function notifyMessage(msg) {
    Toast.show({
      type: 'error',
      text1: msg,
      position: 'top',
      visibilityTime: 4000
    });
  }

  function addToLangs(item) {
    let langList = langs
      .split(",")
      .map((i) => i.trim())
      .filter((i) => i != "");
    langList.push(item);
    langList = langList.join(", ");
    setlangs(langList);
  }

  function searchLangs(txt) {
    let text = txt.toLowerCase();
    setSearch(text);
    if (text == "") {
      setFilteredLangs(languages);
    } else {
      let langList = languages.filter((j) => j.toLowerCase().includes(text));
      setFilteredLangs(langList);
    }
  }

  function toggleConvictions() {
    setConvictions(!convictions);
  }


  function toggleVaccinated(){
    setCovid_vaccinated(!covid_vaccinated);
  }

  function toggleEligible() {
    setEligible(!eligible);
  }

  function toggleSixteen() {
    setSixteen(!sixteen);
  }

  function _availability(item) {
    setAvailability(item);
  }

  function _edulevel(item) {
    setEduLevel(item);
  }

  function _onPress(item) {
    setModalVisible(false);
    setCountry(item.name);
    setPhCode(item.dial_code);
  }

  function _onPress2(item) {
    setModalVisible(false);
    setPhCode(item.dial_code);
    setCountry(item.name);
  }

  function _onPress3(item) {
    setModalVisible2(false);
  }

  async function handleUpdate() {
    if (validation() === true) {
      try {
        const body = {
          address: route.params.profile.address,
          zip_code: route.params.profile.zip_code,
          state: route.params.profile.state,
          city: route.params.profile.city,
          note: bio,
          country,
          availability: availability,
          education: institution,
          education_level: eduLevel,
          certifications: certificate.toString(),
          language: langs,
          eligible: eligible || false,
          longitude: longitude,
          latitude: latitude,
          sixteen: sixteen || false,
          convictions: convictions || false,
          covid_vaccinated: covid_vaccinated || false,
          skill: skills.toString(),
          preferred_business_categories: categoriesList
            .filter((item) => item.selected)
            .map((item) => item.id)
            .toString(),
        };

        setLoading(true);
        const res = await putJSON(`/job-seeker/profile/${route.params.user.id}`, body, route.params.token);
        const json = await res.json();
        setLoading(false);
        const _user = {
          token: route.params.token,
          profile: json.data,
        }
        getUser().then((u) => {
          let u2 = JSON.parse(u);
          if(u2) {
            removeUser().then((_u) => {
              setUser(_user);
            })
          } else {
            setUser(_user);
          }
        });
        dispatch({type: 'UserData/setState',payload: {profile: json.data, token: route.params.token, profileImage: image, showWelocmeMessage: true }});
        notification(route.params.token);
      } catch (error) {
        setLoading(false);
        Alert.alert("Error", JSON.stringify(error));
        console.log("error while updating profile", JSON.stringify(error));
      }
    } else{
      notifyMessage(strings.PLEASE_FILL_MISSING);
      setError(strings.PLEASE_FILL_MISSING);
    }
  }

  function validation() {

    // if (!image) {
    //   Alert.alert("Error...", "Please select profile picture before continuing!")
    //   return false
    // }

    if (!bio) {
      Alert.alert("Error...", "Please enter Bio")
      return false
    }
    console.log('bioLimitWarning', bioLimitWarning);
    if (bio && bio.length < 120 && !bioLimitWarning) {
      Alert.alert("", "The more you say about yourself, the more people will want to interview. Do you want to add more information?", [
        {
          text: "Skip",
          onPress: async () => {
            await setBioLimitWarning(true);
          },
          style: "cancel",
        },
        {
          text: "Continue",
          onPress: () => {handleFocus(7)},
        },
      ]);
      return false
    }

    else if (categoriesList
      .filter((item) => item.selected).length == 0) {
      Alert.alert("Error...", "Please select Job Categories")
      return false
    }
  
    else if (!langs) {
      Alert.alert("Error...", "Please select language.")
      return false
    }

    else if (!eduLevel) {
      Alert.alert("Error...", "Please select level of education")
      return false
    }

    else if (!institution) {
      Alert.alert("Error...", "Please enter Institution name where you studied")
      return false
    }

    else if (!availability) {
      Alert.alert("Error...", "Please select availability.")
      return false
    }

    else if (!sixteen) {
      Alert.alert("Error...", "You should be atleast 16 years old")
      return false
    }

    else{
        return true;
    }
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
    if (index == 8) {
      setTimeout(() => {
        setMultiline(true);
      }, 1000);
    }
  }

  function addToCategoreis(item) {
    let listCategories = categoriesList;
    listCategories.map((i) => {
      if (i.id === item.id) {
        i.selected = !i.selected;
      }
      return i;
    });
    const _selectedCategories = listCategories.filter(item => item.selected);
    setSelectedCategories(_selectedCategories);
    setCategoriesList([...listCategories]);
  }

  function onPressAddPast() {
    navigation.navigate("SeekerAddPastPosition", {
      positions: positions,
      onGoBack: refreshPosition,
      token: route.params.token
    });
  }

  function refreshPosition(positions) {
    if(positions) {
      setPositions(positions)
    }
  }

  const categoriesModal = () => {
    return(
      <Modal
      animationType="slide"
      transparent={false}
      visible={modalVisible3}
      onRequestClose={() => {
        // Alert.alert('Modal has been closed.');
      }}
    >
      <SafeAreaView>
        <View style={{ marginTop: 22, height: "89%" }}>
          <View>
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
                  onPress={() => setModalVisible3(false)}
                >
                  <Image
                    source={require("../assets/ic_back.png")}
                    style={{ width: 28, height: 22 }}
                  />
                </TouchableOpacity>
              </View>
              <View style={{ width: "60%" }}>
                <Text
                  style={{
                    color: "#4834A6",
                    fontSize: 18,
                    textAlign: "center",
                  }}
                >
                  {strings.JOB_CATEGORIES}
                </Text>
              </View>
              <View style={{ width: "20%" }}>
                <TouchableOpacity
                  onPress={() => setModalVisible3(false)}
                >
                  <Text style={{ color: "#4834A6", fontSize: 18 }}>
                    {strings.DONE}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <FlatList
              data={categoriesList}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item, index, separators }) => (
                <View
                  key={index}
                  onPress={() => _onPress3(item)}
                  onShowUnderlay={separators.highlight}
                  onHideUnderlay={separators.unhighlight}
                >
                  <View style={{ backgroundColor: "white" }}>
                    <TouchableOpacity
                      style={{
                        flex: 1,
                        flexDirection: "row",
                        alignItems: "center",
                        padding: 10,
                        borderBottomWidth: 1,
                        borderBottomColor: "#eee",
                      }}
                      onPress={() => addToCategoreis(item)}
                    >
                      {item.selected ? (
                        <View>
                          <Image
                            source={require("../assets/ic_selected.png")}
                            style={{
                              width: 17,
                              height: 17,
                              marginRight: 10,
                              marginLeft: 20,
                            }}
                          />
                        </View>
                      ) : (
                        <View>
                          <Image
                            source={require("../assets/ic_add_blue.png")}
                            style={{
                              width: 17,
                              height: 17,
                              marginRight: 10,
                              marginLeft: 20,
                            }}
                          />
                        </View>
                      )}

                      <Text
                        style={{
                          fontSize: 20,
                          color: "#222",
                        }}
                      >
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <KeyboardAwareScrollView
        extraScrollHeight={Platform.OS === "ios" ? -60 : 0}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: "#4834A6",
              fontSize: hp("2.1%"),
              fontFamily: 'VisbyBold',
            }}
          >
            {strings.REGISTRATION}
          </Text>
        </View>
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

        <View style={{ flex: 1, alignItems: "center", padding: 20 }}>
          <View style={{ width: wp('35%'), height: wp('25%'), alignSelf: "center", justifyContent: 'center', alignItems: 'center'}}>
            {image == null ? (
              <View style={styles.profileImageContainer}>
              <Image
                source={require("../assets/ic_user_dark.png")}
                style={{
                  height: wp('20%'),
                  width: wp('20%'),
                }}
              />
              </View>
            ) : (
              <Image
                source={{ uri: image }}
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  alignSelf: "center",
                }}
              />
            )}
            <TouchableOpacity
              onPress={pickImage}
              style={{ position: "absolute", top: 0, right: 0 }}
            >
              <Image
                source={require("../assets/ic_camera.png")}
                style={{ width: 60, height: 60 }}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ flex: 1 }}>
          <View style={{ flex: 1, padding: 10, paddingHorizontal: 20 }}>
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                //paddingHorizontal: 10,
                marginBottom: 5,
              }}
            >
              <Image
                source={require("../assets/ic_star.png")}
                style={{ width: 15, height: 15 }}
              />
              <Text style={styles.subHeadingText}>
                {strings.BIO}
              </Text>
            </View>
            <View
              style={{
                backgroundColor: "#fff",
                borderColor: "#eee",
                padding: 5,
                marginBottom: 15,
                paddingLeft: 35,

                // marginRight: 10,
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
              }}
            >
              <TextInput
                style={{ width: "100%", color: "#666" }}
                textAlignVertical='top'
                onChangeText={(text) => setBio(text)}
                placeholder={BIO_PLACEHOLDER}
                value={bio}
                multiline={true}
                editable={true}
                onFocus={() => {
                  handleFocus(7);
                }}
                ref={(ref) => {
                  handleRef(7, ref);
                }}
              />
            </View>
          </View>
        </View>

        <TouchableOpacity style={[styles.categoriesContainer, styles.shadowContainer]} onPress={() => setModalVisible3(true)}>
          {categoriesModal()}
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 5,
            }}
          >
            <Image
              source={require("../assets/ic_star.png")}
              style={{ width: 15, height: 15 }}
            />
            <Text style={styles.subHeadingText}>
              {strings.JOB_CATEGORIES}
            </Text>
            <TouchableOpacity
            onPress={() => {
              setAwsomeAlertMessage(strings.CATEGORIES_INFO_MESSAGE);
              setShowAwsomeAlert(true);
              }}
              style={{ width: 15, height: 15, position: 'absolute', right: 10 }}
            >
              <Image
                source={require("../assets/circle_info.png")}
                style={{ width: 15, height: 15 }}
              />
            </TouchableOpacity>
          </View>
          <Text
              style={{
                fontSize: 13,
                paddingLeft: 20,
                marginVertical: 5,
                fontFamily: 'VisbySemibold'
              }}
          >
            Tap to select categories
          </Text>
          <FlatList
            data={selectedCategories}
            columnWrapperStyle={{ flexWrap: 'wrap', flex: 1, marginTop: 5 }}
            renderItem={({item}) => (
              <View
                style={styles.categoriesListContainer}>
                  <Text style={{color: '#F3F4FA', fontSize: 12}}>{item.name}</Text>
                  <TouchableOpacity
                    style={{marginLeft: 10}}
                    onPress={() => addToCategoreis(item)}
                  >
                    <Text style={{color: '#F3F4FA'}}>x</Text>
                  </TouchableOpacity>
              </View>
            )}
            //Setting the number of column
            numColumns={4}
            keyExtractor={(item, index) => index}
          />
        </TouchableOpacity>


        <View style={{ flex: 1 }}>
          <View style={{ flex: 1, padding: 20 }}>
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 5,
              }}
            >
              <Image
                source={require("../assets/ic_star.png")}
                style={{ width: 15, height: 15 }}
              />
              <Text style={styles.subHeadingText}>
                {strings.SKILLS}
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                marginBottom: 5,
              }}
            >
              <Text style={{ paddingLeft: 10, fontSize: 13, fontFamily: 'VisbySemibold' }}>
                Enter Skill and Press SPACE to add to list.
              </Text>
            </View>
            <Tags
              initialText=""
              textInputProps={{
                placeholder: strings.ENTER_SKILL,
                placeholderTextColor: 'black'
              }}
              inputContainerStyle={[{borderRadius: 5, borderWidth: 0.3, borderColor: 'grey', backgroundColor: 'white'}, styles.shadowContainer]}
              inputStyle={{color: 'grey'}}
              initialTags={skills}
              onChangeTags={tags => setSkills(tags)}
              onTagPress={(index, tagLabel, event, deleted) =>
                console.log(index, tagLabel, event, deleted ? "deleted" : "not deleted")
              }
              containerStyle={{ justifyContent: "center" }}
              renderTag={({ tag, index, onPress, deleteTagOnPress, readonly }) => (
                <TouchableOpacity style={styles.skilsListContainer} key={`${tag}-${index}`} onPress={onPress}>
                  <Text style={{color: '#F3F4FA', fontSize: 12}}>{tag}</Text>
                  <View
                    style={{marginLeft: 10}}
                  >
                    <Text style={{color: '#F3F4FA'}}>x</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
        
        <View style={{ flex: 1 }}>
          <View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginLeft: 20,
              }}
            >
              <Image
                source={require("../assets/ic_star.png")}
                style={{ width: 15, height: 15 }}
              />
              <Text style={styles.subHeadingText}>
                {strings.LEVEL_OF_EDUCATION}
              </Text>
            </View>
            <View style={styles.code3}>
              <Image
                source={require("../assets/ic_educate.png")}
                style={{ width: 20, height: 20, marginRight: 5 }}
              />
              <RNPickerSelect
                onValueChange={(value) => _edulevel(value)}
                value={eduLevel}
                style={pickerSelectStyles}
                items={educationLevels.map((i) => {
                  return {
                    label: i,
                    value: i,
                  };
                })}
              />
            </View>
          </View>
        </View>

        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginLeft: 20,
            }}
          >
            <Image
              source={require("../assets/ic_star.png")}
              style={{ width: 15, height: 15 }}
            />
            <Text style={styles.subHeadingText}>
              {strings.NAME_OF_INSTITUTION}
            </Text>
          </View>
          <View style={styles.inputField}>
            <Image
              source={require("../assets/ic_educate.png")}
              style={{ width: 20, height: 20, marginRight: 5 }}
            />
            <TextInput
              style={{ width: "90%", color: "#000" }}
              onChangeText={(text) => setInstitution(text)}
              placeholder={strings.INSTITUTION}
              value={institution}
              textContentType="none"
              onFocus={() => {
                handleFocus(8);
              }}
              ref={(ref) => {
                handleRef(8, ref);
              }}
            />
          </View>
        </View>

        <View style={{ flex: 1 }}>
          <View style={{ flex: 1, padding: 20 }}>
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 5,
              }}
            >
              <Image
                source={require("../assets/ic_star.png")}
                style={{ width: 15, height: 15 }}
              />
              <Text style={styles.subHeadingText}>
                {strings.CERTIFICATIONS}
              </Text>
              <TouchableOpacity onPress={() => {
                setAwsomeAlertMessage(strings.CERTIFICATE_INFO_MESSAGE);
                setShowAwsomeAlert(true);
                }}
                style={{ width: 15, height: 15, position: 'absolute', right: 20 }}
              >
              <Image
                source={require("../assets/circle_info.png")}
                style={{ width: 15, height: 15 }}
              />
            </TouchableOpacity>
            </View>
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                marginBottom: 5,
              }}
            >
              <Text style={{ paddingLeft: 10, fontSize: 13, fontFamily: 'VisbySemibold' }}>
                Enter Certificate and Press SPACE to add to list.
              </Text>
            </View>
            <Tags
              initialText=""
              textInputProps={{
                placeholder: strings.CERTIFICATE_PLACEHOLDER,
                placeholderTextColor: 'black'
              }}
              inputContainerStyle={[{borderRadius: 5, borderWidth: 0.3, borderColor: 'grey', backgroundColor: 'white'}, styles.shadowContainer]}
              inputStyle={{color: 'grey'}}
              initialTags={certificate}
              onChangeTags={tags => setCertificate(tags)}
              onTagPress={(index, tagLabel, event, deleted) =>
                console.log(index, tagLabel, event, deleted ? "deleted" : "not deleted")
              }
              containerStyle={{ justifyContent: "center" }}
              renderTag={({ tag, index, onPress, deleteTagOnPress, readonly }) => (
                <TouchableOpacity style={styles.skilsListContainer} key={`${tag}-${index}`} onPress={onPress}>
                  <Text style={{color: '#F3F4FA', fontSize: 12}}>{tag}</Text>
                  <View
                    style={{marginLeft: 10}}
                  >
                    <Text style={{color: '#F3F4FA'}}>x</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>

        <View style={{ flex: 1 }}>
          <Modal
            animationType="slide"
            transparent={false}
            visible={modalVisible2}
            onRequestClose={() => {
              // Alert.alert('Modal has been closed.');
            }}
          >
            <SafeAreaView>
              <View style={{ marginTop: 22, height: "89%" }}>
                <View>
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
                        onPress={() => setModalVisible2(false)}
                      >
                        <Image
                          source={require("../assets/ic_back.png")}
                          style={{ width: 28, height: 22 }}
                        />
                      </TouchableOpacity>
                    </View>
                    <View style={{ width: "60%" }}>
                      <Text style={{ color: "#4834A6", fontSize: 18 }}>
                        {strings.ADD_YOUR_LANGUAGES}
                      </Text>
                    </View>
                    <View style={{ width: "60%" }}>
                      <TouchableOpacity
                        onPress={() => setModalVisible2(false)}
                      >
                        <Text style={{ color: "#4834A6", fontSize: 18 }}>
                          {strings.DONE}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View
                    style={{
                      width: "85%",
                      margin: 20,
                      backgroundColor: "#fff",
                      padding: 10,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: "#ddd",
                    }}
                  >
                    <View style={{ width: "15%" }}>
                      <Image
                        source={require("../assets/ic_search.png")}
                        style={{ position: "absolute" }}
                      />
                    </View>
                    <View style={{ width: "70%", paddingLeft: 20 }}>
                      <TextInput
                        style={{
                          width: "100%",
                          paddingLeft: 10,
                          color: "#000",
                        }}
                        onChangeText={(text) => searchLangs(text)}
                        placeholder={strings.SEARCH}
                        value={search}
                        onFocus={() => {
                          handleFocus(10);
                        }}
                        ref={(ref) => {
                          handleRef(10, ref);
                        }}
                      />
                    </View>
                  </View>

                  <FlatList
                    // ItemSeparatorComponent={<Separator />}
                    data={filteredLangs}
                    keyExtractor={(item) => item}
                    renderItem={({ item, index, separators }) => (
                      <View
                        key={index}
                        onPress={() => _onPress3(item)}
                        onShowUnderlay={separators.highlight}
                        onHideUnderlay={separators.unhighlight}
                      >
                        <View style={{ backgroundColor: "white" }}>
                          <TouchableOpacity
                            style={{
                              flex: 1,
                              flexDirection: "row",
                              alignItems: "center",
                              padding: 10,
                              borderBottomWidth: 1,
                              borderBottomColor: "#eee",
                            }}
                            onPress={() => {
                              if (isLangSelected(item)) {
                                removeFromLangs(item);
                              } else {
                                addToLangs(item);
                              }
                            }}
                          >
                            <Image
                              source={isLangSelected(item) ? require("../assets/ic_selected.png") : require("../assets/ic_add_blue.png")}
                              style={{
                                width: 17,
                                height: 17,
                                marginRight: 10,
                                marginLeft: 20,
                              }}
                            />
                            <Text
                              style={{
                                fontSize: 20,
                                color: "#222",
                              }}
                            >
                              {item}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  />
                </View>
              </View>
            </SafeAreaView>
          </Modal>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginLeft: 20,
            }}
          >
            <Image
              source={require("../assets/ic_star.png")}
              style={{ width: 15, height: 15 }}
            />
            <Text style={styles.subHeadingText}>
              {strings.SPOKEN_LANGUAGE}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.code}
            onPress={() => setModalVisible2(true)}
          >
            <View style={{ flexDirection: "row" }}>
              <Image
                source={require("../assets/ic_language.png")}
                style={{ width: 17, height: 17, marginRight: 5 }}
              />
              <Text style={{ width: "95%", color: "#000" }}>
                {langs ? langs : strings.SELECT_YOUR_LANGUAGE}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={{ flex: 1 }}>
          <View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginLeft: 20,
              }}
            >
              <Image
                source={require("../assets/ic_star.png")}
                style={{ width: 15, height: 15 }}
              />
              <Text style={styles.subHeadingText}>
                {strings.AVAILABILITY}
              </Text>
            </View>
            <View style={styles.code3}>
              <Image
                source={require("../assets/ic_educate.png")}
                style={{ width: 20, height: 20, marginRight: 5 }}
              />
              <RNPickerSelect
                onValueChange={(value) => _availability(value)}
                value={availability}
                style={pickerSelectStyles}
                items={[
                  { label: "Full Time", value: "Full Time" },
                  { label: "Part Time", value: "Part Time" },
                  { label: "Flexible", value: "Flexible" },
                ]}
              />
            </View>
          </View>
        </View>

        <View style={[styles.checkBoxesContainer, styles.shadowContainer]}>
            <View style={{ flex: 1 }}>
              <TouchableOpacity
                style={styles.checkBoxContainer}
                onPress={() => toggleEligible()}
              >
                {eligible ? (
                  <Image
                    source={require("../assets/checkbox_checked.png")}
                    style={{ width: 25, height: 25, marginRight: 5 }}
                  />
                ) : (
                  <Image
                    source={require("../assets/checkbox_blank.png")}
                    style={{ width: 25, height: 25, marginRight: 5 }}
                  />
                )}
                <Text style={styles.checkBoxText}>
                  {strings.ARE_YOU_ELEGIBLE}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ flex: 1 }}>
              <TouchableOpacity
                style={styles.checkBoxContainer}
                onPress={() => toggleSixteen()}
              >
                {sixteen ? (
                  <Image
                    source={require("../assets/checkbox_checked.png")}
                    style={{ width: 25, height: 25, marginRight: 5 }}
                  />
                ) : (
                  <Image
                    source={require("../assets/checkbox_blank.png")}
                    style={{ width: 25, height: 25, marginRight: 5 }}
                  />
                )}
                <Text style={styles.checkBoxText}>
                  {strings.ARE_YOU_AT_LEAST}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ flex: 1 }}>
              <TouchableOpacity
                style={styles.checkBoxContainer}
                onPress={() => toggleConvictions()}
              >
                {convictions ? (
                  <Image
                    source={require("../assets/checkbox_checked.png")}
                    style={{ width: 25, height: 25, marginRight: 5 }}
                  />
                ) : (
                  <Image
                    source={require("../assets/checkbox_blank.png")}
                    style={{ width: 25, height: 25, marginRight: 5 }}
                  />
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.checkBoxText}>
                    {strings.HAVE_YOU_EVER_BEEN_CONVICTED}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            <View style={{ flex: 1 }}>
              <TouchableOpacity
                style={styles.checkBoxContainer}
                onPress={() => toggleVaccinated()}
              >
                {covid_vaccinated ? (
                  <Image
                    source={require("../assets/checkbox_checked.png")}
                    style={{ width: 25, height: 25, marginRight: 5 }}
                  />
                ) : (
                  <Image
                    source={require("../assets/checkbox_blank.png")}
                    style={{ width: 25, height: 25, marginRight: 5 }}
                  />
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.checkBoxText}>
                    {strings.ARE_VACCINATED} {strings.OPTIONAL}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

        <View style={{ flex: 1, marginBottom: 30 }}>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              paddingLeft: 20,
              marginTop: 20,
              paddingBottom: 20,
              alignItems: "center",
            }}
          >
            <Image
              source={require("../assets/ic_business.png")}
              style={{ width: 20, height: 20, marginRight: 5 }}
            />
            <Text style={{ fontSize: 18, fontFamily: 'VisbySemibold' }}>
              {strings.PAST_POSTIONS} {strings.OPTIONAL}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
          {positions.map((p, index) => {
                return (
                  <View
                    key={p.post_id}
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      paddingLeft: 20,
                      paddingBottom: 20,
                    }}
                  >
                    <TouchableOpacity
                      style={{ width: "10%", paddingRight: 20, marginTop: 5 }}
                      onPress={() =>
                        navigation.navigate("SeekerEditPastPosition", {
                          position: p,
                          onGoBack: refreshPosition,
                          positions: positions,
                          token: route.params.token
                        })
                      }
                    >
                      <Image
                        source={require("../assets/ic_edit.png")}
                        style={{ width: 16, height: 16, marginRight: 5, resizeMode: 'contain' }}
                      />
                    </TouchableOpacity>
                    <View style={{ width: "90%" }}>
                      <Text style={{ color: "#B1B4C7", fontSize: 14 }}>
                        {dateFormat(p.start_date)} - {dateFormat(p.end_date)}
                      </Text>
                      <Text style={{ fontSize: 14, width: "70%", fontWeight: '600' }}>
                        {p.position}, {p.employer}  <Text style={{fontWeight: '200'}}>{p.location}{" "}</Text>
                      </Text>
                      <Text>
                        
                      </Text>
                    </View>
                  </View>
                );
              })}

              <TouchableOpacity
                style={{
                  alignSelf: "center",
                  marginTop: 20,
                  marginBottom: hp('10%'),
                }}
                onPress={() => onPressAddPast()}
              >
                <Text style={{ color: "#4E35AE", fontSize: 16, fontFamily: 'VisbyBold' }}>
                  + {strings.ADD_PAST_POSTION}
                </Text>
              </TouchableOpacity>
          </View>
        </View>
        <View style={{ height: 20 }}></View>
      </KeyboardAwareScrollView>
      <KeyboardAccessoryNavigation
        onNext={handleFocusNext}
        onPrevious={handleFocusPrev}
        onPress={handleFocusNext}
        nextDisabled={nextFocusDisabled}
        previousDisabled={previousFocusDisabled}
        androidAdjustResize={Platform.OS == "android"}
        avoidKeyboard={true}
        style={
          Platform.OS == "android"
            ? { top: 0, position: "absolute", zIndex: 9999 }
            : { top: isIphoneX ? 0 : 0 }
        }
      />
      {/* </KeyboardAvoidingView> */}
      <View
        style={{
          position: "absolute",
          bottom: isIphoneX ? 20 : 0,
          width: "100%",
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            width: '90%',
            borderRadius: wp('10%'),
            alignContent: "center",
            backgroundColor: "#5B42BB",
            padding: 15,
          }}
          onPress={() => handleUpdate()}
        >
          <Text style={{ color: "#fff", textAlign: "center", fontSize: 18 }}>
            {strings.FINISH_REGISTRATION}
          </Text>
        </TouchableOpacity>
      </View>
      <AwesomeAlert
        show={showAwsomeAlert}
        showProgress={false}
        title="Information"
        message={awsomeAlertMessage}
        closeOnTouchOutside={true}
        closeOnHardwareBackPress={false}
        showCancelButton={false}
        showConfirmButton={true}
        cancelText="No, cancel"
        confirmText="Ok"
        confirmButtonColor="#594A9E"
        messageStyle={{textAlign: 'center'}}
        confirmButtonStyle={{width: wp('20%'), justifyContent:'center', alignItems: 'center'}}
        onCancelPressed={() => {
          setShowAwsomeAlert(false)
        }}
        onConfirmPressed={() => {
          setShowAwsomeAlert(false)
        }}
      />
      {error ? (
        <Toast
          position='top'
          type='error'
          text1={error}
          visibilityTime={5000}
        />
      ) : null}
    </SafeAreaView>
  );
}

export default SeekerFinishRegistration;

const styles = StyleSheet.create({
  inputField: {
    backgroundColor: "#fff",
    borderColor: "#eee",
    padding: 13,
    marginBottom: 15,
    marginLeft: 20,
    marginRight: 20,
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
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  code: {
    backgroundColor: "#fff",
    borderColor: "#eee",
    padding: 13,
    marginBottom: 15,
    marginLeft: 20,
    marginRight: 20,
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
    flex: 1,
    flexDirection: "row",
    // alignItems: 'center',
    // width: '25%',
  },
  code2: {
    backgroundColor: "#fff",
    color: "#000",
    borderColor: "#eee",
    padding: 13,
    marginBottom: 15,
    marginRight: 10,
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
    flex: 4,
    // flexDirection: 'row',
    // alignItems: 'center',
    // width: '50%',
    marginLeft: 5,
  },
  code3: {
    backgroundColor: "#fff",
    borderColor: "#eee",
    paddingTop: 13,
    paddingLeft: 13,
    marginBottom: 15,
    marginLeft: 20,
    marginRight: 20,
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
    flex: 1,
    flexDirection: "row",
    // alignItems: 'center',
    // width: '25%',
  },
  shadowContainer: {
    shadowColor: "#000000",
    shadowOffset: {
      width: 3,
      height: 3,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  categoriesContainer: {
    flex: 1,
    marginHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    borderWidth: 0.2,
    borderColor: '#bbb',
    justifyContent: 'center',
    backgroundColor: 'white'
  },
  categoriesListContainer: {
    flex: 0,
    flexDirection: 'row',
    margin: 5,
    paddingLeft: 20,
    paddingRight: 10,
    backgroundColor: '#4E35AE',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    height: 25
  },
  skilsListContainer: {
    flex: 0,
    flexDirection: 'row',
    margin: 5,
    paddingLeft: 20,
    paddingRight: 10,
    backgroundColor: '#4E35AE',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    height: 25
  },
  checkBoxesContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 5,
    marginHorizontal: 10,
    borderWidth: 0.2,
    borderColor: 'grey',
    paddingHorizontal: 10,
    overflow: 'visible'
  },
  checkBoxContainer: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 15,
    alignItems: "center",
  },
  profileImageContainer: {
    width: wp('25%'),
    height: wp('25%'),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: wp('20%'),
    borderColor: '#4834A6',
    borderWidth: 1,
    backgroundColor: 'white'
  },
  subHeadingText: {
    paddingLeft: 10,
    fontSize: 18,
    fontFamily: 'VisbySemibold',
    marginBottom: 5,
  },
  checkBoxText: {
    paddingLeft: 5,
    color: "#3482FF",
    fontFamily: 'VisbySemibold',
    fontSize: 13
  }
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    // borderColor: '#333',
    // borderWidth: 1,
    minWidth: "95%",
    paddingBottom: 13,
  },
  inputAndroid: {
    minWidth: "95%",
    paddingBottom: 13,
    color: '#000000'
  },
});
