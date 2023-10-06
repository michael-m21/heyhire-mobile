import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TextInput,
  Image,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSelector } from "react-redux";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

import { postJSON, getRequest, deleteJSON } from "./utils/network.js";
import { getUser } from "./utils/utils.js";
import { useIsFocused } from "@react-navigation/native";
import { strings } from "./translation/config";
import CommonUtils from "./utils/CommonUtils";
function SeekerAppliedJobs({ navigation }) {
  const isFocused = useIsFocused();
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [likedJobs, setLikedJobs] = useState([]);
  const [viewed_jobs, setViewed_jobs] = useState([]);
  const [user, setUser] = useState({});
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [isFavourite, setFavourite] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const buisnessList = useSelector(state => state.BuisnessDeails);
  const userData = useSelector(state => state.UserData);

  function searchJobs(txt) {
    setSearch(txt);

    let text = txt.toLowerCase();
    if (text == "") {
      setFilteredJobs([...appliedJobs, ...likedJobs]);
    } else {
      let jobs = [...appliedJobs, ...likedJobs].filter((j) =>
        j?.job?.title.toLowerCase().includes(text)
      );
      setFilteredJobs(jobs);
    }
  }

  useEffect(() => {
    // console.log(isFocused)
    if (isFocused) {
      loadData();
    }
  }, [isFocused]);

  function loadData() {
    setRefresh(true);

    getUser().then((u) => {
      let u2 = JSON.parse(u);
      setUser(u2);
      getRequest("/job-seeker/job-position/list", u2?.token)
        .then((res) => {
          return res.json();
        })
        .then((json) => {
          if (json.data && json.data.length == 0) {
            setMessage("You haven't applied, liked or viewed any jobs yet.");
            setFilteredJobs([]);
          } else {
            setMessage(null);
            let jobsList = json?.data?.map((job) => {
              let tempJob = job;
              buisnessList?.buisness?.map((buisness) => {
                if (job.job.location.id == buisness.id) {
                  tempJob.job.business = buisness;
                  buisness?.positions?.map((position) => {
                    if(position.id == job.job.id) {
                      tempJob.job.application = position?.application;
                    }
                  });
                }
              });
              return tempJob;
            });
            let _appliedJobs = jobsList?.filter((job) => job?.status == "applied");
            let _viewedJobs = jobsList?.filter((job) => job?.status == "viewed");
            let _favouriteJobs = jobsList?.filter((job) => {
              if (job.status == "favorite") {
                job.job.like = 1;
                return job;
              } 
            });
            setAppliedJobs(_appliedJobs);
            setViewed_jobs(_viewedJobs);
            setLikedJobs(_favouriteJobs);
            setFilteredJobs(jobsList);
          }
          setRefresh(false);
        })
        .catch((err) => {
          console.log(err);
          setRefresh(false);
        });
    });
  }

  function addWishlist(job) {
    if (!job.job.like) {
      const body = {
        job_id: job.job.id
      }
      postJSON("/job-seeker/favorite", body, userData.token)
      .then((res) => {
        return res.json();
      })
      .then((json) => {
        if (json.data && json.data.job_id) {
          let findJob = filteredJobs?.map((item) => {
            if (item.job.id == job.job.id) {
              if (job.job.like == 1) {
                item.job.like = 0;
              } else {
                item.job.like = 1;
              }
            }
            return item;
          });
          setFilteredJobs((filteredJobs) => [...findJob]);
        }
      })
      .catch((err) => {
        console.log(err);
      });
    } else {
      deleteJSON(`/job-seeker/favorite/${job.job.id}`, userData.token)
      .then((res) => {
        return res.json();
      })
      .then((json) => {
        console.log('delete -> json', json);
          let findJob = filteredJobs.filter((item) => item.job.id !== job.job.id);
          setFilteredJobs((filteredJobs) => [...findJob]);
      })
      .catch((err) => {
        console.log(err);
      });
    }
  }

  function onPressHeart(isFav) {
    if(!isApplied) {
      if(isFav) {
        setAllJobs(filteredJobs);
        setFilteredJobs(likedJobs);  
      } else {
        setFilteredJobs(allJobs);
      }
      setFavourite(isFav);
    }
  }

  function onPressApplied(applied) {
    if (!isFavourite) {
      if(applied) {
        setAllJobs(filteredJobs);
        setFilteredJobs(appliedJobs);  
      } else {
        setFilteredJobs(allJobs);
      }
      setIsApplied(applied);
    }
  }

  const list = filteredJobs?.map((item) => {
    // console.log(item)
    const isLiked = likedJobs.filter((item1) => item.job.id == item1.job.id);
    const isApplied = appliedJobs.filter((item1) => item.job.id == item1.job.id);
    const isViewed = viewed_jobs.filter((item1) => item.job.id == item1.job.id);

    const distance = CommonUtils.distance(
      parseFloat(item.job.location.address.lat),
      parseFloat(item.job.location.address.lng),
      "K"
    );

    return (
      <TouchableOpacity
        key={item.job.id + "" + item.status}
        onPress={() => {
          if (isViewed.length > 0) {
            let tempJob = isApplied.length > 0 ? isApplied[0] : item.job;
            tempJob.viewed_at = isViewed[0].viewed_at;
            navigation.navigate("SeekerAppliedJobs0", {
              screen: "SeekerJobDetail",
              params: { job: tempJob, callBack: (job) => addWishlist(item), no_UpdatePage: true },
            });
          } else {
            navigation.navigate("SeekerAppliedJobs0", {
              screen: "SeekerJobDetail",
              params: { job: isApplied.length > 0 ? isApplied[0].job : item.job, callBack: (job) => addWishlist(item), no_UpdatePage: true },
            });
          }
        }}
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
              source={{ uri: item?.job?.business?.brand?.photo?.tiny_url }}
              style={{
                width: wp('10%'),
                height: wp('10%'),
                backgroundColor: "#444",
                borderRadius: wp('10%'),
                borderWidth: 1,
                borderColor: "#888",
              }}
            />
          </View>
          <View style={{ width: "65%", backgroundColor: "#F4F5FA" }}>
            <View style={{}}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ fontSize: 18, fontWeight: "bold", color: '#3D3B4E' }}>
                  {item.job.title}
                </Text>
                {item.status == "applied" ? (
                  <Image
                    source={require("../assets/ic_applied.png")}
                    style={{ width: wp('16%'), height: hp('1.8%'), marginLeft: 5, borderRadius: 4 }}
                  />
                ) : null}
                {isViewed.length > 0 && (
                  <View style={{ width: 35 }}>
                    <Image
                      source={require("../assets/ic-viewed.png")}
                      style={{ width: wp('16%'), height: hp('1.8%'), marginLeft: 5, borderRadius: 4 }}
                    />
                  </View>
                )}
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
                  ellipsizeMode="middle"
                >
                  {item.job.business && item.job.business.name ? item.job.business.name : ""}{" "}
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

              <Text style={{ fontSize: 12, color: "#888", marginTop: 2.5 }} numberOfLines={1} ellipsizeMode="tail">
                {item.job.business && item.job.business.address ? item.job.business.address.address : ""}
              </Text>
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
            {isLiked.length > 0 && item.job.like == 1 ? (
              <TouchableOpacity onPress={() => addWishlist(item)}>
                <View style={{ width: 40 }}>
                  {item.job.like == "1" ? (
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
  });

  return (
    <LinearGradient style={{ flex: 1 }} colors={["#4E35AE", "#775ED7"]}>
      <SafeAreaView>
        <View
          style={{
            width: wp('100%'),
            flexDirection: "row",
            alignItems: "center",
            borderBottomWidth: 1,
            borderBottomColor: "#6652C2",
            paddingBottom: 10,
            backgroundColor: "#4E35AE",
            paddingTop: 20,
            justifyContent: 'space-between',
          }}
        >
          <TouchableOpacity onPress={() => onPressApplied(!isApplied)} style={{ width: wp('33%') }}>
            <Image
              source={isFavourite ? require("../assets/tick-icon-dull.png") :  require("../assets/tick-icon.png")}
              style={{ alignSelf: 'flex-start', height:20, width: 40 }}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <View style={{ width: wp('33%'), justifyContent: 'center', alignItems: 'center' }}>
            <Image
              source={require("../assets/heyhireFullWhite.png")}
              resizeMode="contain"
              style={{ width: 100, height: 25 }}
            />
          </View>
          <TouchableOpacity onPress={() => onPressHeart(!isFavourite)} style={{ width: wp('33%') }}>
            <Image
              source={isFavourite ? require("../assets/filled-heart-white-icon.png") : require("../assets/heart-icon-with-border.png")}
              style={{ alignSelf: 'flex-end', height:20, width: 40 }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={{ backgroundColor: "#FFF", marginBottom: 50 }}
          refreshControl={
            <RefreshControl
              refreshing={refresh}
              onRefresh={() => {
                loadData();
              }}
              tintColor={"#4E35AE"}
            />
          }
        >
          <View style={{ backgroundColor: "#F4F5FA", minHeight: 1000 }}>
            <View
              style={{
                backgroundColor: "#4E35AE",
                padding: 20,
                borderBottomLeftRadius: 7,
                borderBottomRightRadius: 7,
              }}
            >
              <View style={{ flex: 1, flexDirection: "row" }}>
                <Image source={require("../assets/ic_search_w.png")} />

                <TextInput
                  style={{
                    width: "85%",
                    paddingLeft: 10,
                    color: "#fff",
                    paddingTop: 0,
                  }}
                  onChangeText={(text) => searchJobs(text)}
                  placeholder={strings.SEARCH_SPECIFIC_JOB}
                  value={search}
                  placeholderTextColor="#fff"
                />

                <Image
                  source={require("../assets/ic_filter_w.png")}
                  style={{}}
                />
              </View>
            </View>
            <View style={{ marginVertical: 10 }}>{list}</View>

            {message != null && (
              <Text style={{ fontSize: 18, textAlign: "center" }}>
                {message}
              </Text>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

export default SeekerAppliedJobs;
