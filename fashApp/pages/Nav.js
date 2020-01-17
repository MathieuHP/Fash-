import React, { useEffect, useState } from 'react';
import { View, AsyncStorage, StyleSheet } from 'react-native';
// import { View, Text, Button, AsyncStorage } from 'react-native';

import { Link, useHistory, useLocation } from "react-router-native";
import jwt_decode from 'jwt-decode'

// UI KITTEN

import {
    Layout,
    Text,
    Input,
    Button,
    Icon,
    TopNavigation,
    TopNavigationAction,
} from '@ui-kitten/components';

function NavClient(props) {
    const location = useLocation();
    const history = useHistory();

    let pathname = location.pathname;

    const LogOutIcon = (style) => (
		<Icon {...style} name='log-out'/>
    );

    const LogOutAction = () => (
        <TopNavigationAction icon={LogOutIcon} onPress={() => props.logOut(props.navUserType)}/>
    );

    const RateImageIcon = (style) => (
		<Icon {...style} name='image'/>
    );    

    const RateImageAction = () => (
        <TopNavigationAction icon={RateImageIcon} onPress={() => history.push('/client')}/>
    );

    const ProfileIcon = (style) => (
		<Icon {...style} name='person'/>
    );    

    const ProfileAction = () => (
        <TopNavigationAction icon={ProfileIcon} onPress={() => history.push('/cart')}/>
    );

    return (
        <Layout style={styles.buttonGroup}>
            <TopNavigation
                leftControl={ pathname === '/client' ? ProfileAction() : RateImageAction() }
                rightControls={LogOutAction()}
            />
            <TopNavigation
                leftControl={pathname === '/client' ? <Text status='primary' style={styles.titleText} category='h4'>Cloths</Text> : <Text status='primary' style={styles.titleText} category='h4'>Profile</Text>}
                alignment="center"
            />
        </Layout>
    );
}

function NavLog() {
    const history = useHistory();
    const location = useLocation();
    let pathname = location.pathname;    

    const BackIcon = (style) => (
        <Icon {...style} name='arrow-back'/>
    );

    const renderBackAction = () => (
        <TopNavigationAction icon={BackIcon} onPress={() => history.push('/')}/>
    );
    
    return (
        <Layout style={styles.buttonGroup}>
            {
                pathname === '/signup' ? 
                    <TopNavigation alignment='start' leftControl={renderBackAction()}/> : 
                    <Text></Text>
            }
            <TopNavigation
                leftControl={<Text style={styles.text} category='h1' status='primary'>Fash</Text>}
                alignment="center"
            />
        </Layout>
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
        <View >
            {navContent === '' ? <Text>{navContent}</Text> : navContent}
        </View>
    );
}

export default Nav;

const styles = StyleSheet.create({
    text: {
      margin: 8,
    },
    titleText: {
        marginBottom: 20,
    },
    buttonGroup: {
        justifyContent : 'center',
        alignItems: 'center',
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
  });

  