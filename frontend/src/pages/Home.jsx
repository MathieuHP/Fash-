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
                <form method="POST">
                    <label htmlFor="username">Username:</label>
                    <input name="username" type="text"></input>
                    <br/>
                    <label htmlFor="password">Password:</label>
                    <input name="password" type="password"></input>
                    <br/>
                    <input type="submit" value="Submit"/>
                </form>
                <Link to="/signin">Sign in</Link>
            </div>
        </HomeDiv>  
    );
}

export default Home;
