import React from 'react';
import { Link } from "react-router-dom";
import styled from 'styled-components';

function Home() {
    // STYLED
    const HomeDiv = styled.div`
    `;
    
    // STATE

    // FUNCTIONS

    return (
        <HomeDiv>
            <h1>
                Home
            </h1>
            <div>
                <Link to="/company">
                    Company
                </Link>
                <Link to="/client">
                    Client
                </Link>
            </div>
        </HomeDiv>  
    );
}

export default Home;
