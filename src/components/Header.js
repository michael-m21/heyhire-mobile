import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  Image,
  Dimensions,
  ImageBackground,
  TouchableNativeFeedback,
} from "react-native";

const { width, height } = Dimensions.get("window");


const Header = (props) => {
  const {
    navigation,
    title,
    
    showIconBack,
  
    onBackIcon,
    leftItem,
    theme,
    onClickLeftItem,
    rightItem,
    onClickRightItem
  } = props;
  const backImage = theme?require(`../../assets/ic_back2.png`):require(`../../assets/ic_back_w.png`);
  return (
    <View style={[styles.container,(theme && theme=='white') && styles.whiteBg]}>
     
      {showIconBack && (
        <TouchableOpacity
          style={{position:'absolute',left:10,alignItems:'center',justifyContent:'center',top:30}}
          onPress={onBackIcon ? onBackIcon : () => navigation.goBack(null)}
        >
           <Image
                  source={(backImage)}
                  style={{
                    width: 28,
                    height: 20                 
                  }}
                />
        </TouchableOpacity>
      )}

      {
        leftItem && 
        <TouchableOpacity
          style={{position:'absolute',left:5,alignItems:'center',justifyContent:'center'}}
          onPress={onClickLeftItem}
        >{leftItem()}          
        </TouchableOpacity>
      }
     
      {title ? (
        <Text style={[(theme && theme=='white')? styles.whiteHeaderTitle: styles.headerTitle]}> {title ? title : "apployMe"} </Text>
      ) : (
        <View style={[styles.headerTitle,{top:-10}]}>
           <Image
                source={require("../../assets/title_header.png")}
                style={{ width: 120, height: 25 }}
              />
        </View>
      )}

{
        rightItem && 
        <TouchableOpacity
          style={{position:'absolute',right:5,alignItems:'center',justifyContent:'center'}}
          onPress={onClickRightItem}
        >{rightItem()}          
        </TouchableOpacity>
      }

          </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: Platform.OS === "ios" ? 60 : 59,
    paddingTop:  Platform.OS === "ios" ? 20:0,
    // backgroundColor: StyleGuide.gradientBG[0],
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    maxHeight: 60,
    backgroundColor: "#4E35AE",
    borderBottomColor: "#715FCB",
    borderBottomWidth: 1,
    
    // elevation: 5,
  },
  whiteBg:{
    backgroundColor:'#fff',
    borderBottomColor: "#fff",
  },
  info: {
    fontSize: 20,
    fontWeight: "bold",
    color: '#fff',
    position: "absolute",
    zIndex: 1,
    top: -10,
    right: -5,
  },
  headerTitle: {
    color:'#fff',
    fontSize: 20,
    fontWeight: "800",
    flex: 1,
    marginHorizontal: 20,
    textAlign: "center",
    alignItems:'center'
  },
  whiteHeaderTitle: {
    color: '#4E35AE',
    fontSize: 20,
    fontWeight: "800",
    flex: 1,
    marginHorizontal: 20,
    textAlign: "center",
    alignItems:'center'
  },
  save: {
    color: '#fff',
    fontWeight: "400",
    marginHorizontal: 10,
  },
  background: {
    position: "absolute",
    height: Platform.OS === "ios" ? 60 : 60,
    width: width,
  },
  gradientContainer: {
    flex: 1,
    backgroundColor: "#2980b9",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
});
export default Header;
