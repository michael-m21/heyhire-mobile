import React, { useState } from 'react'
import {
  SafeAreaView,
  View,
  Text,
  Modal,
  Image,
  FlatList,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  TouchableHighlight,
  Dimensions
} from 'react-native';
import { LinearGradient } from "expo-linear-gradient";
import { countries } from './utils/consts.js'
import { postFormData } from './utils/network.js'
import { strings } from './translation/config';
import DeviceInfo from 'react-native-device-info';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { Alert } from 'react-native';

const isIphoneX = DeviceInfo.hasNotch();
const window = Dimensions.get("window");

function SeekerForgotPassword({ navigation }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [phCode, setPhCode] = useState('1')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')

  function _onPress(item) {
    setModalVisible(false)
    setPhCode(item.dial_code)
  }

  function deviceToken(length) {
    let chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
  }

  function formatPhoneAPI(str) {
    let cleaned = str.replace(/\D/g, '')
    let match = cleaned.match(/^(\d{3})(\d{3})(\d+)$/)
    if (match) {
      return '(' + match[1] + ') ' + match[2] + '-' + match[3]
    }
    return str;
  }

  function handleRequest() {
    let token = deviceToken(128)
    let form = new FormData()
    form.append('phone', phCode + ' ' + formatPhoneAPI(phone))
    form.append('user_type', '2')

    postFormData('user_forgot_password', form)
      .then(res => {
        return res.json()
      })
      .then(json => {
        // setUser(json.data)
        // setToken(token)
        console.log(json);
        if (json.status_code == 200) {
          Alert.alert("", json.msg);
          navigation.goBack();
        } else {
          Alert.alert("", json.msg);

        }
      })
      .catch(err => {
        console.log(err)
      })
  }

  return (
    <LinearGradient style={styles.container} colors={["#4E35AE", "#775ED7"]}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', height: window.height, position: 'absolute', top: 0, left: 0 }}>
          <Image
            style={{ width: '100%', height: '100%', borderBottomLeftRadius: 8, borderBottomRightRadius: 8, opacity: 1 }}
            source={require('../assets/home-bg-1.png')}
            resizeMode={'cover'}
          />

        </View>
        <KeyboardAwareScrollView extraScrollHeight={Platform.OS === "ios" ? 50 : 0} extraHeight={Platform.OS === "ios" ? 140 : null} >


          <View style={{ height: window.height - (isIphoneX ? 340 : 280), }}>


            <View
              style={{
                alignItems: "center",
                marginHorizontal: "5%",
                marginTop: '10%',
                marginVertical: 20,
              }}
            >
              <Image
                source={require("../assets/home-logo.png")}
                style={{
                  width: 130,
                  height: 130,
                  marginTop: 0,
                  opacity: 1,
                }}
                resizeMode={"stretch"}
              />
            </View>

            <View style={{ alignItems: 'center', justifyContent: 'center', marginVertical: 10 }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#fff', textAlign: 'center' }}>{strings.FORGOT_YOUR_PASSWORD}</Text>
            </View>

            <View style={{ alignItems: 'center', paddingTop: 30, paddingBottom: 30, marginHorizontal: 20 }}>
              {/* <Text style={{ fontSize: 20, color: '#fff' }}>{strings.ENTER_PHONE_NUMBER}</Text> */}
              <Text style={{ fontSize: 18, color: '#fff', textAlign: 'center' }}>{strings.PASSWORD_INFO_TEXT}</Text>
            </View>
          </View>
          <View
            style={{
              // alignItems: 'center',
              padding: 20
            }}>
            <Modal
              animationType="slide"
              transparent={false}
              visible={modalVisible}
              onRequestClose={() => {
                // Alert.alert('Modal has been closed.');
              }}>
              {/* <SafeAreaView> */}
              <View style={{ marginTop: 22 }}>
                <View>
                  <FlatList
                    // ItemSeparatorComponent={<Separator />}
                    data={countries}
                    keyExtractor={(item) => item.code}
                    renderItem={({ item, index, separators }) => (
                      <TouchableHighlight
                        key={index}
                        onPress={() => _onPress(item)}
                        onShowUnderlay={separators.highlight}
                        onHideUnderlay={separators.unhighlight}>
                        <View style={{ backgroundColor: 'white' }}>
                          <View style={{
                            flex: 1,
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            padding: 10,
                            borderBottomWidth: 1,
                            borderBottomColor: '#eee',

                          }}>
                            <Text style={{
                              fontSize: 20,
                              color: '#222'
                            }}>{item.name}</Text>
                            <Text style={{
                              fontSize: 20,
                              color: '#666'
                            }}>+{item.dial_code}</Text>
                          </View>
                        </View>
                      </TouchableHighlight>
                    )}
                  />
                </View>
              </View>
              {/* </SafeAreaView> */}
            </Modal>

            <Text style={{ color: '#fff', fontSize: 16, marginBottom: 5 }}>{strings.PHONE_NUMBER}</Text>
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity style={styles.code} onPress={() => setModalVisible(true)}>
                <Image source={require('../assets/ic_call-1.png')} style={{ width: 20, height: 20, marginRight: 5 }} />
                <Text style={{ color: '#fff' }}>+{phCode}</Text>
              </TouchableOpacity>

              <TextInput
                style={styles.code2}
                onChangeText={text => setPhone(text)}
                placeholder={strings.PHONE_NUMBER}
                value={formatPhoneAPI(phone)}
                textContentType="telephoneNumber"
                placeholderTextColor={'#fff'}
                            keyboardType={'phone-pad'}
              />
            </View>
          </View>

          {/* <View style={{ alignItems: 'center', padding: 20}}>
          <TouchableOpacity 
          style={{width:'100%', backgroundColor: '#4834A6', paddingTop: 15, paddingBottom: 15, borderRadius: 25,height:52}}
          onPress={() => handleRequest()}>
            <Text style={{textAlign: 'center', fontSize: 18, color: '#fff'}}>{strings.SEND}</Text>
          </TouchableOpacity>
        </View> */}

          <TouchableOpacity style={styles.button}
            onPress={() => handleRequest()}>

            <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{strings.SEND}</Text>
          </TouchableOpacity>

          <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 20 }}>
            <View style={{ borderBottomWidth: 0.5, borderBottomColor: '#fff' }}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#fff', textAlign: 'center' }} >{strings.GO_BACK}</Text>

              </TouchableOpacity>

            </View>
          </View>

        </KeyboardAwareScrollView>

      </SafeAreaView>
    </LinearGradient>
  )
}

export default SeekerForgotPassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // alignItems: 'center'
  },
  header: {
    flex: 1,
    alignItems: 'flex-start'
  },
  code: {
    flexDirection: 'row',
    borderRadius: 5,
    borderColor: '#fff',
    borderWidth: 1,
    // paddingTop: 10,
    // paddingLeft: 10,
    color: 'red',
    width: '25%',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center'
  },
  code2: {
    flexDirection: 'row',
    borderRadius: 5,
    borderColor: '#fff',
    borderWidth: 1,
    padding: 10,
    color: '#fff',
    width: '70%',
    height: 50,
    marginLeft: '5%',
  },
  code3: {
    flexDirection: 'row',
    borderRadius: 5,
    borderColor: '#fff',
    borderWidth: 1,
    padding: 10,
    color: '#fff',
    width: '100%',
    height: 40,
    // marginBottom: 20
  },
  button: {
    //flex: 1,
    // flexDirection: 'column',
    // height:70,
    alignItems: 'center',
    alignContent: 'center',
    padding: 10,
    paddingVertical: 15,
    backgroundColor: '#F1F2F9',
    marginBottom: 10,
    borderRadius: 10,
    marginHorizontal: 20
  }
});