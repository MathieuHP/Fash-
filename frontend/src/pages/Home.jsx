import React, { useState } from 'react';
import { Link, useHistory } from "react-router-dom";
import styled from 'styled-components';
import axios from 'axios'


function Home() {
    // STYLED
    
    // STATE
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [connectionMessage, setConnectionMessage] = useState('')

    const history = useHistory();

    // FUNCTIONS
    
    const onSubmit = (e) => {
        e.preventDefault()
        const user = {
            email: email,
            password: password
        }
        login(user)
    }

    const login = (user) => {
        return axios.post("http://127.0.0.1:5000/login", {
            email: user.email,
            password: user.password
        }).then(response => {
            if (response.data) {
                localStorage.setItem('usertoken', response.data.token)
                history.push("/client")
            } else {
                console.log("Cannot connect");
                setConnectionMessage('Wrong email or password')
            }
        })
        .catch(err => {
            console.log(err)
        })
    }

    return (
        <div>
            <h1>
                Home
            </h1>
            <div>
                <form onSubmit={(e) => onSubmit(e)}>
                    <div>
                        <label htmlFor="email">Email Address</label>
                        <input type="email" name="email" id="email" placeholder="Enter Email" required value={email} onChange={(e) => setEmail(e.target.value)}/>
                    </div>
                    <div>
                        <label htmlFor="password">Password </label>
                        <input type="password" name="password" id="password" placeholder="Enter Password" required value={password} onChange={(e) => setPassword(e.target.value)}/>
                    </div>
                    <div>
                        <input type="submit" name="login" value="Log in"/>
                        <p>{connectionMessage}</p>
                    </div>
                </form>
            </div>
            <Link to="/signup">Sign up</Link>
        </div>  
    );
}

export default Home;
