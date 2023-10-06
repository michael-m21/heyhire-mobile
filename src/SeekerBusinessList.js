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
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import { getRequest } from "./utils/network.js";
import { getUser } from "./utils/utils.js";
import { useIsFocused } from "@react-navigation/native";
import { strings } from "./translation/config";
import CommonUtils from "./utils/CommonUtils";
function SeekerBusinessList({ navigation }) {
  const isFocused = useIsFocused();
  const [businesses, setBusinesses] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);

  const [user, setUser] = useState({});
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState(null);
  const [limit, setLimit] = useState(25);
  const [refresh, setRefresh] = useState(false);
  const userData = useSelector(state => state.UserData)

  function searchJobs(txt) {
    setSearch(txt);

    let text = txt.toLowerCase();
    if (text == "") {
      setFilteredJobs(businesses.slice(0, limit));
    } else {
      let jobs = businesses.filter((j) =>
        j?.address?.name.toLowerCase().includes(text)
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

  async function loadData(){
    try {
      setRefresh(true);
      const res = await getRequest(`/job-seeker/location/list?lng=-97.75640900&lat=30.26627100`,userData?.token)
      const json = await res.json()
      if(json?.data?.length > 0){
        let bizList = json.data.filter(
          (b) =>
            parseFloat(b.address.lat) != NaN &&
            parseFloat(b.address.lng) != NaN
        );

        bizList = bizList.map((b) => {
          b.distance_in_km = CommonUtils.distance(
            b.address.lat,
            b.address.lng,
            "K"
          );
          return b;
        });

        bizList = bizList.sort(
          (a, b) => a.distance_in_km - b.distance_in_km
        );
        setBusinesses(bizList);
        setFilteredJobs(bizList.slice(0, limit));
      } else {
        setMessage("No Job Available!");
        setBusinesses([]);
        setFilteredJobs([]);
      }
      setRefresh(false);
    } catch (error) {
      setRefresh(false);
      console.log('error while getting businesses')
    }
  }

  function loadMore() {
    setLimit(limit + 25);
    setFilteredJobs(businesses.slice(0, limit));
  }

  const list = filteredJobs.map((item) => {
    const distance = CommonUtils.distance(
      parseFloat(item?.address?.lat),
      parseFloat(item?.address?.lng),
      "K"
    );
    return (
      <TouchableOpacity
        key={item.id}
        onPress={() =>
          navigation.navigate("SeekerHomeAvailableJobs", {
            biz_id: item.id,
          })
        }
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
              source={{ uri: item?.brand?.photo?.thumb_url }}
              style={{
                width: 40,
                height: 40,
                backgroundColor: "#444",
                borderRadius: 40,
                borderWidth: 1,
                borderColor: "#888",
              }}
            />
          </View>
          <View style={{ width: "70%", backgroundColor: "#F4F5FA" }}>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 16,
                  color: "#111",
                  textAlignVertical: "center",
                  fontWeight: "500",
                }}
                numberOfLines={1}
              >
                {item?.name}
              </Text>
              <View style={{ flexDirection: "row", marginTop: 2.5,width:'75%' }}>
                <Text
                  style={{
                    fontSize: 12,
                    color: "#888",
                    fontWeight: "600",
                    textAlignVertical: "center",
                  }}
                >{item?.address?.address}</Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: "#888",
                    textAlignVertical: "center",
                  }}
                >{" • "}{distance} {strings.MILES_AWAY}</Text>
              </View>

             
            </View>
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
            flexDirection: "row",
            alignItems: "center",
            borderBottomWidth: 1,
            borderBottomColor: "#6652C2",
            paddingBottom: 10,
            backgroundColor: "#4E35AE",
            paddingTop: 20,
          }}
        >
          <View
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <Image
              source={require("../assets/heyHire_white.png")}
              style={{ width: wp('25%'), height: hp('4%'), resizeMode: 'contain' }}
            />
          </View>
          <View style={{ position: "absolute", left: 5 }}>
          <TouchableOpacity onPress={navigation.goBack}>
                <Image
                  source={require("../assets/ic_back_w.png")}
                  style={{ width: 28, height: 25, marginLeft: 10 }}
                />
              </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={{ backgroundColor: "#fff", marginBottom: 50 }}
          refreshControl={
            <RefreshControl
              refreshing={refresh}
              onRefresh={() => {
                loadData();
              }}
              tintColor={'#4E35AE'}
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
            {filteredJobs.length != businesses.length && (
              <View style={{ marginBottom: 20 }}>
                <TouchableOpacity
                  style={{
                    height: 40,
                    width: "100%",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  onPress={loadMore}
                >
                  <Text style={{ fontSize: 16 }}>Load More</Text>
                </TouchableOpacity>
              </View>
            )}

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

export default SeekerBusinessList;
