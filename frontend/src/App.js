import React from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import styled from 'styled-components';
import Client from './pages/Client'
import Company from './pages/Company'
import Home from './pages/Home'
import Nav from './pages/Nav'

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
						<Route path="/company" component={Company} />
						<Route path="/client" component={Client} />
					</Switch>
				</div>
			</Router>
		</AppDiv>
	); 
}

export default App;