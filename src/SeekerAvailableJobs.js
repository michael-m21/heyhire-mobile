import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  RefreshControl,
  Dimensions,
  FlatList
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Toast from 'react-native-toast-message';
import { useSelector } from "react-redux";
import { getUser } from "./utils/utils.js";
import { getRequest, postJSON, deleteJSON } from "./utils/network.js";
import { LinearGradient } from "expo-linear-gradient";
import { useIsFocused } from "@react-navigation/native";
const window = Dimensions.get("window");
import { strings } from "./translation/config";
import CommonUtils from "./utils/CommonUtils";

function SeekerAvailableJobs({ route, navigation }) {
  // const [bizId, setBizId] = useState(route.params.biz_id)
  const isFocused = useIsFocused();
  const [user, setUser] = useState({});
  const [profile, setProfile] = useState({});
  const [jobs, setJobs] = useState([]);
  const [allJobsList, setAllJobsList] = useState([]);
  const [toggleJobsList, setToggleJobsList] = useState(false);
  const [error, setError] = useState(null);
  const [jobError, setJobError] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const userData = useSelector(state => state.UserData)
  const [favoriteJobs, setFavoriteJobs] = useState([]);

  useEffect(() => {
    loadDate();
  }, []);

  useEffect(() => {
    setJobsList()
  }, [favoriteJobs])

  function loadDate() {
    setRefresh(true);
    getUser().then(async (u) => {
      let u2 = JSON.parse(u);
      setUser(u2);
      await loadJobs();
    });
  }

  function loadJobs() {
    getRequest(`/job-seeker/location/${route?.params?.biz_id}`, userData?.token)
    .then((res) => {
      return res.json();
    })
    .then(async (json) => {
      setRefresh(false);
      if (json.data && typeof json.data == "object") {
        setProfile(json.data);
          if (json.data.positions.length == 0) {
            setJobError(
              "This business is currently not hiring. But don't worry, there are many more businesses to work at on our network! Keep hunting!"
            );
          } else {
            const filterJobs = json.data.positions.filter(item => !item.archived_at)
            await setJobs(filterJobs);
            await loadFavoriteJobs();
          }
      } else {
        setError("We're sorry, this business is currently inactive.");
      }
    })
    .catch((err) => {
      setRefresh(false);
      notifyErrorMessage('Invalid QR Code');
      console.log('loadJobs -> err', err);
    });
  }

  function loadFavoriteJobs() {
    getRequest(`/job-seeker/favorite/`, userData.token)
    .then((res) => {
      return res.json();
    })
    .then((json) => {
      setRefresh(false);
      console.log('loadFavoriteJobs -> json', json);
      if (json.data && typeof json.data == "object") {
        setFavoriteJobs(json.data);
      }
    })
    .catch((err) => {
      console.log(err);
    });
  }

  function setJobsList() {
    console.log('loadFavoriteJobs -> is and object -> json', favoriteJobs);
    let findJob = jobs.map((item) => {
      favoriteJobs.map((job) => {
        if (item.id == job.job_id) {
          if(!item.like) {
            item.like = 1;
          }
        }  
      })
      return item;
    });
    console.log('loadFavoriteJobs -> findJob', findJob);
    setJobs((jobs) => [...findJob]);
  }

  function isApplied(job) {
    const findJob = jobs.find((item) => item.id == job.id);
    if (findJob.wishlist) {
      return true;
    }
    return false;
  }

  function notifyMessage(msg) {
    Toast.show({
      type: 'success',
      text1: msg,
      position: 'top',
      visibilityTime: 4000
    });
  }

  function setCurrentJobsList() {
    let favoriteJobs = jobs.filter(item => item.like);
    if(!toggleJobsList) {
      setToggleJobsList(true);
      setAllJobsList(jobs);
      setJobs(favoriteJobs);
    } else {
      setToggleJobsList(false);
      setJobs(allJobsList);      
    }
  }

  function notifyErrorMessage(msg) {
    Toast.show({
      type: 'error',
      text1: 'Invalid QR Code',
      position: 'top',
      visibilityTime: 4000
    });
  }

  function getHired(job) {
    let tempJob = job;
    tempJob.business = profile;
    if (route.name == "SeekerHomeAvailableJobs") {
      navigation.navigate("SeekerHomeJobDetail", { job: tempJob, callBack: (job) => addWishlist(job), updateCallBack: () => loadJobs() });
    } else {
      navigation.navigate("SeekerAppliedJobs0", {
        screen: "SeekerJobDetail",
        params: { job: tempJob },
      });
    }
  }

  function addWishlist(job) {
    if (!job.like) {
      const body = {
        job_id: job.id
      }
      // const res = await postJSON("/job-seeker/favorite", body, userData.token);
      postJSON("/job-seeker/favorite", body, userData.token)
      .then((res) => {
        return res.json();
      })
      .then((json) => {
        if (json.data && json.data.job_id) {
          let findJob = jobs.map((item) => {
            if (item.id == job.id) {
              if (job.like == 1) {
                item.like = 0;
              } else {
                item.like = 1;
              }
            }
            return item;
          });
          notifyMessage("Job Added to Favorites");
          setJobs((jobs) => [...findJob]);
        }
      })
      .catch((err) => {
        console.log(err);
      });
    } else {
      deleteJSON(`/job-seeker/favorite/${job.id}`, userData.token)
      .then((res) => {
        return res.json();
      })
      .then((json) => {
        console.log('delete -> json', json);
          let findJob = jobs.map((item) => {
            if (item.id == job.id) {
              if (job.like == 1) {
                item.like = 0;
              }
            }
            return item;
          });
          notifyMessage("Job removed from Favorites");
          setJobs((jobs) => [...findJob]);
      })
      .catch((err) => {
        console.log(err);
      });
    }
  }

  const renderItem = ({item}) => {
    const distance = CommonUtils.distance(
      parseFloat(profile.address.lat),
      parseFloat(profile.address.lng),
      "K"
    );

    return (
      <TouchableOpacity
        key={item.id}
        onPress={() => getHired(item)}
      >
        <View
          style={{
            backgroundColor: "#F4F5FA",
            borderColor: "#eee",
            padding: 15,
            marginBottom: 15,
            borderWidth: 1,
            borderRadius: 10,
            shadowColor: "#888",
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
            marginHorizontal: 10,
          }}
        >
          <View style={{ width: "17%" }}>
            <Image
              source={{ uri: profile?.brand?.photo?.thumb_url }}
              style={{
                width: wp('10%'),
                height: wp('10%'),
                backgroundColor: "#999",
                borderRadius: wp('10%'),
                borderWidth: 1,
                borderColor: "#888",
              }}
            />
          </View>
          <View style={{ width: "65%", backgroundColor: "#F4F5FA" }}>
            <View style={{}}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text
                  //ellipsizeMode='tail'
                  //numberOfLines={1}
                  style={{ fontSize: 18, fontWeight: "bold", color: '#3D3B4E'/*, width: item.application ? wp('31%') : wp('50%')*/ }}
                >
                  {item.title}
                </Text>
                {item.application && item.application.status == "applied" ? (
                  <Image
                    source={require("../assets/ic_applied.png")}
                    style={{ width: wp('16%'), height: hp('1.8%'), marginLeft: 5, borderRadius: 4 }}
                  />
                ) : null}
                {item.application && item.application.status == "viewed" ? (
                  <View style={{ width: 35 }}>
                    <Image
                      source={require("../assets/ic-viewed.png")}
                      style={{ width: wp('16%'), height: hp('1.8%'), marginLeft:5, borderRadius: 4 }}
                    />
                  </View>
                ) : null}
              </View>
              <View style={{ flexDirection: "row" }}>
                <Text
                  style={{
                    fontSize: 14,
                    color: "#444",
                    fontWeight: "600",
                    textAlignVertical: "center",
                  }}
                  numberOfLines={1}
                  ellipsizeMode='middle'
                >
                  {profile?.name}{" "}
                  <Text
                    style={{
                      fontSize: 14,
                      color: "#666",
                      textAlignVertical: "center",
                      fontWeight: "200",
                    }}
                  >
                    {" • "}
                    {distance} {strings.MILES_AWAY}
                  </Text>
                </Text>
              </View>
            </View>
          </View>
          <View
            style={{
              width: "18%",
              alignItems: "flex-end",
              flexDirection: "row",
              justifyContent: "flex-end",
            }}
          >
            {!item.application || (item.application && item.application.status !== "applied") ? (
              <TouchableOpacity onPress={() => addWishlist(item)}>
                <View style={{ width: 40 }}>
                  {item.like == "1" ? (
                    <Image
                      source={require("../assets/ic_filled_heart_icon.png")}
                      style={{ width: 30, height: 30, resizeMode: 'contain' }}
                    />
                  ) : (
                    <Image
                      source={require("../assets/ic_heart_gray_header.png")}
                      style={{ width: 30, height: 30, resizeMode: 'contain' }}
                    />
                  )}
                </View>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <LinearGradient style={{ flex: 1 }} colors={["#4E35AE", "#775ED7"]}>
      <SafeAreaView>
        <View
          style={{
            width: wp('100%'),
            backgroundColor: "#4E35AE",
            flexDirection: "row",
            alignItems: "center",
            borderBottomWidth: 1,
            borderBottomColor: "#715FCB",
            paddingBottom: 10,
            paddingTop: 20,
          }}
        >
          <View style={{ width: wp("33.3%") }}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Image
                source={require("../assets/ic_back_w.png")}
                style={{ width: 20, height: 20, marginLeft: 10, resizeMode: 'contain' }}
              />
            </TouchableOpacity>
          </View>
          <View style={{ width: wp("33.3%"), justifyContent: 'center', alignItems: 'center' }}>
            <Image
              source={require("../assets/heyhireFullWhite.png")}
              style={{ width: 120, height: 25, resizeMode: 'contain' }}
            />
          </View>
          <View
            style={{
              width: wp("33.3%"),
              alignItems: "flex-end",
              paddingRight: 15,
            }}
          >
            <TouchableOpacity
              onPress={() =>
                setCurrentJobsList()
                /*
                navigation.navigate("SeekerLinks", {
                  screen: "SeekerEditProfile",
                })*/
              }
            >
              <Image
                source={toggleJobsList ? require("../assets/ic_heart_filled_w.png") : require("../assets/ic_heart_blank.png")}
                style={{ width: 28, height: 25, marginLeft: 15, resizeMode: 'contain' }}
              />
            </TouchableOpacity>
          </View>
        </View>
        <ScrollView
          horizontal={false}
          style={{ marginBottom: 50 }}
          refreshControl={
            <RefreshControl
              refreshing={refresh}
              onRefresh={() => {
                loadDate();
              }}
              tintColor={"#fff"}
            />
          }
        >
          {error ? (
            <View
              style={{
                // justifyContent: "center",
                alignItem: "center",
                marginTop: window.height / 2 - 100,
                marginHorizontal: 20,
                minHeight: window.height / 2,
                backgroundColor: "#fff",
              }}
            >
              <Text style={{ textAlign: "center" }}>{error}</Text>
            </View>
          ) : (
            <View>
              <LinearGradient
                style={{ flex: 1, alignItems: "center" }}
                colors={["#4E35AE", "#775ED7"]}
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
                    resizeMode= 'contain'
                  >
                    <Image
                      source={{ uri: profile?.brand?.photo?.thumb_url }}
                      style={{
                      width: wp('30%'),
                      height: wp('30%'),
                      borderRadius: wp('30%')
                    }}
                    />
                  </ImageBackground>
                </View>

                <View
                  style={{
                    flex: 1,
                    alignItems: "center",
                    marginHorizontal: 20,
                  }}
                >
                  {profile?.address && (
                    <Text
                      style={{ color: "#fff", fontSize: hp('3.0%'), textAlign: "center", fontFamily: 'VisbyBold' }}
                    >
                      {profile?.address?.name}
                    </Text>
                  )}
                </View>

                <View
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Image
                    source={require("../assets/location_white.png")}
                    style={{
                      width: 12,
                      height: 12,
                      marginTop: 10,
                      marginRight: 5,
                      resizeMode: 'contain'
                    }}
                  />
                  {profile?.address && (
                    <Text style={{ color: "#fff", marginTop: 10, fontSize: hp('1.7%'), fontFamily: 'VisbySemibold' }}>
                      {profile?.address?.address}
                    </Text>
                  )}
                </View>

                {/* <View style={{ flex: 1, marginTop: 30 }}>
                  <View
                    style={{
                      borderBottomColor: "#715FCB",
                      borderBottomWidth: 1,
                    }}
                  ></View>
                </View> */}

                <View
                  style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                    paddingBottom: hp('7%'),
                    paddingTop: hp('10%')
                  }}
                >
                  <Text
                    style={{
                      color: "#fff",
                      textAlign: "center",
                      paddingHorizontal: 20,
                      textAlign: "left",
                      fontSize: 13.5,
                      fontWeight: '600'
                    }}
                  >
                    {profile?.brand?.description}
                  </Text>
                </View>
              </LinearGradient>
              {jobError ? (
                <View
                  style={{
                    //  justifyContent: "center",
                    alignItem: "center",
                    paddingTop: 100,
                    marginHorizontal: 20,
                    minHeight: 400,
                  }}
                >
                  <Text style={{ textAlign: "center" }}>{jobError}</Text>
                </View>
              ) : (
                <View
                  style={{
                    flex: 1,
                    backgroundColor: "#fff",
                    minHeight: 450,
                    padding: 20,
                  }}
                >
                  <View style={{ maxWidth: "100%" }}>
                    <Text style={{ fontSize: 22, paddingBottom: 5, fontWeight: 'bold', color: '#3D3B4E' }}>
                      {strings.CURRENTLY_HIRING_FOR}
                    </Text>
                    <Text
                      style={{ fontSize: 12, color: "#BC74A9", marginBottom: 30 }}
                    >
                      {strings.TAP_JOB_TO_APPLY}
                    </Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <FlatList
                      data={jobs}
                      renderItem={renderItem}
                      keyExtractor={item => item.id}
                      extraData={favoriteJobs}
                    />
                  </View>
                </View>
              )}
            </View>
          )}
        </ScrollView>
        <Toast
          position='top'
          type='success'
        />
      </SafeAreaView>
    </LinearGradient>
    // </LinearGradient>
  );
}

export default SeekerAvailableJobs;
