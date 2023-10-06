import { CommonActions } from '@react-navigation/native';

let _navigator;

function setTopLevelNavigator(navigatorRef) {
  _navigator = navigatorRef;
}

function navigate(routeName, params) {
  

  _navigator.dispatch(
    CommonActions.navigate({
      name: routeName,
      params: params
    })
  );
}

function goto(routeName, params) {
  

  _navigator.navigate(routeName,
       params
    )
  
}


// add other navigation functions that you need and export them

export default {
  navigate,
  setTopLevelNavigator,
  goto
};
