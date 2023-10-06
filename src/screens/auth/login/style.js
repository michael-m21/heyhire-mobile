import { StyleSheet } from "react-native";
import { deviceHeight } from "../../../components/responsive-dimension";
import colors from "../../../styles/colors";

export const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flex: 1,
      alignItems: "flex-start",
    },
    imageBackground: {
        width: '100%', 
        height: deviceHeight, 
        borderBottomLeftRadius: 8, 
        borderBottomRightRadius: 8, 
        opacity: 1
    }, 
    code: {
      flexDirection: "row",
      borderRadius: 5,
      borderColor: colors.white,
      borderWidth: 1,      
      color: colors.white,
      width: "20%",
      alignItems: 'center',
      justifyContent: 'center'
    },
    code2: {
      flexDirection: "row",
      borderRadius: 5,
      borderColor: colors.white,
      borderWidth: 1,
      padding: 10,
      color: colors.white,
      width: "72%",
      height: 50,
      marginLeft: "5%",
    },
    code3: {
      flexDirection: "row",
      borderRadius: 5,
      borderColor: colors.white,
      borderWidth: 1,
      color: colors.white,
      width: "100%",
      height: 50,
      paddingTop: 10,
      paddingRight: 10,
      paddingBottom: 10,
      paddingLeft: 30,
      justifyContent: 'center'
    },
    button: {
      width: '100%',
      // flexDirection: 'column',
      // height:70,
      alignItems: 'center',
      alignContent: 'center',
      padding: 10,
      paddingVertical: 15,
      backgroundColor: '#F1F2F9',
      marginBottom: 10,
      borderRadius: 10,
    },
    labelText: {
        color: colors.white, 
        fontSize: 16, 
        marginBottom: 5 
    }
  });
  