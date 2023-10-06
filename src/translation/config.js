import LocalizedStrings from 'react-native-localization';
import enUS from './en.json';
import es from './sp.json';
import he from './he.json';
import * as RNLocalize from "react-native-localize";

import {
    
    Platform,
   
  } from "react-native";
  



export const strings = checkLanuage();

function checkLanuage () {
    if(Platform.OS=="android"){
        const languages = RNLocalize.getLocales();
        console.log('Get local',languages);
        if(languages[0].languageCode=='he'){
            return new LocalizedStrings({
                "en-US": he,
                'en': he,
                'es': he,
                 'he': he
            });
        }else if(languages[0].languageCode=='es'){
            return new LocalizedStrings({
                "en-US": es,
                'en': es,
                'es': es,
                 'he': es
            });
        }else{
            return new LocalizedStrings({
                "en-US": enUS,
                'en': enUS,
                'es': enUS,
                 'he': enUS
            });        }
    }else{
        return new LocalizedStrings({
            "en-US": enUS,
            'en': enUS,
            'es': es,
             'he': he
        });
    }
}