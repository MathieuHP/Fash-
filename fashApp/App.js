import React  from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';

import Home from './pages/Home'
import Nav from './pages/Nav'
import SignUp from './pages/SignUp'

function App() {
  return (
    <View style={styles.container}>
      {/* <Scene key="root">
         <Scene key = "home" component = {Home} title = "Home" initial = {true}/>
         <Scene key = "nav" component = {Nav} title = "Nav" />
         <Scene key = "signUp" component = {SignUp} title = "Sign Up" />
      </Scene> */}
      <Text>App page</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 2,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default App
