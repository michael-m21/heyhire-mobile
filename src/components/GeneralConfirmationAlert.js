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

export default function GeneralConfirmationAlert({ visible, icon,text, buttons,onClose,onPress, }) {
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
              width: "90%",
              marginHorizontal: "5%",
              alignItems: "center",
            }}
          >
            <View
              style={{
                borderRadius: 50,
                alignSelf: "center",
                position: "absolute",
                top: -25,
                zIndex: 999,
                backgroundColor:'#666',
                width:50,
                height:50,
                alignItems:'center',
                justifyContent:'center'
              }}
            >
              <Image
               source={icon}
                style={{ height: 25, width: 25, borderRadius: 50 }}
              />
            </View>
            <View
              style={{ width: "100%", borderRadius: 10,backgroundColor:'white' }}
             
            >
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 40,
                  marginHorizontal:20
                }}
              >
                <Text style={[{ textAlign: "center", }]}>{text}</Text>
                </View>
              <View style={{ marginVertical: 20, alignItems: "center" }}>
                <TouchableOpacity
                  style={[
                    {
                      width: "90%",
                      borderRadius: 30,
                      backgroundColor: "#666",
                      paddingVertical: 10,
                      marginVertical: 5,
                    },
                  ]}
                  onPress={() => {
                    onClose();
                  }}
                >
                  <Text
                    style={[
                      {
                          color:'#fff',
                        textAlign: "center",
                        fontSize: 16,
                        fontWeight: "bold",
                      },
                    ]}
                  >
                    {buttons[1]}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    {
                      width: "90%",
                      borderRadius: 30,
                      paddingVertical: 10,
                      marginTop: 10,
                      backgroundColor:'#666'
                    },
                  ]}
                  onPress={onPress}
                >
                  <Text
                    style={[
                      { textAlign: "center",  fontSize: 16,color:'#fff' },
                    ]}
                  >
                    {buttons[0]}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
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
