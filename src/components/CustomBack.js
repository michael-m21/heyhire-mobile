import React from "react";
import {
  StyleSheet,
  Image,
  TouchableOpacity
} from "react-native";
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';

const CustomBack = (props) => {
  const {
    navigation,
  } = props;
  return (
    <TouchableOpacity style={styles.container} onPress={() => navigation.goBack()}>
      <Image source={require('../../assets/ic_back.png')} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent:'center',
    alignItems: 'center',
    paddingLeft: wp('2%')
  },
});
export default CustomBack;
