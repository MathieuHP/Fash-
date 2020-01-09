import React, { useEffect, useState } from 'react'
import { useHistory } from "react-router-native";
import axios from 'axios'
import { View, Text, Image, TextInput, Button, AsyncStorage } from 'react-native';


function ChangePwd(props) {
    // STYLED

    
    // STATE, USEEFFECT
    const [oldPassword, setOldPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [rePassword, setRePassword] = useState('')
    const [infoMsg, setInfoMsg] = useState(<Text></Text>);
    
    const history = useHistory();

    useEffect(() => {
        if(!props.tokenState){
            history.push("/")
        } else {
            checkToken()
        }
    }, []);

    // FUNCTIONS

    const checkToken = () => {
        const options = {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'fromUserType' : 'client',
                'Authorization': props.tokenState
            }
        };

        fetch(`http://127.0.0.1:5000/check_token`, options)
        .then((response) => {

            response.json().then(function (text) {
                if ("msg" in text) {
                    props.setTokenState('')
                    localStorage.removeItem('usertoken')
                    history.push('/')
                    return;
                }
            });
            
        })
    }

    const onSubmit = () => {
        if (newPassword === rePassword) {
            return axios.post("http://127.0.0.1:5000/change_pwd", {
                old_password: oldPassword,
                new_password: newPassword
            }, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': props.tokenState
                }
            })
            .then(response => {
                if ("valid" in response.data) {
                    setInfoMsg(<Text>Password has been updated</Text>)
                    history.push("/cart")
                } else if ("msg" in response.data){
                    setInfoMsg(<Text>This email address already exists</Text>)
                    props.setTokenState('')
                    localStorage.removeItem('usertoken')
                    history.push('/')
                } else if ("info" in response.data){
                    setInfoMsg(<Text>Old password is wrong</Text>)
                } else {
                    props.setTokenState('')
                    localStorage.removeItem('usertoken')
                    history.push('/')
                }
            })
        } else {
            setInfoMsg(<Text>Passwords are different</Text>)
        }
    }

    return (
        <View>
                <View >
                    <TextInput placeholder="Old password" secureTextEntry={true} autoCapitalize="none" value={oldPassword} onChangeText={text => setOldPassword(text)} />
                </View>
                <View >
                    <TextInput placeholder="New password" secureTextEntry={true} autoCapitalize="none" value={newPassword} onChangeText={text => setNewPassword(text)} />
                </View>
                <View >
                    <TextInput placeholder="New password again" secureTextEntry={true} autoCapitalize="none" value={rePassword} onChangeText={text => setRePassword(text)} />
                </View>
                {infoMsg}
                <Button title="Change password" onPress={() => onSubmit()} />
        </View>
    )
}

export default ChangePwd
