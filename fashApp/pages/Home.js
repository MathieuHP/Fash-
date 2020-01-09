import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, TextInput, Button, AsyncStorage } from 'react-native';
import axios from 'axios'
import { Link, useHistory } from "react-router-native";

function Home(props) {
    // STYLED
    
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
        <View>
            <Text>Home</Text>
            <View>
                <TextInput
                    placeholder="Insert Email"
                    onChangeText={text => setEmail(text)}
                    autoCapitalize="none"
                />
                <TextInput
                    placeholder="Insert Password"
                    onChangeText={text => setPassword(text)}
                    secureTextEntry={true}
                    autoCapitalize="none"
                />
                <Button
                    title="Log in"
                    onPress={() => onSubmit()}
                />
                <Text>{connectionMessage}</Text>
            </View>
            <Link to="/signup">
                <Text>Sign Up</Text>
            </Link>
        </View> 
    );
}

export default Home;
