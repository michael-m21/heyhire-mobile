import React from 'react'

import { WebView } from 'react-native-webview';

function ForgotPassword({ route, navigation }) {

  return(
    <WebView source={{ uri: route.params.url}} style={{ }} />
  )
}

export default ForgotPassword;