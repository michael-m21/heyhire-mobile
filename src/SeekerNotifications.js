import React, {useState, useEffect} from 'react'
import {
  SafeAreaView, 
  View, 
  Text,
  Image,
  RefreshControl,
  FlatList,
  Alert,
  ScrollView
} from 'react-native'
import moment from "moment";

import { getRequest } from './utils/network.js';
import {getUser} from './utils/utils.js';
import { useIsFocused } from "@react-navigation/native";
import {strings} from './translation/config';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';

function SeekerNotifications({navigation}){
  const isFocused = useIsFocused();

  const [user, setUser] = useState({})

  const [notifications,setNotification] = useState([]);
  const [refresh,setRefresh] = useState(false);

  useEffect(() => {
    if (isFocused){
      loadData()
    }
  }, [isFocused]);

  function loadData(){
    setRefresh(true);
    getUser().then(u => {
      let u2 = JSON.parse(u)
      // console.log(u2)
      setUser(u2)
      getRequest('/job-seeker/notification', u2.token)
      .then(res => {
        return res.json()
      })
      .then(json => {
        if(json.data){
          sortNotification(json.data);
        }else{
          Alert.alert("",json.msg || json)
        }
        setRefresh(false);
      })
      .catch(err => {
        setRefresh(false);
        console.log(err);
      })
    })
  }

  function sortNotification(data) {
    let tempNotifications = data.sort((a, b) => {
      let dateA = new Date(a?.created_at);
      let dateB = new Date(b?.created_at);
      return dateB - dateA;
    });
    setNotification(tempNotifications);  
  }

  function renderItem(item){
    return (
      <View  style={{
        backgroundColor: '#F4F5FA',
        borderColor: '#eee',
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
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal:20
      }}>
        <View style={{flex:1}}>
          <Image
            source={{uri: item.item.photo ? item.item.photo.tiny_url : null}}
            style={{width: wp('10%'), height:wp('10%'), borderRadius: wp('5%'), marginRight:10, backgroundColor: '#999'}}
          />
        </View>
        <View style={{flex:8,marginHorizontal:wp('5%')}}>
          <Text style={{fontFamily:'VisbyBold',fontSize:16, paddingBottom: hp('1%')}}>{item.item.title}</Text>
          <Text style={{marginRight:10, fontFamily: 'VisbyLight', color: '#444'}}>{item.item.message}</Text>
          <Text style={{ fontSize: 12, textAlign: 'right' ,fontWeight:'bold'}}>{moment.utc(item.item.created_date).format('YYYY/MM/DD hh:mm')}</Text>
        </View>
      </View>
    )
  }

  return(
    <SafeAreaView style={{backgroundColor:'#fff'}}>
      <View
        style={{
          alignItems: "center",
          justifyContent: 'center',
          alignContent: 'center',
          backgroundColor: '#fff',
        }}
      >
        <Image
          resizeMode="contain"
          source={require("../assets/headerImage.png")}
          style={{ width: 100, alignSelf: "center", }}
        />
        <Text
          style={{
            color: "#4834A6",
            fontSize: 18,
            fontWeight: "600",
            textAlign: "center",
            position: "absolute",
            top: "75%",
            left: "35%",
            textTransform: 'uppercase'
          }}
        >
          {strings.NOTIFICATIONS}
        </Text>
      </View>
      <View
        style={{
          paddingHorizontal: wp('5%'),
          paddingTop: hp('5%'),
          justifyContent: 'center',
          backgroundColor: '#fff'
        }}
      >
        <Text
          style={{
            fontFamily: 'VisbyExtrabold',
            color: '#666'
          }}
        >
          {strings.NOTIFICATIONS + " " + notifications.length}
        </Text>
      </View>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refresh} onRefresh={()=>{loadData()}} />
        }
      >
        <FlatList
          style={{backgroundColor:'#fff', marginBottom: hp('16%'), marginTop: hp('2%')}}
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={(item)=>renderItem(item)}
        />
      </ScrollView>
    </SafeAreaView>
  )
}

export default SeekerNotifications;