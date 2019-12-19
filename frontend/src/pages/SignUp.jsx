import React, { useState } from 'react';
import { useHistory } from "react-router-dom";
import styled from 'styled-components';
import axios from 'axios'

function SignUp() {
    // STYLED

    
    // STATE
    const [first_name, setFirst_name] = useState('')
    const [last_name, setLast_name] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [rePassword, setRePassword] = useState('')
    const [sex, setSex] = useState('')
    const [connectionMessage, setConnectionMessage] = useState('')
    


    const history = useHistory();

    // FUNCTIONS

    const onSubmit = () => {
        if (password === rePassword) {
            const newUser = {
                first_name: first_name,
                last_name: last_name,
                email: email,
                password: password,
                sex: sex
            }
            register(newUser)
        } else {
            setConnectionMessage(<p>Passwords are different</p>)
        }
    }

    const register = newUser => {
        return axios
            .post("http://127.0.0.1:5000/new_user", {
                first_name: newUser.first_name,
                last_name: newUser.last_name,
                email: newUser.email,
                password: newUser.password,
                sex: newUser.sex
            })
            .then(response => {
                if (response.data) {
                    console.log("Registered")
                    history.push("/")
                } else {
                    history.push("/signup")
                }
            })
    }

    return (
        <div>
            <h1>
                Sign in
            </h1>
                <div >
                    <label htmlFor="first_name">First Name </label>
                    <input type="text" name="first_name" id="first_name" placeholder="Enter First Name" value={first_name} onChange={(e) => setFirst_name(e.target.value)} />
                </div>
                <div >
                    <label htmlFor="last_name">Last Name </label>
                    <input type="text" name="last_name" id="last_name" placeholder="Enter Last Name" value={last_name} onChange={(e) => setLast_name(e.target.value)} />
                </div>
                <div >
                    <label htmlFor="email">Email Address </label>
                    <input type="email" name="email" id="email" placeholder="Enter Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div >
                    <label htmlFor="password">Password </label>
                    <input  type="password" name="password" id="password" placeholder="Enter Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <div >
                    <label htmlFor="rePassword">Password again </label>
                    <input  type="rePassword" name="rePassword" id="rePassword" placeholder="Enter Password again" value={rePassword} onChange={(e) => setRePassword(e.target.value)} />
                </div>
                <div >
                    <label htmlFor="sex">Sex </label>
                    <input  type="sex" name="sex" id="sex" placeholder="Enter Sex" value={sex} onChange={(e) => setSex(e.target.value)} />
                </div>
                <input type="submit" name="signUp" value="Register" onClick={() => onSubmit()}/>
                {connectionMessage}
        </div>  
    );
}

export default SignUp;
