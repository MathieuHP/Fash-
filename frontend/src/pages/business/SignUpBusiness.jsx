import React, { useState, useEffect } from 'react';
import { useHistory } from "react-router-dom";
import axios from 'axios'

function SignUp() {
    // STYLED

    
    // STATE
    const [companyName, setCompanyName] = useState('')
    const [location, setLocation] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [rePassword, setRePassword] = useState('')
    const [phone, setPhone] = useState('')
    const [connectionMessage, setConnectionMessage] = useState('')
    
    const history = useHistory();
    const token = localStorage.usertoken

    useEffect(() => {
        if(token){
            history.push("/business/company")
        }
    }, []);

    // FUNCTIONS

    const onSubmit = (e) => {
        e.preventDefault()
        if (password === rePassword) {
            const newUser = {
                companyName: companyName,
                location: location,
                email: email,
                password: password,
                phone: phone,
            }
            register(newUser)
        } else {
            setConnectionMessage(<p>Passwords are different</p>)
        }
    }

    const register = newUser => {
        return axios
            .post("http://127.0.0.1:5000/new_company", {
                company_name: newUser.companyName,
                location: newUser.location,
                email: newUser.email,
                password: newUser.password,
                phone: newUser.phone
            })
            .then(response => {
                if (response.data === "ok") {
                    console.log("Registered")
                    history.push("/")
                } else if (response.data === "already exists"){
                    setConnectionMessage(<p>This email address already exists</p>)
                } else {
                    setConnectionMessage(<p>An error occured. Try again later please.</p>)
                    history.push("/signup")
                }
            })
    }

    // What info do we need for company ?

    return (
        <div>
            <h1>
                Sign up as company
            </h1>
            <div>
                <form onSubmit={(e) => onSubmit(e)}>
                    <div >
                        <label htmlFor="companyName">Company name </label>
                        <input type="text" name="companyName" id="companyName" placeholder="Enter Company name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                    </div>
                    <div >
                        <label htmlFor="location">Location </label>
                        <input type="text" name="location" id="location" placeholder="Enter Location" value={location} onChange={(e) => setLocation(e.target.value)} />
                    </div>
                    <div >
                        <label htmlFor="phone">Phone number </label>
                        <input type="tel" name="phone" id="phone" placeholder="Enter Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                    <div >
                        <label htmlFor="email">Email Address </label>
                        <input type="email" name="email" id="email" placeholder="Enter Email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div >
                        <label htmlFor="password">Password </label>
                        <input  type="password" name="password" id="password" placeholder="Enter Password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    <div >
                        <label htmlFor="rePassword">Password again </label>
                        <input  type="Password" name="rePassword" id="rePassword" placeholder="Enter Password again" required value={rePassword} onChange={(e) => setRePassword(e.target.value)} />
                    </div>
                    <input type="submit" name="signUp" value="Register"/>
                    {connectionMessage}
                </form>
            </div>
        </div>  
    );
}

export default SignUp;
