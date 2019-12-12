import React from 'react';
import { Link } from "react-router-dom";
import styled from 'styled-components';

function Nav() {
     // STYLED
     const NavDiv = styled.div`
     `;
     
     // STATE
 
     // FUNCTIONS
 
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
           </ul>
        </NavDiv>  
    );
}

export default Nav;
