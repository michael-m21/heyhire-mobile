import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Modal,
  Image,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableHighlight,
  Platform,
  Alert,
  PermissionsAndroid,
  ImageBackground,
  StatusBar,
  SafeAreaView
} from "react-native";
import InstagramLogin from 'react-native-instagram-login';
import Toast from 'react-native-toast-message';
import AwesomeAlert from 'react-native-awesome-alerts';
import Tags from "react-native-tags";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import * as ImagePicker from "expo-image-picker";
import Constants from "expo-constants";
import { educationLevels, countries, languages } from "./utils/consts.js";
import { getUser, setUser } from "./utils/utils.js";
import {
  postJSON,
  setInstagram,
  getRequest,
  putJSON,
  deleteJSON,
  autocompleteLocation,
  getLatLong
} from "./utils/network.js";
import RNPickerSelect from "react-native-picker-select";
import { useIsFocused } from "@react-navigation/native";
import { KeyboardAccessoryNavigation } from "react-native-keyboard-accessory";
import { strings } from "./translation/config";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import DeviceInfo from "react-native-device-info";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import InstagramLoginPopup from "./components/InstagramLogin.js";
import Loader from "./components/Loader";
import { useSelector, useDispatch } from "react-redux";

const isIphoneX = DeviceInfo.hasNotch();

