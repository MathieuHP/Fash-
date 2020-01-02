import React, { useEffect, useState } from 'react';
import { View, Text, Button, AsyncStorage } from 'react-native';
import { Link, useHistory } from "react-router-native";


function Nav() {
     // STYLED

     
     // STATE
    const [tokenState, setTokenState] = useState('')
    
    const history = useHistory();

    useEffect( () => {
        async function asyncFuncForAsyncStorage() {
            const token = await AsyncStorage.getItem('usertoken')
            setTokenState(token)
            if(!token){
                history.push("/")
            } else {
                checkToken(token)
            }
        }
        asyncFuncForAsyncStorage();
    }, []);
 
     // FUNCTIONS

     const checkToken = (token) => {         
        const options = {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': token
            }
        };
        fetch(`http://127.0.0.1:5000/check_token`, options)
        .then((response) => {
            response.json().then(function (text) {
                if ("msg" in text) {
                    logOut()
                    return;
                }
            });
        })
    }

    const logOut = async () => {
        await AsyncStorage.removeItem('usertoken');
        setTokenState('')
		history.push("/")
    }

    const testBack = () => {
        const options = {
            method: 'GET',
        };
        fetch(`http://127.0.0.1:5000/`, options)
        .then((response) => {
            response.text().then(async function (text) {
                console.log(text)
                console.log("Token State : ", await AsyncStorage.getItem('usertoken'));
            });
        })
    }
 
    return (
        <View>
           <View>
                <Link to="/">
                    <Text>Home</Text>
                </Link>
                <Link to="/client">
                    <Text>Client</Text>
                </Link>
                <Link to="/cart">
                    <Text>Cart</Text>
                </Link>
                {
                    tokenState ? 
                    <Button title="Click to disconnect" onPress={logOut}></Button> :
                    <Link to="/"><Text>Click to connect</Text></Link>
                }
            </View>
            <Button title="Testing backend" onPress={testBack}/>
        </View>
    );
}

export default Nav;
