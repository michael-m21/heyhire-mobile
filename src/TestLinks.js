import React from 'react'
import {View, Text, TouchableOpacity, SafeAreaView, FlatList} from 'react-native'

function TestLinks({navigation}){
  let links = [
    {id: 1, name: "Seeker"},
    // {id: 2, name: "SeekerHome"},
    {id: 3, name: "SeekerEditProfile"},
    // {id: 4, name: "SeekerScanQrCode"},
    {id: 5, name: "SeekerAppliedJobs"},
    {id: 6, name: "SeekerArchivedJobs"},
    {id: 7, name: "SeekerJobDetail"},
    // {id: 8, name: "SeekerNotifications"},
    {id: 9, name: "SeekerAddLang"},
    {id: 10, name: "SeekerAddPastPosition"},
    {id: 11, name: "Business"},
    // {id: 12, name: "BusinessHome"},
    {id: 13, name: "BusinessEditAccount"},
    // {id: 14, name: "BusinessNotifications"},
    // {id: 15, name: "BusinessPostNewJob"},
    {id: 16, name: "BusinessPrinterOptions"},
    // {id: 17, name: "BusinessQrCodeScan"},
    // {id: 18, name: "BusinessReListJob"},
    {id: 19, name: "BusinessSeekerProfile"},
    {id: 20, name: "BusinessVisitorDetail"},
    {id: 21, name: "HomeScreen"},
    {id: 22, name: "SeekerLogin"},
    {id: 23, name: "BusinessLogin"},
    {id: 24, name: "SeekerSignup"},
    {id: 25, name: "BusinessSignup"},
    {id: 26, name: "SeekerForgotPassword"},
    {id: 28, name: "BusinessForgotPassword"},
    {id: 29, name: "SeekerUserWizard"},
    {id: 27, name: "TestLinks"},
  ]
  return(
    <SafeAreaView>
    <FlatList
      data={links}
      renderItem={({item, index}) => 
        <TouchableOpacity 
          style={{padding: 15, borderBottomColor: '#999', borderBottomWidth: 1}}
          onPress={() => navigation.navigate(item.name)}
          keyExtractor={(item, index) => item.id} >
            <Text style={{}}>{item.name}</Text>
        </TouchableOpacity>
      }
    />
    {/* <TouchableOpacity 
      style={{padding: 15, borderBottomColor: '#999', borderBottomWidth: 1}}
      onPress={() => navigation.navigate('Business', {screen: 'ClosedJobs'})}
      keyExtractor={(item, index) => item.id} >
        <Text style={{}}>ClosedJobs</Text>
    </TouchableOpacity>

    <TouchableOpacity 
      style={{padding: 15, borderBottomColor: '#999', borderBottomWidth: 1}}
      onPress={() => navigation.navigate('Business', {
        screen: 'ClosedJobs',
        params: {
          screen: 'BusinessPostNewJob'
        }
      })}
      keyExtractor={(item, index) => item.id} >
        <Text style={{}}>BusinessPostNewJob</Text>
    </TouchableOpacity> */}

    </SafeAreaView>
  )
}

export default TestLinks;