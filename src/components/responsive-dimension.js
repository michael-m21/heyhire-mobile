import { Dimensions, Platform, PixelRatio, StatusBar } from "react-native";

let screenWidth = Dimensions.get('window').width;
let screenHeight = Dimensions.get('window').height;

const widthPercentageToDP = (widthPercent) => {
    const elemWidth =
    typeof widthPercent === 'number' ? widthPercent : parseFloat(widthPercent);

    return PixelRatio.roundToNearestPixel((screenWidth * elemWidth) / 100);
}

const heightPercentageToDP = (heightPercent) => {
    // Parse string percentage input and convert it to number.
    const elemHeight =
      typeof heightPercent === 'number'
        ? heightPercent
        : parseFloat(heightPercent);
  
    // Use PixelRatio.roundToNearestPixel method in order to round the layout
    // size (dp) to the nearest one that correspons to an integer number of pixels.
    return PixelRatio.roundToNearestPixel((screenHeight * elemHeight) / 100);
};

const listenOrientationChange = (that) => {
    Dimensions.addEventListener('change', (newDimensions) => {
      // Retrieve and save new dimensions
      screenWidth = newDimensions.window.width;
      screenHeight = newDimensions.window.height;
  
      // Trigger screen's rerender with a state update of the orientation variable
      that.setState({
        orientation: screenWidth < screenHeight ? 'portrait' : 'landscape',
      });
    });
};

const removeOrientationListener = () => {
    Dimensions.removeEventListener('change', () => {});
};
  
export {
    widthPercentageToDP,
    heightPercentageToDP,
    listenOrientationChange,
    removeOrientationListener,
};
//Asuming designs will be in dimensions 375 x 812 (for iPhonex) by default
export const hp = (height) => {
    return heightPercentageToDP((height / 812) * 100);
};

/**
 * correct calculation for resposive widths
 */
export const wp = (width) => {
    return widthPercentageToDP((width / 375) * 100);
};
export const paddingTopiOS =
    Platform.OS === 'ios' ? getStatusBarHeight(true) + 10 : 0;
export const deviceWidth = Dimensions.get('window').width;

export const deviceHeight = Dimensions.get('window').height;

//iPhoneX and StatusBar helpers
export function isIphoneX() {
    const dimen = Dimensions.get('window');
    return (
        Platform.OS === 'ios' &&
        !Platform.isPad &&
        !Platform.isTVOS &&
        (dimen.height === 812 ||
        dimen.width === 812 ||
        dimen.height === 896 ||
        dimen.width === 896)
    );
}

export function ifIphoneX(iphoneXStyle, regularStyle) { 
    if (isIphoneX()) {
        return iphoneXStyle;
    }
    return regularStyle;
}

export function getStatusBarHeight(safe) {
    return Platform.select({
        ios: ifIphoneX(safe ? 44 : 30, 20),
        android: StatusBar.currentHeight,
        default: 0,
    });
}

export function getBottomSpace() {
    return isIphoneX() ? 20 : 0;
}