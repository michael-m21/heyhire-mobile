import React, { Component } from "react";
import {
  View,
  Alert,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Animated,
  BackHandler,
  Image,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {strings} from '../translation/config';

export default function ConfirmationAlert({ visible,business, job,onClose,onSendCV }) {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={() => {
        // Alert.alert('Modal has been closed.');
        onClose()
      }}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View
          style={[
            {
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(0,0,0,0.4)",
            },
          ]}
        >
          <View
            style={{
              borderRadius: 5,
              width: "75%",
              marginHorizontal: "15%",
              alignItems: "center",
            }}
          >
            <View
              style={{
                borderRadius: 50,
                alignSelf: "center",
                position: "absolute",
                top: -40,
                zIndex: 999,
              }}
            >
              <Image
               source={{ uri: business?.brand && business?.brand?.photo ? business?.brand?.photo?.tiny_url : null }}
                style={{ height: 70, width: 70, borderRadius: 50 }}
              />
            </View>
            <LinearGradient
              style={{ width: "100%", borderRadius: 10 }}
              colors={["#4E35AE", "#775ED7"]}
            >
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 50,
                  marginHorizontal:20
                }}
              >
                <Text style={[{ textAlign: "center", color: "#fff", fontFamily: 'VisbyRegular' }]}>
                  {strings.YOU_ARE_ABOUT_TO} <Text style={{fontFamily: 'VisbyBold' ,color:'#fff'}}>{job?.title}</Text> {strings.POSTION_AT} <Text  style={{fontFamily: 'VisbyBold', color:'#fff'}}>{job?.location?.name}</Text>
                </Text>
              </View>
              <View style={{justifyContent: 'center', alignItems: 'center', marginTop: 20}}>
                <Text style={{textAlign: "center", color: "#fff", fontWeight: 'bold'}}>{strings.CONFIRM_DECISION}</Text>
              </View>
              <View style={{ marginVertical: 20, alignItems: "center",marginTop:30 }}>
                <TouchableOpacity
                  style={[
                    {
                      flexDirection: 'row',
                      width: "90%",
                      borderRadius: 30,
                      backgroundColor: "#fff",
                      borderWidth: 0.5,
                      paddingVertical: 10,
                      marginVertical: 5,
                      justifyContent: 'center',
                      alignItems: 'center'
                    },
                  ]}
                  onPress={() => {
                    onSendCV();
                    onClose();
                  }}
                >
                  <Text
                    style={[
                      {
                        textAlign: "center",
                        color: "#4E35AE",
                        fontSize: 16,
                        fontFamily: 'VisbyExtrabold'
                      },
                    ]}
                  >
                    {strings.SEND_APPLICATION}
                  </Text>
                  <Image
                    source={require("../../assets/ic_checked.png")}
                    style={{ width: 15, height: 15, resizeMode: 'contain', position: 'absolute', right: 10 }}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    {
                      width: "90%",
                      borderRadius: 30,
                      borderColor: "#fff",
                      borderWidth: 0.5,
                      paddingVertical: 10,
                      marginTop: 10,
                    },
                  ]}
                  onPress={onClose}
                >
                  <Text
                    style={{
                      textAlign: "center",
                      color: "#fff",
                      fontSize: 16,
                      fontFamily: 'VisbyRegular'
                    }}
                  >
                    {strings.CANCEL}
                  </Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  alertContainer: {
    backgroundColor: "#e1e4e8",
  },
  top: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
  },
  bottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  modal: {
    backgroundColor: "#e1e4e8",
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 10,
  },
  title: {
    fontSize: 20,
    color: "#000",
  },
  body: {
    fontSize: 14,
    color: "rgba(0,0,0,0.5)",
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: "#64969E",
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 5,
  },
  buttonText: {
    width: "100%",
    color: "#FFF",
  },
  btnTxt: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
  },
  btnSubscribe: {
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 10,
    justifyContent: "center",
  },
});
