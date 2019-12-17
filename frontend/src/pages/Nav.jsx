import React from 'react';
import { Link } from "react-router-dom";
import styled from 'styled-components';

function Nav() {
     // STYLED
     const NavDiv = styled.div`
     `;
     
     // STATE
 
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
        <NavDiv>
           <ul>
                <li>
                    <Link to="/">
                        Home
                    </Link>
                </li>
                <li>
                    <Link to="/company">
                        Company
                    </Link>
                </li>
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
                <button onClick={testBack}>Testing backend</button>
           </ul>
        </NavDiv>  
    );
}

export default Nav;
