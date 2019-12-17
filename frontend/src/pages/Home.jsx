import React, { useState } from 'react';
import { Link, useHistory } from "react-router-dom";
import styled from 'styled-components';
import axios from 'axios'


function Home() {
    // STYLED
    const HomeDiv = styled.div`
    `;
    
    // STATE
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const history = useHistory();

    // FUNCTIONS
    
    const onSubmit = (e) => {
        e.preventDefault()

        const user = {
            email: email,
            password: password
        }

        login(user).then(res => {
            if (!res.error) {
                history.push("/client")
            }
        })
    }

    const login = (user) => {
        return axios
            .post("http://127.0.0.1:5000/login", {
                email: user.email,
                password: user.password
            })
            .then(response => {
                localStorage.setItem('usertoken', response.data.token)
                return response.data.token
            })
            .catch(err => {
                console.log(err)
            })
    }

    return (
        <HomeDiv>
            <h1>
                Home
            </h1>
            <div>
                <form noValidate onSubmit={(e) => onSubmit(e)}>
                    <div>
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            placeholder="Enter Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            />
                    </div>
                    <div>
                        <label htmlFor="password">Password </label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            placeholder="Enter Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            />
                    </div>
                    <button type="submit">
                        Log in
                    </button>
                </form>
                <Link to="/signup">Sign up</Link>
            </div>
        </HomeDiv>  
    );
}

export default Home;
