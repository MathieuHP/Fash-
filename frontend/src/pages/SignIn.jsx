import React from 'react';
import { Link } from "react-router-dom";
import styled from 'styled-components';

function Home() {
    // STYLED
    const SignInDiv = styled.div`
    `;
    
    // STATE

    // FUNCTIONS

    return (
        <SignInDiv>
            <h1>
                Sign in
            </h1>
            <form method="POST">
                <label htmlFor="username">Username: </label>
                <input name="username" type="text"></input>
                <br/>
                <label htmlFor="mail">Mail: </label>
                <input name="mail" type="mail"></input>
                <br/>
                <label htmlFor="password">Password: </label>
                <input name="password" type="password"></input>
                <br/>
                <label htmlFor="rePassword">Re-enter password: </label>
                <input name="rePassword" type="password"></input>
                <br/>
                <input type="submit" value="Submit"/>
            </form>
        </SignInDiv>  
    );
}

export default Home;
