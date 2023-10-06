import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        //  flex: 1,
        flexDirection: 'column',
        paddingHorizontal: 20,
        backgroundColor: 'white'
    },
    inputField: {
        height: Platform.OS == "ios" ? 40 : 50,
        padding: 10,
        width: '100%',
        backgroundColor: '#fff',
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        alignContent: 'center',
        borderColor: "#eee",
        borderWidth: 1,
        marginBottom: 15,
        borderRadius: 8,
        shadowColor: "#bbb",
        shadowOffset: {
        width: 0,
        height: 3,
        },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
        elevation: 4,
        alignItems: 'center',
        paddingVertical: 5
    
    },
    code: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        borderRadius: 8,
        borderColor: "#eee",
        borderWidth: 1,
        paddingTop: 10,
        paddingLeft: 10,
        // color: '#fff',
        width: '25%',
        height: Platform.OS == "ios" ? 40 : 50,
        marginBottom: 10,
        shadowColor: "#bbb",
        shadowOffset: {
        width: 0,
        height: 3,
        },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
        elevation: 4,
    
    },
    code2: {
        color: '#000',
        backgroundColor: '#fff',
        flexDirection: 'row',
        borderRadius: 8,
        borderColor: "#eee",
        borderWidth: 1,
        padding: 10,
        // color: '#fff',123
        width: '69%',
        // height: 40,
        marginLeft: '5%',
        marginBottom: 10,
        shadowColor: "#bbb",
        shadowOffset: {
        width: 0,
        height: 3,
        },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
        elevation: 4,
    } 
});