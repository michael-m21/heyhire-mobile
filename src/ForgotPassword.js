import React from 'react'
// import {
//   SafeAreaView, 
//   View, 
//   Text,
//   Image,
//   TouchableOpacity,
// } from 'react-native'
import { WebView } from 'react-native-webview';

function ForgotPassword({ route, navigation }) {

  return(
    <WebView source={{ uri: route.params.url}} style={{ }} />
  )
}

export default ForgotPassword;