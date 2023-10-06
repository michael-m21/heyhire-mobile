import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  ImageBackground,
  RefreshControl,
  Linking,
  StyleSheet
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { getUser, setUser } from "./utils/utils.js";
import { postFormData, getRequest, postJSON } from "./utils/network.js";
import InstagramLogin from 'react-native-instagram-login';
import { LinearGradient } from "expo-linear-gradient";
import ConfirmationAlert from "./components/ConfirmationAlert";
import AlertPopup from "./components/AlertPopup";
import { strings } from "./translation/config";
import { useSelector, useDispatch } from "react-redux";
import { useIsFocused } from "@react-navigation/native";
import moment from "moment";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";

function SeekerJobDetail({ route, navigation }) {
  const isFocused = useIsFocused();
  const dispatch = useDispatch();

  const tempJob = Object.assign({}, route?.params?.job, {});
  const [user, setUser1] = useState({});
  const [business, setBusiness] = useState(tempJob.business);
  const [job, setJob] = useState(tempJob);
  const [modal1, setModal1] = useState(false);
  const [modal2, setModal2] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const userData = useSelector(state => state.UserData);

  useEffect(() => {
    Linking.addEventListener("url", handleOpenURL);
      loadData();
    return () => {
      Linking.removeEventListener("url", handleOpenURL);
    };
  }, [isFocused]);

  function loadData() {
    setRefresh(true);
    getUser().then((u) => {
      let u2 = JSON.parse(u);
      setUser1(u2);
      getRequest(`/job-seeker/job-position/${route?.params?.job.id}`, userData.token)
        .then((res) => {
          return res.json();
        })
        .then((json) => {
          console.log("Detail after updates in api ", json);
          setJob(
            Object.assign(json.data, { like: tempJob.like ? tempJob.like : 0 })
          );
          setRefresh(false);
        })
        .catch((err) => {
          setRefresh(false);
          console.log(err);
        });
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

  function handleOpenURL(event) {
    let businessId = event.url.split("/").filter(Boolean).pop();
    console.log("Hand", event.url, businessId);
    if (businessId == "instagram-success") {
      Alert.alert("Instagram connected successfully");
      onCloseInstagramConnect();
    } else if (businessId == "instagram-failure") {
      Alert.alert("Instagram not connected");
    }
  }

  function handlePostCV() {
    setModal1(true);
  }

  async function onSendCV() {
    try {
      const body = {
        "job_id": job.id
      }
      const res = await postJSON('/job-seeker/application/', body, userData.token);
      const json = await res.json()
      setModal2(true);
      const tempJob = Object.assign({}, job, { application: {status: "applied", applied_at: new Date()} });
      setJob(tempJob);
      if(!route?.params?.no_UpdatePage) {
        route?.params?.updateCallBack();
      }
      if (job.like == "1") {
        route?.params?.callBack(route?.params?.job);
      }
    } catch (error) {
      console.log('error', error);
    }
  }

  useEffect(() => {
    setJob(job);
  }, [job]);

  function onCancelCV() {
    Alert.alert(
      "Confirm",
      "Are you sure you want to revoke your application?",
      [
        {
          text: "Cancel",
          onPress: () => { },
          style: "cancel",
        },
        {
          text: "OK",
          onPress: () => {
            getRequest(`/job-seeker/application/cancel/${job.id}`, userData.token)
            .then((res) => {
              return res.json();
            })
            .then((json) => {
               if (json?.data && json?.data?.status == "canceled") {
                if(!route?.params?.no_UpdatePage) {
                  route?.params?.updateCallBack();
                }
                Alert.alert("Success", "Your Application is canceled Successfully.");
                navigation.goBack();
              } else if (json.errors && json.errors.job_id) {
                Alert.alert("Error", json.errors.job_id[0]);
              } else {
                Alert.alert("Error", "Something went wrong. Please try again later.");
              }
            })
            .catch((err) => {
              console.log(err);
            });
          },
        },
      ],
      { cancelable: false }
    );
  }

  function onNudge() {
    console.log(job);
    const appliedDate = moment(new Date(job.application.applied_at));
    const currentDate = moment();

    var dayDiff = currentDate.diff(appliedDate, "days");
    if (dayDiff > 4) {
      const body = {
        job_position_id: job.id
      };
  
      postJSON("/job-seeker/nudge", body, userData.token)
        .then((res) => {
          return res.json();
        })
        .then((json) => {
          if (json?.message) {
            Alert.alert("", json.message);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      const days = 5 - dayDiff;
      Alert.alert(
        "",
        "You can only nudge the manager after 5 business days. Please try again in " + days + (days > 1 ? " days." : " day.")
      );
    }
  }

  return (
    <LinearGradient style={{ flex: 1 }} colors={["#4E35AE", "#775ED7"]}>
      <SafeAreaView>
        <View
          style={{
            // backgroundColor: '#4E35AE',
            width: wp('100%'),
            flexDirection: "row",
            alignItems: "center",
            borderBottomWidth: 1,
            borderBottomColor: "#715FCB",
            paddingBottom: 10,
            paddingTop: 15,
          }}
        >
          <View style={{ width: "33.3%" }}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Image
                source={require("../assets/ic_back_w.png")}
                style={{ width: 20, height: 20, marginLeft: 10, resizeMode: 'contain' }}
              />
            </TouchableOpacity>
          </View>
          <View style={{ width: "33.3%", justifyContent: 'center', alignItems: 'center' }}>
            <Image
              source={require("../assets/heyhireFullWhite.png")}
              style={{ width: 120, height: 25, resizeMode: 'contain' }}
            />
          </View>
          <View style={{ width: "33.3%" }}>
            <View
              style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
            >
              <View style={{ flex: 2 }}></View>
              <TouchableOpacity style={{ flex: 1 }}>
                <Image
                  source={require("../assets/ic_share_w.png")}
                  style={{ width: 20, height: 20 }}
                />
              </TouchableOpacity>
              {!job.application && route?.params?.callBack ? (
                <TouchableOpacity
                  onPress={() => {
                    route?.params?.callBack(route?.params?.job);
                    if (job.like && job.like == 1) {
                      setJob(
                        Object.assign({}, job, {like: 0})
                      );
                    } else {
                      setJob(
                        Object.assign({}, job, {like: 1})
                      );
                    }
                    console.log('_tempJob', job);
                  }}
                >
                  {job.like & job.like == 1 ? (<Image
                    source={require("../assets/ic_heart_filled_w.png")}
                    style={{ width: 28, height: 25, marginRight: 5, resizeMode: 'contain' }}
                  />) : (
                  <Image
                    source={require("../assets/ic_heart_blank.png")}
                    style={{ width: 28, height: 25, marginRight: 5, resizeMode: 'contain' }}
                  />)}
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        </View>
        <ScrollView
          horizontal={false}
          style={{ marginBottom: 50 }}
          refreshControl={
            <RefreshControl
              refreshing={refresh}
              onRefresh={() => {
                loadData();
              }}
              tintColor={"#fff"}
            />
          }
        >
          <View style={{ flex: 1, alignItems: "center", padding: 20 }}>
            <ImageBackground
              source={require("../assets/buisness_image_container.png")}
              style={{
                width: wp('35%'),
                height: wp('35%'),
                justifyContent: 'center',
                alignItems: 'center'
              }}
              resizeMode='contain'
            >
              <Image
                source={{ uri: business?.brand?.photo ? business?.brand?.photo?.thumb_url : null }}
                style={{
                  width: wp('30%'),
                  height: wp('30%'),
                  borderRadius: wp('30%'),
                }}
              />
            </ImageBackground>
          </View>

          <View style={{ flex: 1, alignItems: "center", marginHorizontal: 20, marginBottom: 10 }}>
            <Text style={{ color: "#fff", fontSize: hp('3.5%'), textAlign: "center", fontFamily: 'VisbyBold' }}>
              {job.title}
            </Text>
          </View>

          <View style={[styles.statusRowContainer, {marginHorizontal: 20}]}>
            <Image
              source={require('../assets/ic_calendar_w.png')}
              style={{ width: 9, height: 9, resizeMode: 'contain' }}
            />
            <Text style={[styles.statusRowText, {marginLeft: 5}]}>
              {strings.START_DATE}:
            </Text>
            <Text style={[styles.statusRowText, {marginLeft: 5}]}>
              {moment(job.start_date).format("MM/DD/YYYY")}
            </Text>
          </View>

          <View style={{ flex: 1, alignItems: "center", marginVertical: 2 }}>
            <Text style={{ color: "#fff", fontSize: hp('1.7%'), fontFamily: 'VisbyBold' }}>
              {job?.location?.name}
            </Text>
          </View>

          {job?.application && job?.application?.status == "viewed" && (
            <View style={styles.statusRowContainer}>
              <Text style={styles.statusRowText}>{strings.VIEWED_ON}: </Text>
              <Text style={styles.statusRowText}>
                {moment(job.application.viewed_at).format("MM/DD/YYYY")}
              </Text>
            </View>
          )}

          <View
            style={{
              flex: 1,
              alignItems: "center",
              paddingBottom: 20,
              borderBottomWidth: 1,
              borderBottomColor: "#715FCB",
              marginVertical: 2
            }}
          >
            <View
              style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
            >
              <Image
                source={require("../assets/location_white.png")}
                style={{ width: 12, height: 12, resizeMode: 'contain' }}
              />
              <Text style={{ color: "#fff", marginLeft: 5, fontSize: hp('1.6%'), fontFamily: 'VisbySemibold' }}>
                {business?.address?.address}
              </Text>
            </View>
          </View>

          {job.application && (
            <View style={{marginTop: hp('3%'), marginBottom: hp('5%')}}>
              <View style={styles.statusRowContainer}>
                <Text style={styles.statusRowText}>Application Status:</Text>
              </View>
              <View style={styles.statusRowContainer}>
                <Image
                  source={require('../assets/ic_calendar_w.png')}
                  style={{ width: 9, height: 9, resizeMode: 'contain' }}
                />
                <Text style={[styles.statusRowText, {marginLeft: 5}]}>{strings.APPLIED_ON}: </Text>
                <Text style={styles.statusRowText}>
                  {moment(job.application.applied_at).format("MM/DD/YYYY")}
                </Text>
              </View>
              {job.application && job.application.viewed_at && (
                <View style={styles.statusRowContainer}>
                  <Image
                    source={require('../assets/ic_view_white.png')}
                    style={{ width: 12, height: 12, resizeMode: 'contain' }}
                  />
                  <Text style={[styles.statusRowText, {marginLeft: 5}]}>{strings.VIEWED_ON}: </Text>
                  <Text style={styles.statusRowText}>
                    {moment(job.application.viewed_at).format("MM/DD/YYYY")}
                  </Text>
                </View>
              )}
            </View>
          )}


          {business?.brand?.description && (
            <View
              style={{
                flex: 1,
                padding: 20,
                borderBottomWidth: 1,
                borderBottomColor: "#715FCB",
              }}
            >
              <Text style={{ color: "#fff", fontSize: hp('1.5%'), fontFamily: 'VisbyRegular', lineHeight: hp('1.9%'), textAlign: 'left' }}>{business?.brand?.description}</Text>
            </View>
          )}

          <View
            style={{
              flex: 1,
              alignItems: "flex-start",
              backgroundColor: "#f6f6f6",
              paddingTop: 40,
              paddingLeft: 15,
              paddingRight: 15,
              paddingBottom: 50,
            }}
          >
            <View
              style={{
                width: "100%",
                padding: 10,
                backgroundColor: "#fff",
                minHeight: 300,
                borderRadius: 10,
                borderColor: "#eee",
                borderWidth: 1,
              }}
            >
              <View
                style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
              >
                <Image
                  source={require("../assets/ic_category_yellow.png")}
                  style={styles.headingIcon}
                />
                <Text style={styles.headingText}>
                  {strings.POSITION_DESCRIPTION}
                </Text>
              </View>
              <Text style={styles.subText}>
                {job.description}
              </Text>

              <View
                style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
              >
                <Image
                  source={require("../assets/ic_mind_yellow.png")}
                  style={styles.headingIcon}
                />
                <Text style={styles.headingText}>
                  {strings.REQUIRED_EXPERIENCE}
                </Text>
              </View>
              <Text style={styles.subText}>
                {job.experience}
              </Text>
              <View
                style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
              >
                <Image
                  source={require("../assets/ic_certificate_yellow.png")}
                  style={styles.headingIcon}
                />
                <Text style={styles.headingText}>
                  {strings.REQUIRED_CERTIFICATIONS}
                </Text>
              </View>
              <Text style={styles.subText}>
                {job?.certifications
                  ? job.certifications.map((item) => item + "\n")
                  : ""}
              </Text>
              {job.instagram_required ? (
                <View>
                  <View
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: hp('2.0%'),
                        color: '#594A9E',
                        fontFamily: 'VisbyBold'
                      }}
                    >
                      {"Instagram required"}
                    </Text>
                  </View>

                  <Text style={[styles.subText, { marginTop: 10 }]}>
                    {business?.name}{" "}
                    {
                      "is requesting that you connect your Instagram account to your profile to apply for this position."
                    }
                  </Text>
                  {userData && userData.profile && !userData.profile.instagram_token ? (
                    <View>
                      <Text style={styles.subText}>
                        {"Please connect your Instagram"}
                      </Text>
                      <ImageBackground
                        source={require("../assets/insta-connect-bg.png")}
                        style={{
                          borderRadius: 40,
                        }}
                        resizeMode={"stretch"}
                      >
                        <TouchableOpacity
                          style={{
                            padding: 12,
                            flexDirection: "row",
                            paddingVertical: 15,
                            alignItems: "center",
                            // justifyContent: 'center'
                          }}
                          onPress={() => {
                            this.instagramLogin.show();
                          }}
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
                            {strings.CONNECT_YOUR_INSTAGRAM}
                          </Text>
                          <MaterialCommunityIcons
                            name={"checkbox-blank-circle-outline"}
                            size={32}
                            color="white"
                            style={{ position: "absolute", right: 20 }}
                          />
                        </TouchableOpacity>
                      </ImageBackground>
                    </View>
                  ) : (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginTop: 5,
                      }}
                    >
                      <Text style={{ fontSize: 15, marginRight: 5 }}>
                        {"Your account is connected to Instagram"}
                      </Text>
                      <Image
                        source={require("../assets/checkbox_checked.png")}
                        style={{ width: 20, height: 20 }}
                      />
                    </View>
                  )}
                </View>
              ) : null}
            </View>
            {job?.application && job?.application?.status == "applied" ? (
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  marginTop: 20,
                  width: "100%",
                }}
              >
                <TouchableOpacity
                  style={{
                    width: "100%",
                    backgroundColor: "#F1B257",
                    paddingTop: 12,
                    paddingBottom: 12,
                    borderRadius: 50,
                    marginBottom: 10,
                    justifyContent: "center",
                  }}
                  onPress={() => onNudge()}
                >
                  <Image
                    source={require("../assets/Bell.png")}
                    style={{
                      height: 25,
                      width: 25,
                      position: "absolute",
                      left: 20,
                    }}
                  />
                  <Text
                    style={{ textAlign: "center", fontSize: 18, color: "#000" }}
                  >
                    {strings.SEND_NUDGE}
                  </Text>
                </TouchableOpacity>
                <Text style={{ fontSize: 14, color: "#666", marginBottom: 10, marginHorizontal: 5, opacity: 0.7 }}>{strings.NUDGE_DESCRIPTION}</Text>
                <TouchableOpacity
                  style={{
                    width: "100%",
                    backgroundColor: "#f00",
                    paddingTop: 12,
                    paddingBottom: 12,
                    borderRadius: 50,
                  }}
                  onPress={() => onCancelCV()}
                >
                  <Text
                    style={{ textAlign: "center", fontSize: 18, color: "#fff" }}
                  >
                    {strings.CANCEL_APPLICATION}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  marginTop: 20,
                  width: "100%",
                }}
              >
                <TouchableOpacity
                  style={{
                    width: "100%",
                    backgroundColor:
                      job.instagram_required && !userData?.profile?.instagram_token
                        ? "#a8a4a6"
                        : "#4834A6",
                    paddingTop: 12,
                    paddingBottom: 12,
                    borderRadius: 50,
                  }}
                  onPress={tempJob && tempJob?.application !== null ? tempJob?.application?.status === "applied" ? () => onCancelCV() : () => handlePostCV() : () => handlePostCV()}
                  disabled={job.instagram_required && !userData?.profile?.instagram_token}
                >
                  <Text
                    style={{ textAlign: "center", fontSize: 18, color: "#fff" }}
                  >
                    {tempJob && tempJob?.application !== null ? tempJob?.application?.status === "applied" ? strings.CANCEL_APPLICATION : strings.SEND_APPLICATION  : strings.SEND_APPLICATION}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          <ConfirmationAlert
            visible={modal1}
            job={job}
            business={business}
            onClose={() => setModal1(false)}
            onSendCV={() => onSendCV()}
          />
          <AlertPopup
            visible={modal2}
            job={job}
            business={business}
            onClose={() => setModal2(false)}
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
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

export default SeekerJobDetail;

const styles = StyleSheet.create({
  headingIcon: {
    width: hp('2%'),
    height: hp('2%'),
    resizeMode: 'contain'
  },
  headingText: {
    fontSize: hp('2.5%'),
    marginLeft: 10,
    color: '#594A9E',
    fontFamily: 'VisbyBold'
  },
  subText: {
    marginBottom: hp('2.5%'),
    lineHeight: hp('1.9%'),
    marginTop: hp('1%'),
    fontSize: hp('1.6%'),
    color: '#3D3B4E',
    fontFamily: 'VisbyRegular'
  },
  statusRowContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 2
  },
  statusRowText: {
    color: "#fff",
    fontSize: hp('1.7%'),
    fontFamily: 'VisbySemibold'
  }
});