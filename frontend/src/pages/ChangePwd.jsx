import React, { useEffect, useState } from 'react'
import { useHistory } from "react-router-dom";
import axios from 'axios'
import jwt_decode from 'jwt-decode'


function ChangePwd(props) {
    // STYLED

    
    // STATE, USEEFFECT
    const [oldPassword, setOldPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [rePassword, setRePassword] = useState('')
    const [infoMsg, setInfoMsg] = useState('');
    
    const token = localStorage.usertoken
    const history = useHistory();

    useEffect(() => {
        if(!token){
            history.push("/")
        } else {
            checkToken()
        }
    }, []);

    // FUNCTIONS

    const checkToken = () => {
        const decoded = jwt_decode(token)
        const userType = decoded.identity.userType

        const options = {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'fromUserType' : userType,
                'Authorization': token
            }
        };

        fetch(`http://127.0.0.1:5000/check_token`, options)
        .then((response) => {
            let pushTo = '/'
            if (userType === "company") {
                pushTo = '/business'
            }
            response.json().then(function (text) {
                if ("msg" in text) {
                    props.setTokenState('')
                    localStorage.removeItem('usertoken')
                    history.push(pushTo)
                    return;
                } else if ("valid" in text) {
                    props.setTokenState(token)
                }
            });
            
        })
    }

    const onSubmit = (e) => {
        e.preventDefault()
        if (newPassword === rePassword) {
            return axios.post("http://127.0.0.1:5000/change_pwd", {
                old_password: oldPassword,
                new_password: newPassword
            }, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': token
                }
            })
            .then(response => {
                const decoded = jwt_decode(token)
                const userType = decoded.identity.userType
                let pushTo = '/'
                let pushToCart = "/cart"
                
                if (userType === "company") {
                    pushTo = '/business'
                    pushToCart = "/business/products"
                }

                if ("valid" in response.data) {
                    setInfoMsg(<p>Password has been updated</p>)
                    history.push(pushToCart)
                } else if ("msg" in response.data){
                    setInfoMsg(<p>This email address already exists</p>)
                    props.setTokenState('')
                    localStorage.removeItem('usertoken')
                    history.push(pushTo)
                } else if ("info" in response.data){
                    setInfoMsg(<p>Old password is wrong</p>)
                } else {
                    props.setTokenState('')
                    localStorage.removeItem('usertoken')
                    history.push(pushTo)
                }
            })
        } else {
            setInfoMsg(<p>Passwords are different</p>)
        }
    }

    return (
        <div>
             <form onSubmit={(e) => onSubmit(e)}>
                <div >
                    <label htmlFor="oldPassword">Old password: </label>
                    <input type="password" name="oldPassword" id="oldPassword" placeholder="Insert old password" required value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
                </div>
                <div >
                    <label htmlFor="newPassword">New password: </label>
                    <input type="Password" name="newPassword" id="newPassword" placeholder="Insert new password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                </div>
                <div >
                    <label htmlFor="rePassword">New password again: </label>
                    <input type="Password" name="rePassword" id="rePassword" placeholder="Insert new password again" required value={rePassword} onChange={(e) => setRePassword(e.target.value)} />
                </div>
                <input type="submit" name="changePwd" value="Change password"/>
                {infoMsg}
             </form>
        </div>
    )
}

export default ChangePwd
