import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Client from './pages/Client'
import Home from './pages/Home'
import Nav from './pages/Nav'
import SignUp from './pages/SignUp'
import Cart from './pages/Cart'
import Business from './pages/Business'
import Company from './pages/business/Company'
import SignUpBusiness from './pages/business/SignUpBusiness'
import ImagesUploaded from "./pages/business/ImagesUploaded"
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
		<Router>
			<div>
			<button onClick={testBack}>Testing backend</button>
				<div>
					<Nav tokenState={tokenState} />
				</div>
				<div>
					<Switch>
						<Route exact path="/" render={(props) => <Home {...props} setTokenState={setTokenState} />} />
						<Route exact path="/client" component={Client} />
						<Route exact path="/signup" component={SignUp} />
						<Route exact path="/cart" component={Cart} />
						<Route exact path="/business" render={(props) => <Business {...props} setTokenState={setTokenState} />} />
						<Route exact path="/business/company" component={Company} />
						<Route exact path="/business/signupbusiness" component={SignUpBusiness} />
						<Route exact path="/business/products" component={ImagesUploaded} />
						<Route path="*" component={NotFound}/>
					</Switch>
				</div>
			</div>
		</Router>
	); 
}

export default App;
