import React, { useEffect, useState } from 'react'
import { useHistory } from "react-router-native";
import axios from 'axios'
import { View, Image, TextInput, AsyncStorage, StyleSheet } from 'react-native';

// UI KITTEN
import {
    Layout,
    Text,
    Input,
    Button,
	Icon,
	Select,
	List,
	ListItem,
	ButtonGroup,
	Card
} from '@ui-kitten/components';


function ChangePwd(props) {
    // STYLED

    const [secureTextEntry, setSecureTextEntry] = React.useState(true);

    const onIconPress = () => {
        setSecureTextEntry(!secureTextEntry);
      };
    
      const renderIcon = (style) => (
        <Icon {...style} name={secureTextEntry ? 'eye-off' : 'eye'}/>
      );
    
    // STATE, USEEFFECT
    const [oldPassword, setOldPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [rePassword, setRePassword] = useState('')
    const [infoMsg, setInfoMsg] = useState('');
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
                    setInfoMsg('Password has been updated')
                    history.push("/cart")
                } else if ("msg" in response.data){
                    setInfoMsg('This email address already exists')
                    props.setTokenState('')
                    localStorage.removeItem('usertoken')
                    history.push('/')
                } else if ("info" in response.data){
                    setInfoMsg('Old password is wrong')
                } else {
                    props.setTokenState('')
                    localStorage.removeItem('usertoken')
                    history.push('/')
                }
            })
        } else {
            setInfoMsg('Passwords are different')
        }
    }

    return (
        <View>
                <View >
                    <Input
                        style={styles.inputPassword}
                        value={oldPassword}
                        placeholder="Insert old password"
                        onChangeText={text => setOldPassword(text)}
                        secureTextEntry={secureTextEntry}
                        onIconPress={onIconPress}
                        autoCapitalize="none"
                        icon={renderIcon}
                        label='Old Password'
                    />
                    {/* <TextInput placeholder="Old password" secureTextEntry={true} autoCapitalize="none" value={oldPassword} onChangeText={text => setOldPassword(text)} /> */}
                </View>
                <View >
                    <Input
                        style={styles.inputPassword}
                        value={newPassword}
                        placeholder="Insert new password"
                        onChangeText={text => setNewPassword(text)}
                        secureTextEntry={secureTextEntry}
                        onIconPress={onIconPress}
                        autoCapitalize="none"
                        icon={renderIcon}
                        label='New Password'
                    />
                    {/* <TextInput placeholder="New password" secureTextEntry={true} autoCapitalize="none" value={newPassword} onChangeText={text => setNewPassword(text)} /> */}
                </View>
                <View >
                    <Input
                        style={styles.inputPassword}
                        value={rePassword}
                        placeholder="Insert new password again"
                        onChangeText={text => setRePassword(text)}
                        secureTextEntry={secureTextEntry}
                        onIconPress={onIconPress}
                        autoCapitalize="none"
                        icon={renderIcon}
                        label='New Password again'
                    />
                    {/* <TextInput placeholder="New password again" secureTextEntry={true} autoCapitalize="none" value={rePassword} onChangeText={text => setRePassword(text)} /> */}
                </View>
                <Button style={styles.button} onPress={() => onSubmit()}>
                Change password
                </Button>
                <Text style={styles.text}>
                    {infoMsg}
                </Text>
        </View>
    )
}

export default ChangePwd

const styles = StyleSheet.create({
    inputPassword: {
        width: 300
    },
    text : {
        margin: 8
    },
    button:{
        marginTop: 8,
        marginBottom: 8
    }
})