import React, { useState } from 'react';
import { StyleSheet, View, Button } from 'react-native';
import { NativeRouter, Route } from "react-router-native";

import { ApplicationProvider, Layout, IconRegistry } from '@ui-kitten/components';
import { mapping, light as lightTheme } from '@eva-design/eva';
import { EvaIconsPack } from '@ui-kitten/eva-icons';

import Home from './pages/Home'
import Nav from './pages/Nav'
import SignUp from './pages/SignUp'
import Client from './pages/Client'
import Cart from './pages/Cart'
import ChangePwd from './pages/ChangePwd';

function App() {
	// STYLED
	
	// STATE
	const [tokenState, setTokenState] = useState('');
	

	// FUNCTIONS

	return (
		<NativeRouter>
			<IconRegistry icons={EvaIconsPack} />
			<ApplicationProvider mapping={mapping} theme={lightTheme}>
				<Layout>
					<View style={styles.navbar}>
						<Nav tokenState={tokenState}/>
					</View>
					<Layout style={styles.container}>
						<Route exact path="/" render={(props) => <Home {...props} setTokenState={setTokenState} />} />
						<Route exact path="/client" render={(props) => <Client {...props} setTokenState={setTokenState} />} />
						<Route exact path="/changepwd" render={(props) => <ChangePwd {...props} tokenState={tokenState} setTokenState={setTokenState} />} />
						<Route exact path="/signup" component={SignUp} />
						<Route exact path="/cart" render={(props) => <Cart {...props} setTokenState={setTokenState} />} />
					</Layout>
				</Layout>
			</ApplicationProvider>
		</NativeRouter>
	);
}

const styles = StyleSheet.create({
	container: {
		alignItems: 'center',
		justifyContent: 'center',
	},
	navbar: {
		marginTop: 30
	}
});

export default App
