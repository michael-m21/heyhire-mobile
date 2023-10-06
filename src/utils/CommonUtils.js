import messaging from "@react-native-firebase/messaging";
import { Platform } from "react-native";
import { postFormData } from "./network";
import { getUser, removeUser } from "./utils.js";

class CommonUtil {
  constructor() {
    // this.deviceTokenSet();
  }

  deviceToken;
  lat = 32.7767;//30.26627100;
  long = -96.797;//-97.75640900;

  deviceTokenSet = async () => {
    if (Platform.OS === "ios") {
      const register = await messaging().registerDeviceForRemoteMessages();
    }
    const token = await messaging().getToken(undefined, "*");
    this.deviceToken = token;
    console.log('deviceTokenSet -> deviceToken', this.deviceToken);
  };
  
  getDeviceToken = async () => {
    const token = await messaging().getToken();
    return token;
  };

  setLocation(lat, long) {
    this.lat = lat;//30.26627100;
    this.long = long;//-97.75640900;
  }

  distance(lat2, lon2, unit) {
    var R = 3958.8; // Radius of the Earth in miles

    const lat1 = this.lat;
    const lon1 = this.long;
    if (lat1 == lat2 && lon1 == lon2) {
      return 0;
    } else {
      var rlat1 = lat1 * (Math.PI / 180); // Convert degrees to radians
      var rlat2 = lat2 * (Math.PI / 180); // Convert degrees to radians
      var difflat = rlat2 - rlat1; // Radian difference (latitudes)
      var difflon = (lon2 - lon1) * (Math.PI / 180); // Radian difference (longitudes)

      var d =
        2 *
        R *
        Math.asin(
          Math.sqrt(
            Math.sin(difflat / 2) * Math.sin(difflat / 2) +
              Math.cos(rlat1) *
                Math.cos(rlat2) *
                Math.sin(difflon / 2) *
                Math.sin(difflon / 2)
          )
        );
      return d.toFixed(1);
    }
  }

  updateUserLocation(latitude,longitude){
      console.log(latitude,longitude,this.lat,this.long)
    getUser().then((u) => {
      let u2 = JSON.parse(u);


    let form = new FormData();
    
    form.append("user_token", u2.token);
    form.append("user_id", u2.profile.id);
    form.append("latitude",latitude);
    form.append("longitude",longitude);
    console.log(form,this.long,this.lat)
    postFormData("update_user_location", form)
    .then((res) => {
      return res.json();
    })
    .then((json) => {
      console.log('Update user location',json)
    })
    .catch((err) => {
      console.log('Update user location Error', JSON.stringify(err));
    });
  });
  }
}
export default new CommonUtil();
