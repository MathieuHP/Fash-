import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NativeRouter, Route } from "react-router-native";

import Home from './pages/Home'
import Nav from './pages/Nav'
import SignUp from './pages/SignUp'
import Client from './pages/Client'
import Cart from './pages/Cart'
import NotFound from './pages/NotFound'

function App() {
	return (
		<NativeRouter>
			<View style={styles.navbar}>
				<Nav />
			</View>
			<View style={styles.container}>
				<Route exact path="/" component={Home} />
				<Route exact path="/client" component={Client} />
				<Route exact path="/signup" component={SignUp} />
				<Route exact path="/cart" component={Cart} />
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
