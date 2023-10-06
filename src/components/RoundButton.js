import React from "react";
import {
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';

const RoundButton = (props) => {
  const {
    text,
    backgroundColor,
    textColor,
    onPress,
  } = props;
  return (
    <TouchableOpacity onPress={onPress} style={[styles.container, { backgroundColor: backgroundColor }]}>
      <Text style={[styles.text, {color: textColor}]}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: hp('6%'),
    width:wp('80%'),
    borderRadius: wp('20%'),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp('3%')
  },
  text: {
    fontSize: hp('2.4%'),
    fontFamily: 'VisbyExtrabold',
  }
});
export default RoundButton;
