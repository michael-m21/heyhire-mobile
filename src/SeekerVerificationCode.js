import React, {useState, useEffect} from 'react'
import {
  View, 
  Text, 
  TextInput, 
  Image,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native'
import {postFormData} from './utils/network.js'
import {strings} from './translation/config';


function SeekerVerificationCode({ route, navigation }){
  const [error, setError] = useState('')
  const [msg, setMsg]   = useState('')
  const [code, setCode]   = useState('')
  const [otp, setOtp]   = useState(route.params.otp)
  const [num, setNum]   = useState(route.params.number)
  const [email, setEmail]   = useState(route.params.email)
  const [userId, setUserId]   = useState(route.params.userId)

  
  function handleResend(){
    let form = new FormData()
    form.append('user_type', '2')
    form.append('phone', num)
    form.append('email', email)
    
    postFormData('send_verification_code', form)
    .then(res => {
      return res.json()
    })
    .then(json => {
      // console.log(json)
      if(json.status_code == '300'){
        setError(json.msg)
      }else{
        console.log(json)
        setOtp(json.otp)
        setMsg("Verification code has been sent.")
      }
    })
    .catch(err => {
      console.log(err)
    })
  }

  function handleVerificationCode(){
    setMsg('')
    setError('')
    if(code === otp){
      // navigation.navigate('Seeker')
      // navigation.navigate('SeekerLinks', { screen: 'SeekerFinishRegistration'})
      let form = new FormData()
      form.append('user_id', userId);  
      
      postFormData('user_verified_code', form)
      .then(res => {
        return res.json()
      })
      .then(json => {
        console.log(json);
        if(json.status_code==200){
        navigation.navigate('SeekerFinishRegistration');
        }
      })
      .catch(err => {
        console.log(err)
      })

     
    }else{
      setError('Incorrect verification code')
    }
  }

  return(
    <View style={styles.container}>
      <SafeAreaView style={{flex: 1}}>
        <View style={{
        flexDirection: 'row', 
        alignItems: 'center',
        paddingBottom: 20,
        paddingTop: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        
        }}>
         
          <View style={{flex:1,alignItems:'center'}}>
            <Text style={{ color: '#4834A6', fontSize: 18}}>{strings.VERIFICATION}</Text>
          </View>
          <View style={{position:'absolute', right: 5}}>
            <TouchableOpacity onPress={() => handleResend()}>
              <Text style={{ color: '#4834A6'}}>{strings.RESEND}</Text>
            </TouchableOpacity>
          </View>
          <View style={{position:'absolute', left: 5}}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Image source={require('../assets/ic_back.png')} style={{width: 28, height: 22}} />
            </TouchableOpacity>
          </View>
        </View>
      
      <View style={{flex: 1}}>
        <View style={{marginTop: 20, marginBottom: 20, alignItems: 'center'}}>
          <Text style={{fontSize: 18,textAlign:'center'}}>{strings.WE_ARE_SENDING}</Text>
          <Text style={{fontSize: 18,textAlign:'center'}}>{strings.THIS_MAY_BE_TAKE_UP}</Text>
          <Text style={{fontSize: 18,textAlign:'center'}}>{strings.MSG_DATA}</Text>
        </View>

        <View style={{margin: 30}}>
          <TextInput
            style={styles.code2}
            onChangeText={text => setCode(text)}
            placeholder={strings.VERIFICATION_CODE}
            value={code}
            keyboardType="numeric"
          />
        </View>

        <View style={{marginTop: 20}}>

          {error ? (
            <View style={{alignSelf: 'center', padding: 20}}>
              <Text style={{color: 'red'}}>{error}</Text>
            </View>
            
          ) : null}

          {msg ? (
            <View style={{alignSelf: 'center', padding: 20}}>
              <Text style={{color: 'green'}}>{msg}</Text>
            </View>
            
          ) : null}
          
          <TouchableOpacity 
          style={{
            alignContent: 'center',
            backgroundColor: '#5B42BB',
            padding: 15,
            borderRadius: 30,
            width: '70%',
            alignSelf: 'center'
          }}
          onPress={() => handleVerificationCode()}>
            <Text style={{color: '#fff', textAlign: 'center', fontSize: 18}}>{strings.SUBMIT}</Text>
          </TouchableOpacity>
        </View>
      </View>
      
    </SafeAreaView>
    </View>
  )
}

export default SeekerVerificationCode;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    padding: 20,
    backgroundColor: 'white',
  },
  inputField: {
    // height: 40,
    padding: 15,
    width: '70%',
    backgroundColor: '#fff',
    flex: 1,
    color: '#333',
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    borderColor: '#fff',
    borderWidth: 1,
    marginBottom: 15,
    borderRadius: 8,
    shadowColor: '#ccc',
    shadowRadius: 4,
    shadowOpacity: 0.75,
    shadowOffset: {
      width: 0,
      height: 0
    },
    alignSelf: 'center',
  },
  code: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    borderRadius: 8,
    borderColor: '#fff',
    borderWidth: 1,
    paddingTop: 10,
    paddingLeft: 10,
    // color: '#fff',
    width: '25%',
    height: 40,
    marginBottom: 10,
    shadowColor: '#ccc',
    shadowRadius: 4,
    shadowOpacity: 0.75,
    shadowOffset: {
      width: 0,
      height: 0
    },
  },
  code2: {
    color: '#000',
    backgroundColor: '#fff',
    flexDirection: 'row',
    borderRadius: 8,
    borderColor: '#fff',
    borderWidth: 1,
    padding: 15,
    alignSelf: 'center',
    textAlign:'center',
    width: '80%',
    height: 60,
    fontSize: 18,
    // marginLeft: '5%',
    // marginBottom: 10,
    shadowColor: '#ccc',
    shadowRadius: 4,
    shadowOpacity: 0.75,
    shadowOffset: {
      width: 0,
      height: 0
    },
  },
});
