import React from "react";
import {
  Text,
  View,
  StyleSheet,
  Image,
} from "react-native";
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';

const CustomHeader = (props) => {
  const {
    title,
  } = props;
  return (
    <View style={styles.container}>
      <Image style={styles.logo} source={require('../../assets/headerImage.png')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: wp('100%'),
    justifyContent:'center',
    alignItems: 'center',
  },
  logo: {
    width: wp('20%'),
    height: hp('3.5%'),
    resizeMode: 'contain'
  },
});
export default CustomHeader;
