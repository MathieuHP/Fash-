import React, { useEffect, useState } from 'react';
import { Link, useHistory } from "react-router-dom";
import styled from 'styled-components';
import jwt_decode from 'jwt-decode'

function NavClient(props) {
    return (
        <div>
            <h3>Normal NAV</h3>
            <ul>
                <li>
                    <Link to="/client">
                        Client
                    </Link>
                </li>
                <li>
                    <Link to="/cart">
                        Cart
                    </Link>
                </li>
                <li>
                    <button onClick={() => props.logOut(props.navUserType)}>Click to disconnect</button>
                </li>
            </ul>
        </div>
    );
}

function NavBusiness(props) {
    return (
        <div>
            <h3>Business NAV</h3>
            <ul>
                <li>
                    <Link to="/business/company">
                        Company
                    </Link>
                </li>
                <li>
                    <Link to="/business/products">
                        Products
                    </Link>
                </li>
                <li>
                    <button onClick={() => props.logOut(props.navUserType)}>Click to disconnect</button>
                </li>
            </ul>
        </div>
    )
}

function NavLog() {
    return (
        <div>
            <h3>Welcome</h3>
            <ul>
                <li>
                    <Link to="/">
                        Home
                    </Link>
                </li>
                <li>
                    <Link to="/business">
                        Business 
                    </Link>
                </li>
            </ul>
        </div>
    )
}

function Nav(props) {
     // STYLED
    const NavDiv = styled.div`
    `;
    
    // STATE, USEFFECT, HISTORY, TOKEN
    const [navContent, setNavContent] = useState('');

    const history = useHistory(); 

    useEffect(() => {
        if(props.tokenState){
            const decoded = jwt_decode(props.tokenState)
            if (decoded.identity.userType === "client") {
                setNavContent([<NavClient key={'navClient'} logOut={logOut} navUserType={"client"} />])
            } else if (decoded.identity.userType === "company"){
                setNavContent([<NavBusiness key={'navBusiness'} logOut={logOut} navUserType={"company"} />])
            } else {
                setNavContent([<NavLog key={'navLog'} />])
            }
        } else {
            setNavContent([<NavLog key={'navLog'} />])
        }
    }, [props.tokenState]);
 
     // FUNCTIONS

    const logOut = (userType) => {
        localStorage.removeItem('usertoken')
        if (userType === "client"){
            history.push("/")
        } else if (userType === "company"){
            history.push("/business")
        }
    }

    return (
        <NavDiv>
            {navContent}
        </NavDiv>  
    );
}

export default Nav;
