import React, { useState } from 'react';
import { Link, useHistory } from "react-router-dom";
import styled from 'styled-components';
import axios from 'axios'

function Home() {
    // STYLED
    const SignUpDiv = styled.div`
    `;
    
    // STATE
    const [first_name, setFirst_name] = useState('')
    const [last_name, setLast_name] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const history = useHistory();

    // FUNCTIONS

    const onSubmit = (e) => {
        e.preventDefault()

        const newUser = {
            first_name: first_name,
            last_name: last_name,
            email: email,
            password: password
        }

        register(newUser).then(res => {
            history.push("/")
        })
    }

    const register = newUser => {
        return axios
            .post("users/register", {
                first_name: newUser.first_name,
                last_name: newUser.last_name,
                email: newUser.email,
                password: newUser.password
            })
            .then(response => {
                console.log("Registered")
            })
    }

    return (
        <SignUpDiv>
            <h1>
                Sign in
            </h1>
            {/* <form noValidate onSubmit={onSubmit}> */}
                <div >
                    <label htmlFor="first_name">First Name </label>
                    <input
                        type="text"
                        name="first_name"
                        id="first_name"
                        placeholder="Enter First Name"
                        value={first_name}
                        onChange={(e) => setFirst_name(e.target.value)} />
                </div>
                <div >
                    <label htmlFor="last_name">Last Name </label>
                    <input
                        type="text"
                        name="last_name"
                        id="last_name"
                        placeholder="Enter Last Name"
                        value={last_name}
                        onChange={(e) => setLast_name(e.target.value)} />
                </div>
                <div >
                    <label htmlFor="email">Email Address </label>
                    <input
                        type="email"
                        name="email"
                        id="email"
                        placeholder="Enter Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div >
                    <label htmlFor="password">Password </label>
                    <input 
                        type="password"
                        name="password"
                        id="password"
                        placeholder="Enter Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)} />
                </div>
                <button type="submit" onClick={() => onSubmit()}>
                    Register
                </button>
            {/* </form> */}
        </SignUpDiv>  
    );
}

export default Home;
