import React from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import styled from 'styled-components';
import Client from './pages/Client'
import Company from './pages/Company'
import Home from './pages/Home'
import Nav from './pages/Nav'
import SignUp from './pages/SignUp'
import Cart from './pages/Cart'

function App() {
	// STYLED
	const AppDiv = styled.div`
	`;
	
	// STATE

	// FUNCTIONS

	return (
		<AppDiv>
			<Router>
				<div>
					<Nav />
				</div>
				<div>
					<Switch>
						<Route exact path="/" component={Home} />
						<Route exact path="/company" component={Company} />
						<Route exact path="/client" component={Client} />
						<Route exact path="/signup" component={SignUp} />
						<Route exact path="/cart" component={Cart} />
					</Switch>
				</div>
			</Router>
		</AppDiv>
	); 
}

export default App;
