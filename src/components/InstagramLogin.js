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
    Dimensions
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { strings } from '../translation/config';
import { Feather } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';


export default function InstagramLoginPopup({ visible, userId, onClose,isConnected }) {
    const id = userId * 33469;
    let url = 'https://app.apployme.com/instagram/auth/' + id;
    if(isConnected){
        url = 'https://app.apployme.com/instagram/disconnect/' +id;
    }
    console.log('url',url);
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={() => {
                // Alert.alert('Modal has been closed.');
                onClose();
            }}
        >
            <View style={[styles.mainView]}>
                <Feather name={'x'} size={25} style={{ alignSelf: 'flex-end', right: 30, marginVertical: 20 }} color={'#000'} onPress={() => { onClose() }} />

                <WebView source={{ uri: url }} style={styles.WebViewStyle} />
            </View>
        </Modal>)
}


const styles = StyleSheet.create({
    mainView: {
        width: '100%',
        height: '100%',
        backgroundColor: '#fff',
        marginTop: (Platform.OS) === 'ios' ? 20 : 0,
    },
    WebViewStyle:
    {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        // marginTop: (Platform.OS) === 'ios' ? 20 : 0,
        height: Dimensions.get('window').height ,
        width: "100%",
        backgroundColor: '#fff',
    }
});
