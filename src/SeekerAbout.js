import React from "react";
import {
  Text,
  View,
  StyleSheet,
  Linking
} from "react-native";
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import DeviceInfo from 'react-native-device-info';

function SeekerAbout({ navigation }) {

  return (
    <View style={styles.container}>
      <Text style={styles.headingText}>
        App Version :
        <Text style={{fontSize: hp('1.9%'), fontFamily: 'VisbyBold', color: '#4E35AE'}}> {DeviceInfo.getVersion()}</Text>
      </Text>
      <Text style={styles.headingText}>Website url :
        <Text
          style={styles.linkText}
          onPress={() => Linking.openURL('https://app.apployme.com')}
        >
          {" https://app.apployme.com"}
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: hp('3%'),
    backgroundColor: '#FFFFFF'
  },
  headingText: {
    fontSize: hp('2%'),
    fontFamily: 'VisbyBold',
    color: '#3D3B4E',
    marginVertical: hp('1%')
  },
  linkText: {
    color: 'blue',
    fontSize: hp('1.8%'),
    fontFamily: 'VisbySemiboldItalic'
  }
});

export default SeekerAbout;