function SeekerEditProfile({ navigation, route }) {

  const isFocused = useIsFocused();
  const dispatch = useDispatch();

  const userData = useSelector((state) => state.UserData);
  const tempProfile = route.params.profile;

  const [modalVisible, setModalVisible] = useState(false);
  const [showAwsomeAlert, setShowAwsomeAlert] = useState(false);
  const [awsomeAlertMessage, setAwsomeAlertMessage] = useState('');
  const [modalVisible2, setModalVisible2] = useState(false);
  const [modalVisible3, setModalVisible3] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filteredLangs, setFilteredLangs] = useState(languages);

  const [user, setUser1] = useState({});
  const [image, setImage] = useState(userData.profileImage);

  const [firstName, setFirstName] = useState(tempProfile.first_name);
  const [lastName, setLastName] = useState(tempProfile.last_name);
  const [address, setAddress] = useState(tempProfile.address);
  const [country, setCountry] = useState(tempProfile.country);
  const [state, setState] = useState(tempProfile.state);
  const [city, setCity] = useState(tempProfile.city);
  const [zipcode, setZipcode] = useState(tempProfile.zip_code);
  const [phCode, setPhCode] = useState("");
  const [phone, setPhone] = useState(tempProfile.phone);
  const [email, setEmail] = useState(tempProfile.email);
  const [bio, setBio] = useState(tempProfile.note);
  const [skills, setSkills] = useState(tempProfile.skill ? tempProfile.skill.split(',') : []);
  const [eduLevel, setEduLevel] = useState(tempProfile.education_level);
  const [langs, setlangs] = useState(tempProfile.language || "");
  const [eligible, setEligible] = useState(tempProfile.eligible);
  const [sixteen, setSixteen] = useState(tempProfile.sixteen);
  const [latitude, setLatitude] = useState(tempProfile?.latitude);
  const [longitude, setLongitude] = useState(tempProfile?.longitude);

  const [institution, setInstitution] = useState(tempProfile.education);
  const [certificate, setCertificate] = useState(tempProfile.certifications ? tempProfile.certifications.split(',') : []);
  const [convictions, setConvictions] = useState(tempProfile.convictions);
  const [availability, setAvailability] = useState(tempProfile.availability);
  const [positions, setPositions] = useState(tempProfile.past_positions || []);
  const [covid_vaccinated, setCovid_vaccinated] = useState(
    tempProfile.covid_vaccinated
  );
  const [activeInputIndex, setActiveInputIndex] = useState(0);
  const [inputs, setInputs] = useState([]);
  const [nextFocusDisabled, setNextFocusDisabled] = useState(false);
  const [previousFocusDisabled, setPreviousFocusDisabled] = useState(false);

  const [loading, setLoading] = useState(false);

  const [categoriesList, setCategoriesList] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  const BIO_PLACEHOLDER = `Example: Greetings, my name is Benjamin, I am 20 years old. I am currently studying my degree at UT, TX.
  I am a hard working overachiever. And I know I will only benefit your business goals and accomplishments. I have past experience working in the kitchen, as my past job was at Mario’s Pizza downtown. I am easy going, and will bring only good and positive vibes in to your business, I would gladly appreciate it you consider my submission and set an interview this following week! Thanks for reading and hope to see you soon!`;

  useEffect(() => {
    (async () => {
      if (Constants.platform.ios) {
        try {
          const status1 = await ImagePicker.requestCameraRollPermissionsAsync();
          if (status1.status !== "granted") {
            Alert.alert(
              "Sorry, we need camera roll permissions to make this work!"
            );
          }
        } catch (error) {
          console.log("Error", setError);
        }
      } else {
        PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        ])
          .then((granted) => {
            if (
              granted["android.permission.READ_EXTERNAL_STORAGE"] != "granted"
            ) {
              Alert.alert("Permission issue", "", [{ text: "Ok" }], {
                cancelable: false,
              });
            }
          })
          .catch((error) => {
            Alert.alert("Permission issue", error.message, [{ text: "Ok" }], {
              cancelable: false,
            });
          });
      }
    })();
    if (!latitude || !longitude) {
      setLatLong();
    }
  }, []);

  function setLatLong() {
    autocompleteLocation(address + " " + country)
    .then((response) => {
      if (response?.predictions[0]?.description) {
        getLatLong(response?.predictions[0]?.description)
        .then(async (res) => {
          if (res?.results) {
            const body = {
              longitude: res?.results[0]?.geometry?.location?.lng,
              latitude: res?.results[0]?.geometry?.location?.lat,
            };
            const coord = await putJSON(`/job-seeker/profile/${userData.profile.id}`, body, userData.token);
            const json = await coord.json();
            dispatch({ type: "UserData/setState", payload: { profile: json.data } });
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

  function getJobCategories() {
    getRequest("/job-seeker/business-category", userData.token)
      .then((res) => {
        console.log("ressss while  getting jobs categories ", res);
        return res.json();
      })
      .then((json) => {
        const jsonCategories = json.data;
        let tempBusinessCategories = tempProfile.preferred_business_categories
          ? tempProfile.preferred_business_categories.split(",")
          : null;
        if (tempBusinessCategories) {
          tempBusinessCategories.map((item) => {
            jsonCategories.map((businessCategory) => {
              if (businessCategory.id == item) {
                businessCategory.selected = true;
              }
            });
          });
        }
        const _selectedCategories = jsonCategories.filter(item => item.selected);
        setSelectedCategories(_selectedCategories);    
        setCategoriesList(jsonCategories);
      });
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

  function notifyMessage(msg) {
    Toast.show({
      type: 'success',
      text1: msg,
      position: 'top',
      visibilityTime: 4000
    });
  }

  function uploadImage(image) {
    const body = {
      image: "data:image/png;base64," + image
    };
    setLoading(true);
    postJSON('/job-seeker/photo', body, userData.token)
    .then((response) => {
      return response.json();
    })
    .then((json1) => {
      dispatch({type: 'UserData/setState',payload: {profileImage: json1.data.thumb_url}});
      notifyMessage("Profile Image Updated Successfully");
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
      return `${d[1]}/${d[0]}`;
    } else {
      return "";
    }
  }

  function formatPhone(str) {
    let cleaned = str.replace(/\D/g, "");
    let match = cleaned.match(/^(\d{3})(\d{3})(\d+)$/);
    if (match) {
      return "(" + match[1] + ") " + match[2] + "-" + match[3];
    }
    return str;
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

  function toggleVaccinated() {
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

  useEffect(() => {
    // console.log(isFocused)
    if (isFocused) {
      loadDate();
      // loadInstaFeed();
    }
  }, [isFocused]);

  function loadDate() {
    getUser().then((u) => {
      let u2 = JSON.parse(u);
      setUser1(u2);
      getJobCategories();
    });
  }

  async function loadInstaFeed() {
    const id = tempProfile.user_id * 33469;
    let form = new FormData();

    setInstagram("/instagram/feed/" + id)
      .then((res) => {
        console.log(res);
        return res.json();
      })
      .then((json) => {
        console.log("Feed", json);
      })
      .catch((error) => {
        console.log("Feed erro", error);
      });
  }

  async function updateProfile() {
    try {
      const body = {
        first_name: firstName,
        last_name: lastName,
        address: address,
        zip_code: zipcode,
        state: state,
        city: city,
        email,
        note: bio,
        country,
        availability: availability,
        education: institution,
        education_level: eduLevel,
        certifications: certificate.toString(),
        language: langs,
        eligible: eligible || false,
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
      const res = await putJSON(`/job-seeker/profile/${userData.profile.id}`, body, userData.token);
      const json = await res.json();
      if (tempProfile?.address !== address || tempProfile?.country !== country) {
        setLatLong();
      }
      setLoading(false);
      dispatch({ type: "UserData/setState", payload: { profile: json.data, profileUpdated: true } });
      navigation.goBack();
    } catch (error) {
      setLoading(false);
      Alert.alert("Error", error);
      console.log("error while updating profile", error);
    }
  }


  async function navigateBack() {
    const tempUser = userData.profile;
    if (
        tempUser?.first_name !== firstName ||
        tempUser?.last_name !== lastName ||
        tempUser?.address !== address ||
        tempUser?.zip_code !== zipcode ||
        tempUser?.state !== state ||
        tempUser?.city !== city ||
        tempUser?.phone !== phone ||
        tempUser?.email !== email ||
        tempUser?.note !== bio ||
        tempUser?.country !== country ||
        tempUser?.availability !== availability ||
        tempUser?.education !== institution ||
        tempUser?.education_level !== eduLevel ||
        certificate?.toString() !== "" && tempUser?.certifications !== certificate?.toString() ||
        tempUser?.language !== langs ||
        tempUser?.eligible !== eligible ||
        tempUser?.sixteen !== sixteen ||
        tempUser?.convictions !== convictions ||
        tempUser?.covid_vaccinated !== covid_vaccinated ||
        skills?.toString() !== "" && tempUser?.skill !== skills?.toString() ||
        tempUser?.preferred_business_categories !== categoriesList?.filter((item) => item?.selected)?.map((item) => item?.id).toString()
      ) {
        Alert.alert("", "You have some unsaved changes. Do you want to update changes", [
          {
            text: "Don't Save",
            onPress: async () => {
              restoreState();
              navigation.goBack();
            },
            style: "cancel",
          },
          {
            text: "Update",
            onPress: () => {
              updateProfile();
            },
          },
        ]);
      } else {
        navigation.goBack();
      }
  }

  function restoreState() {
    setFirstName(tempProfile.first_name);
    setLastName(tempProfile.last_name);
    setAddress(tempProfile.address);
    setCountry(tempProfile.country);
    setState(tempProfile.state);
    setCity(tempProfile.city);
    setZipcode(tempProfile.zip_code);
    setPhone(tempProfile.phone);
    setEmail(tempProfile.email);
    setBio(tempProfile.note);
    setSkills(tempProfile.skill ? tempProfile.skill.split(',') : []);
    setEduLevel(tempProfile.education_level);
    setlangs(tempProfile.language || "");
    setEligible(tempProfile.eligible);
    setSixteen(tempProfile.sixteen);
    setInstitution(tempProfile.education);
    setCertificate(tempProfile.certifications);
    setConvictions(tempProfile.convictions);
    setAvailability(tempProfile.availability);  
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

  function refreshPosition(positions) {
    if(positions) {
      setPositions(positions)
    }
  }

  function handleInstaConnect() {
    if (userData?.profile?.instagram_token) {
      Alert.alert("", "Are you sure you want to disconnect from instagram?", [
        {
          text: "Cancel",
          onPress: () => {},
          style: "cancel",
        },
        {
          text: "OK",
          onPress: () => {
            disconnectInstagram();
          },
        },
      ]);
    } else {
      this.instagramLogin.show();
    }
  }

  function disconnectInstagram() {
    deleteJSON(`/job-seeker/instagram-token/${userData.profile.id}`, userData.token)
    .then((res) => {
      return res.json();
    })
    .then(async (json) => {
      dispatch({ type: "UserData/setState", payload: { profile: json.data } });
    })
    .catch((err) => {
      console.log(err);
    });
  }

  function onPressAddPast() {
    navigation.navigate("SeekerAddPastPosition", {
      positions: positions,
      onGoBack: refreshPosition,
    });
  }

  function setIgToken (data) {
    const body = {
      instagram_token: data.access_token
    };
    postJSON(`/job-seeker/instagram-token/`, body, userData.token)
    .then((res) => {
      return res.json();
    })
    .then(async (json) => {
      const response = await getRequest(`/job-seeker/profile/${userData.profile.id}`,userData.token);
      const _profile = await response.json();
      dispatch({type: 'UserData/setState',payload: { profile: _profile.data }});
    })
    .catch((err) => {
      console.log(err);
    });
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
      <StatusBar barStyle="dark-content" />

      <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            borderBottomWidth: 0.15,
            borderBottomColor: "#fff",
            paddingBottom: 10,
            paddingTop: 20,
          }}
        >
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Image
              source={require("../assets/headerImage.png")}
              style={{ width: wp('25%'), height: hp('4%'), resizeMode: 'contain' }}
            />
          </View>
          <View style={{ position: "absolute", left: 5, bottom: 6 }}>
            <TouchableOpacity
              onPress={async () => {
                navigateBack();
                //await navigation.dispatch(StackActions.replace('SeekerHome'));
                //navigation.goBack();
                //navigation.replace("Seeker", {
                //  screen: "SeekerHome",
                //});
    
              }}
              style={{ padding: 5 }}>
              <Image
                source={require("../assets/ic_back.png")}
                style={{ width: 20, height: 20, resizeMode: 'contain', alignSelf: 'center' }}
              />
            </TouchableOpacity>
          </View>
        </View>

      <KeyboardAwareScrollView
        extraScrollHeight={Platform.OS === "ios" ? -60 : 0}
      >

        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: "#4834A6",
              fontSize: hp("2.1%"),
              fontFamily: 'VisbyBold'
            }}
          >
            {strings.EDIT_YOUR_PROFILE}
          </Text>
        </View>

        <Loader loading={loading} />

        <View style={{ flex: 1, width: "100%" }}>
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

          <View style={styles.inputField}>
            <Image
              source={require("../assets/ic_user.png")}
              style={{ width: 20, height: 20 }}
            />
            <TextInput
              style={{ width: "100%", paddingLeft: 10, color: "#000" }}
              onChangeText={(text) => setFirstName(text)}
              placeholder={strings.FIRSTNAME}
              value={firstName}
              textContentType="name"
              onFocus={() => {
                handleFocus(0);
              }}
              ref={(ref) => {
                handleRef(0, ref);
              }}
            />
          </View>

          <View style={styles.inputField}>
            <Image
              source={require("../assets/ic_user.png")}
              style={{ width: 20, height: 20 }}
            />
            <TextInput
              style={{ width: "100%", paddingLeft: 10, color: "#000" }}
              onChangeText={(text) => setLastName(text)}
              placeholder={strings.LASTNAME}
              value={lastName}
              textContentType="name"
              onFocus={() => {
                handleFocus(1);
              }}
              ref={(ref) => {
                handleRef(1, ref);
              }}
            />
          </View>

          <View style={styles.inputField}>
            <Image
              source={require("../assets/ic_address.png")}
              style={{ width: 20, height: 20 }}
            />
            <TextInput
              style={{ width: "100%", paddingLeft: 10, color: "#000" }}
              onChangeText={(text) => setAddress(text)}
              placeholder={strings.ADDRESS}
              value={address}
              textContentType="fullStreetAddress"
              onFocus={() => {
                handleFocus(2);
              }}
              ref={(ref) => {
                handleRef(2, ref);
              }}
            />
          </View>

          <View
            style={{
              flex: 2,
              alignItems: "center",
            }}
          >
            <View style={{ flex: 1, flexDirection: "row" }}>
              <TouchableOpacity
                style={styles.inputField}
                onPress={() => setModalVisible(true)}
              >
                <Image
                  source={require("../assets/ic_country.png")}
                  style={{ width: 20, height: 20, marginRight: 5 }}
                />
                <Text style={{}}>{country}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputField}>
            <Image
              source={require("../assets/ic_country.png")}
              style={{ width: 20, height: 20 }}
            />
            <TextInput
              style={{ width: "100%", paddingLeft: 10, color: "#000" }}
              onChangeText={(text) => setState(text)}
              placeholder={strings.STATE}
              value={state}
              textContentType="addressState"
              onFocus={() => {
                handleFocus(3);
              }}
              ref={(ref) => {
                handleRef(3, ref);
              }}
            />
          </View>

          <View style={styles.inputField}>
            <Image
              source={require("../assets/ic_country.png")}
              style={{ width: 20, height: 20 }}
            />
            <TextInput
              style={{ width: "100%", paddingLeft: 10, color: "#000" }}
              onChangeText={(text) => setCity(text)}
              placeholder={strings.CITY}
              value={city}
              textContentType="addressCity"
              onFocus={() => {
                handleFocus(4);
              }}
              ref={(ref) => {
                handleRef(4, ref);
              }}
            />
          </View>

          <View style={styles.inputField}>
            <Image
              source={require("../assets/ic_zip.png")}
              style={{ width: 20, height: 20 }}
            />
            <TextInput
              style={{ width: "100%", paddingLeft: 10, color: "#000" }}
              onChangeText={(text) => setZipcode(text)}
              placeholder={strings.ZIP}
              value={zipcode}
              textContentType="postalCode"
              onFocus={() => {
                handleFocus(5);
              }}
              ref={(ref) => {
                handleRef(5, ref);
              }}
            />
          </View>

          <View style={styles.inputField}>
            <Image
              source={require("../assets/ic_mail.png")}
              style={{ height: 20, width: 20 }}
            />
            <TextInput
              style={{ paddingLeft: 10, width: "100%", color: "#000" }}
              onChangeText={(text) => setEmail(text)}
              placeholder={strings.EMAIL}
              value={email}
              type="email"
              textContentType="emailAddress"
              onFocus={() => {
                handleFocus(6);
              }}
              ref={(ref) => {
                handleRef(6, ref);
              }}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Modal
              animationType="slide"
              transparent={false}
              visible={modalVisible}
              onRequestClose={() => {
                // Alert.alert('Modal has been closed.');
              }}
            >
              <SafeAreaView>
                <View style={{ marginTop: 22 }}>
                  <View
                    style={{
                      justifyContent: "flex-end",
                      alignItems: "flex-end",
                    }}
                  >
                    <View style={{ marginRight: 20, paddingVertical: 5 }}>
                      <TouchableOpacity onPress={() => setModalVisible(false)}>
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
                          onPress={() => _onPress2(item)}
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
                                  color: "#000",
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
            <View style={{ flex: 1, flexDirection: "row" }}>
              <TouchableOpacity
                style={styles.code}
                onPress={() => setModalVisible(true)}
                disabled
              >
                <Image
                  source={require("../assets/ic_call.png")}
                  style={{ width: 20, height: 20, marginRight: 5 }}
                />
                <Text style={{}}>+{phCode}</Text>
              </TouchableOpacity>

              <TextInput
                style={styles.code2}
                editable={false}
                selectTextOnFocus={false}
                onChangeText={(text) => setPhone(text)}
                placeholder={strings.PHONE}
                value={formatPhone(phone)}
                textContentType="telephoneNumber"
              />
            </View>
          </View>

          {/*<View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={{ color: "#6E5FBD" }}>
              {strings.FOR_RECEIVING_INTERVIEW_CALLS}
            </Text>
          </View>*/}

          <View style={{ flex: 1 }}>
            <View style={{ flex: 1, padding: 10, paddingHorizontal: 20 }}>
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 10,
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
                  onChangeText={(text) => setBio(text)}
                  textAlignVertical='top'
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
                paddingLeft: 10,
              }}
            >
              <Image
                source={require("../assets/ic_star.png")}
                style={{ width: 15, height: 15 }}
              />
              <Text
                style={styles.subHeadingText}
              >
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
                        <Text style={styles.subHeadingText}>
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
                        })
                      }
                    >
                      <Image
                        source={require("../assets/ic_edit.png")}
                        style={{ width: 16, height: 16, marginRight: 5, resizeMode: 'contain' }}
                      />
                    </TouchableOpacity>
                    <View style={{ width: "90%" }}>
                      <Text style={{ color: "#B1B4C7", fontSize: 14, fontFamily: 'VisbySemibold', marginBottom: 5 }}>
                        {dateFormat(p.start_date)} - {dateFormat(p.end_date)}
                      </Text>
                      <Text style={{ fontSize: 14, width: "70%", fontFamily: 'VisbyBold' }}>
                        {p.position}, {p.employer}  <Text style={{fontFamily: 'VisbyRegular'}}>{p.location}{" "}</Text>
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
                  marginBottom: 50,
                }}
                onPress={() => onPressAddPast()}
              >
                <Text style={{ color: "#4E35AE", fontSize: 16, fontFamily: 'VisbyBold' }}>
                  + {strings.ADD_PAST_POSTION}
                </Text>
              </TouchableOpacity>

              <ImageBackground
                source={require("../assets/insta-connect-bg.png")}
                style={{
                  marginHorizontal: 20,
                  borderRadius: 40,
                }}
                resizeMode={"stretch"}
              >
                <TouchableOpacity
                  style={{
                    flex: 1,
                    padding: 12,
                    flexDirection: "row",
                    paddingVertical: 15,
                    alignItems: "center",
                    // justifyContent: 'center'
                  }}
                  onPress={() => handleInstaConnect()}
                >
                  <AntDesign
                    name="instagram"
                    size={32}
                    color="white"
                    style={{ position: "absolute", left: 20 }}
                  />
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: 18,
                      marginLeft: 50,
                      fontWeight: "bold",
                    }}
                  >
                    {userData?.profile?.instagram_token
                      ? strings.INSTRAGRAM_CONNECTED
                      : strings.CONNECT_YOUR_INSTAGRAM}
                  </Text>
                  <MaterialCommunityIcons
                    name={
                      userData?.profile?.instagram_token
                        ? "check-circle-outline"
                        : "checkbox-blank-circle-outline"
                    }
                    size={32}
                    color="white"
                    style={{ position: "absolute", right: 20 }}
                  />
                </TouchableOpacity>
              </ImageBackground>
              <Text
                style={{
                  marginHorizontal: 25,
                  borderRadius: 40,
                  fontSize: 12,
                  marginBottom: 40,
                  marginTop: 10,
                  fontFamily: 'VisbySemibold'
                }}
              >
                Connecting Your Instagram account will add at least 20 posts to
                your profile and allow the business owners to view. Your
                username will not be visible.
              </Text>
              <View style={{ height: 35 }}></View>
            </View>
          </View>
        </View>
        {/* </ScrollView> */}

      </KeyboardAwareScrollView>

      <KeyboardAccessoryNavigation
        androidAdjustResize={Platform.OS == "android"}
        avoidKeyboard={true}
        style={
          Platform.OS == "android"
            ? { top: 0, position: "absolute", zIndex: 9999 }
            : { top: isIphoneX ? 20 : 0 }
        }
        onNext={handleFocusNext}
        onPrevious={handleFocusPrev}
        nextDisabled={nextFocusDisabled}
        previousDisabled={previousFocusDisabled}
      />
      {/* </KeyboardAvoidingView> */}

      <View
        style={{
          position: "absolute",
          bottom: isIphoneX ? 20 : 0,
          width: "100%",
        }}
      >
        {error ? (
          <Text style={{ color: "red", padding: 20, backgroundColor: "#fff" }}>
            {error}
          </Text>
        ) : null}
        <TouchableOpacity
          style={{
            flex: 1,
            marginHorizontal: 10,
            alignContent: "center",
            backgroundColor: "#5B42BB",
            padding: 15,
          }}
          onPress={() => updateProfile()}
        >
          <Text style={{ color: "#fff", textAlign: "center", fontSize: 18, fontFamily: 'VisbyBold' }}>
            {strings.UPDATE_PROFILE}
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
        <InstagramLogin
          ref={ref => (this.instagramLogin = ref)}
          appId='5144112875660329'
          appSecret='2d7d8aac9160e372e7262095cfced817'
          redirectUrl='https://devapi.heyhire.net/api/v1/instagram/auth'
          incognito={false}
          scopes={['user_profile', 'user_media']}
          onLoginSuccess={setIgToken}
          onLoginFailure={(data) => console.log(data)}
        />
        <Toast
          position='top'
          type='success'
        />
    </SafeAreaView>
  );
}

export default SeekerEditProfile;

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
    marginHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 5,
    borderWidth: 0.2,
    borderColor: '#bbb',
    justifyContent: 'center',
    backgroundColor: 'white'
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
    // paddingBottom: 13,
    top: -10,
    maxHeight: 40,
  },
  viewContainer: {
    maxHeight: 30,
  },
});
