import React, { useEffect, useState } from 'react';
import { View, Text, Button, AsyncStorage } from 'react-native';
import { Link, useHistory } from "react-router-native";
import jwt_decode from 'jwt-decode'

function NavClient(props) {
    return (
        <View>
            <Text>Normal NAV</Text>
            <View>
                <View>
                    <Link to="/client">
                       <Text>Client</Text>
                    </Link>
                </View>
                <View>
                    <Link to="/cart">
                        <Text>Cart</Text>
                    </Link>
                </View>
                <View>
                    <Button onPress={() => props.logOut(props.navUserType)} title='Click to disconnect' />
                </View>
            </View>
        </View>
    );
}

function NavLog() {
    return (
        <View>
            <Text>Welcome</Text>
            <View>
                <View>
                    <Link to="/">
                        <Text>Home</Text>
                    </Link>
                </View>
            </View>
        </View>
    )
}

function Nav(props) {
     // STYLED

     // STATE
     const [navContent, setNavContent] = useState('');
    
    const history = useHistory();

    useEffect(() => {
        if(props.tokenState){
            const decoded = jwt_decode(props.tokenState)
            if (decoded.identity.userType === "client") {
                setNavContent([<NavClient key={'navClient'} logOut={logOut} navUserType={"client"} />])
            } else {
                setNavContent([<NavLog key={'navLog'} />])
            }
        } else {
            setNavContent([<NavLog key={'navLog'} />])
        }
    }, [props.tokenState]);
 
     // FUNCTIONS

     const logOut = (userType) => {
        let pushTo = '/'
        if (userType === "company") {
            pushTo = '/business'
        }
        const options = {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Authorization': props.tokenState
            }
        };
        fetch(`http://127.0.0.1:5000/logout`, options)
        .then(async (response) => {
            await AsyncStorage.removeItem('usertoken');
            history.push(pushTo)
            return;
        })
    }
 
    return (
        <View>
            {navContent === '' ? <Text>{navContent}</Text> : navContent}
        </View>
    );
}

export default Nav;
