import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, TextInput, AsyncStorage, StyleSheet, Image } from 'react-native';
import axios from 'axios'
import { Link, useHistory } from "react-router-native";

import {
    Layout,
    Text,
    Input,
    Button,
    Icon,
  } from '@ui-kitten/components';

function Home(props) {
    // STYLED

    const [secureTextEntry, setSecureTextEntry] = React.useState(true);

    const onIconPress = () => {
        setSecureTextEntry(!secureTextEntry);
      };
    
      const renderIcon = (style) => (
        <Icon {...style} name={secureTextEntry ? 'eye-off' : 'eye'}/>
      );
    
    // STATE
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [connectionMessage, setConnectionMessage] = useState('')

    const history = useHistory();

    useEffect(() => {
        async function asyncFuncForAsyncStorage() {
            const token = await AsyncStorage.getItem('usertoken')
            if (token) {
                props.setTokenState(token)
                history.push("/client")
            } else {
                props.setTokenState('')
            }
        }
        asyncFuncForAsyncStorage();
    }, []);

    // FUNCTIONS
    
    const onSubmit = () => {
        const user = {
            email: email,
            password: password
        }
        login(user)
    }

    const login = (user) => {        
        return axios.post("http://127.0.0.1:5000/login", {
            email: user.email,
            password: user.password,
            userType: 'client'
        }).then(async response => {
            if (response.data) {
                await AsyncStorage.setItem('usertoken', response.data.token)
                props.setTokenState(response.data.token)
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
        <Layout style={{width: 300}}>
            <View>
                <Input
                    style={styles.inputPassword}
                    value={email}
                    label='Email'
                    placeholder="Insert Email"
                    onChangeText={text => setEmail(text)}
                    autoCapitalize="none"
                />
                <Input
                    style={styles.inputPassword}
                    value={password}
                    placeholder="Insert Password"
                    onChangeText={text => setPassword(text)}
                    secureTextEntry={secureTextEntry}
                    onIconPress={onIconPress}
                    autoCapitalize="none"
                    icon={renderIcon}
                    label='Password'
                />
                <Button style={styles.button} onPress={() => onSubmit()}>
                    Log In
                </Button>
            </View>
            <Button style={styles.button} onPress={() => history.push("/signup")} appearance='outline'>
                Sign Up
            </Button>
            <Text>{connectionMessage}</Text>
        </Layout> 
    );
}

export default Home;

const styles = StyleSheet.create({
    inputPassword: {
        width: 300
    },
    button:{
        marginTop: 8,
        marginBottom: 8
    }
});
