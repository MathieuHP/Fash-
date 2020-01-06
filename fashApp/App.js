import React, { useState } from 'react';
import { StyleSheet, View, Button } from 'react-native';
import { NativeRouter, Route } from "react-router-native";

import Home from './pages/Home'
import Nav from './pages/Nav'
import SignUp from './pages/SignUp'
import Client from './pages/Client'
import Cart from './pages/Cart'
import NotFound from './pages/NotFound'

function App() {
	// STYLED
	
	// STATE
	const [tokenState, setTokenState] = useState('');

	// FUNCTIONS

	const testBack = () => {
        const options = {
            method: 'GET',
        };
        fetch(`http://127.0.0.1:5000/`, options)
        .then((response) => {
            response.text().then(function (text) {
                console.log(text)
            });
        })
	}

	return (
		<NativeRouter>
			<Button onPress={testBack} title="Testing backend" />
			<View style={styles.navbar}>
				<Nav tokenState={tokenState}/>
			</View>
			<View style={styles.container}>
				<Route exact path="/" render={(props) => <Home {...props} setTokenState={setTokenState} />} />
				<Route exact path="/client" render={(props) => <Client {...props} setTokenState={setTokenState} />} />
				<Route exact path="/signup" component={SignUp} />
				<Route exact path="/cart" render={(props) => <Cart {...props} setTokenState={setTokenState} />} />
				{/* <Route component={NotFound}/> */}
			</View>
		</NativeRouter>
	);
}

const styles = StyleSheet.create({
	container: {
		// flex: 2,
		// backgroundColor: '#fff',
		// alignItems: 'center',
		// justifyContent: 'center',
	},
	navbar: {
		marginTop: 100
	},
});

export default App
