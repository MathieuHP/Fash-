import React, { useState, useEffect } from 'react';
import { View, Image, AsyncStorage, StyleSheet } from 'react-native';
import { useHistory } from "react-router-native";
import RadioForm from 'react-native-simple-radio-button';
import axios from 'axios'

import {tofrontendTitle} from '../utils/convertTitles'
import {isEquivalent} from '../utils/isEquivalent'
import { TextInput, ScrollView } from 'react-native-gesture-handler';

import Nav from './Nav'

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

function Cart(props) {
    // STYLED

    // STATE
    const [cartImageL, setCartImageL] = useState('')
    const [cartImageSL, setCartImageSL] = useState('')
    const [tokenState, setTokenState] = useState('')
    const [modifyInfos, setModifyInfos] = useState(false);
    const [hasBeenChanged, setHasBeenChanged] = useState(false);
    const [objInfo, setObjInfo] = useState({})
    const [objInfoBeforeChanges, setObjInfoBeforeChanges] = useState({});

    const [first_name, setFirst_name] = useState([])
	const [last_name, setLast_name] = useState([])
    const [email, setEmail] = useState([])
	const [reEmail, setReEmail] = useState([])
    const [phone, setPhone] = useState([])
    
    const data = [
		{ text: 'Male', value: "M"},
		{ text: 'Female',  value: "F"},
		{ text: 'Not defined',  value: "ND" },
	];

    const history = useHistory();

    useEffect(() => {
        async function asyncFuncForAsyncStorage() {
            const token = await AsyncStorage.getItem('usertoken')
            if (!token) {
                history.push("/")
            } else {
                setTokenState(token)
                getProfileInfo(token);
                getCart(token)
            }
        }
        asyncFuncForAsyncStorage();
    }, []);

    // FUNCTIONS

    const getProfileInfo = async (token) => {
        try {
            const options = {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': token
                }
            };
            fetch(`http://127.0.0.1:5000/getProfileInfo`, options)
            .then((response) => {
                response.json().then(function (res) {
                    setObjInfoBeforeChanges(res)
                    setFirst_name([res['first_name'], false])
                    setLast_name([res['last_name'], false])
                    setEmail([res['email'], false])
                    setReEmail([res['email'], false])
                    setPhone([res['phone'], false])

                    setObjInfo(res)
                });
            })
        } catch (error) {
            await AsyncStorage.removeItem('usertoken');
            setTokenState('')
            props.setTokenState('')
			history.push("/")
        }
    }

    const getCart = async (token) => {
        const options = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Authorization': token
            },
        };
        const response = await fetch(`http://127.0.0.1:5000/cart`, options)
        let cart = await response.json()
        try {
            props.setTokenState(token)
            if (!(cart["super_like"].length === 0)) {
                let super_like = []
                for (let i = 0; i < cart["super_like"].length; i++) {
                    super_like.push(await getImage(i + 'SL', cart["super_like"][i]))
				}
                setCartImageSL(super_like)
            } else {
                setCartImageSL([<Text key="cartSLEmpty">You didn't super like any image yet</Text>])
            }
            if (!(cart["like"].length === 0)) {
                let like = []
                for (let i = 0; i < cart["like"].length; i++) {
                    like.push(await getImage(i + "L", cart["like"][i]))
                }
                setCartImageL(like)
            } else {
                setCartImageL([<Text key="cartLEmpty">You didn't like any image yet</Text>])
            }
        } catch (err) {
            if ("msg" in cart) {
                props.setTokenState('')
                await AsyncStorage.removeItem('usertoken');
				setTokenState('')
				history.push("/")
            }
            setCartImageSL([<Text key="cartSLEmpty">Sorry, an error occurred try again later</Text>])
            setCartImageL([<Text key="cartLEmpty">Sorry, an error occurred try again later</Text>])
        }
    }

    const getImage = async (key, imageName) => {
        const options = {
            method: 'POST',
            body: JSON.stringify({ imageName: imageName }),
        };
        const response = await fetch(`http://127.0.0.1:5000/show_image`, options)
        const imageBlob = await response.blob()
        var urlCreator = window.URL || window.webkitURL;
        let imageUrl = urlCreator.createObjectURL(imageBlob);

        return (
            <Image style={styles.imageCart} source={{ uri: imageUrl }} key={key} />
        )
    }


    const removeAccount = () => {
        const options = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Authorization': tokenState
            }
        };
        fetch(`http://127.0.0.1:5000/remove_account`, options)
            .then((response) => {
                response.json().then(async function (text) {
                    if ("msg" in text) {
                        await AsyncStorage.removeItem('usertoken');
                        props.setTokenState('')
						setTokenState('')
                        history.push("/")
                        return;
                    } else if ("valid" in text) {
                        console.log(text["valid"])
                        await AsyncStorage.removeItem('usertoken');
                        setTokenState('')
                        props.setTokenState('')
                        history.push("/")
                        return;
                    }
                });
            })
    }


    const modifyInfo = () => {
        if (objInfo['email'] === reEmail[0]) {
            if (isEquivalent(objInfoBeforeChanges, objInfo)) {
                setModifyInfos(false)
                setHasBeenChanged('No changes detected')
            } else {
                return axios
                    .post("http://127.0.0.1:5000/update_info", objInfo, {
                        headers: {
                            'Accept': 'application/json',
                            'Authorization': tokenState
                        }
                    })
                    .then(response => {
                        if ('valid' in response.data) {
                            console.log("Informations has changed")
                            setModifyInfos(false)
                            setHasBeenChanged('Your informations has been updated')
                            setFirst_name([objInfo['first_name'],false])
                            setLast_name([objInfo['last_name'],false])
                            setEmail([objInfo['email'],false])
                            setReEmail([objInfo['email'],false])
                            setPhone([objInfo['phone'],false])
                        } else if ('msg' in response.data) {
                            setHasBeenChanged('An error occured. Try again later please')
                            props.setTokenState('')
                            setTokenState('')
                            localStorage.removeItem('usertoken')
                            history.push("/")
                        }
                    })
                    .catch(error => {
                        console.log(error.response)
                        setHasBeenChanged('An error occured. Try again later please')
                        props.setTokenState('')
                        setTokenState('')
                        localStorage.removeItem('usertoken')
                        history.push("/")
                    });
            }
        } else {
            setHasBeenChanged('Emails are different')
        }
    }

    const handleChanges = (name, text, setState) => {
        setObjInfo({...objInfo, [name]: text})
        setState([text, true])
    }

    return (
        <ScrollView style={{width: 300}}>
            <View>
                <View style={styles.info}>
                    {
                        modifyInfos ?
                        <View>
                            <View>
                                <Input
                                style={styles.inputPassword}
                                value={email[0] === objInfo['email'] && !email[1] ? '' : objInfo['email']}
                                label='Email'
                                placeholder={email[0] ? 'Current Email: ' + email[0] : 'Insert Email'}
                                onChangeText={text => handleChanges('email', text, setEmail)}
                                autoCapitalize="none"
                            />
                            </View>
                            <View>
                                <Input
                                    style={styles.inputPassword}
                                    value={reEmail[0] === objInfo['email'] && !reEmail[1] ? '' : reEmail[0]}
                                    label='Email again'
                                    placeholder={reEmail[0] && email[0] ? 'Current Email: ' + reEmail[0] : 'Insert Email again'}
                                    onChangeText={text => setReEmail([text, true])}
                                    autoCapitalize="none"
                                />
                            </View>
                            <View>
                                <Input
                                    style={styles.inputPassword}
                                    value={first_name[0] === objInfo['first_name'] && !first_name[1] ? '' : objInfo['first_name']}
                                    label='First Name'
                                    placeholder={first_name[0] ? 'Current First Name: ' + first_name[0] : 'Insert First Name'}
                                    onChangeText={text => handleChanges('first_name', text, setFirst_name)}
                                />
                            </View>
                            <View>
                                <Input
                                    style={styles.inputPassword}
                                    value={last_name[0] === objInfo['last_name'] && !last_name[1] ? '' : objInfo['last_name']}
                                    label='Last Name'
                                    placeholder={last_name[0] ? 'Current Last Name: ' + last_name[0] : 'Insert Last Name'}
                                    onChangeText={text => handleChanges('last_name', text, setLast_name)}
                                />
                            </View>
                            <View>
                                <Input
                                    style={styles.inputPassword}
                                    value={phone[0] === objInfo['phone'] && !phone[1] ? '' : objInfo['phone']}
                                    label='Phone number'
                                    placeholder={phone[0] ? 'Current Phone: ' + phone[0] : 'Insert Phone'}
                                    onChangeText={text => handleChanges('phone', text, setPhone)}
                                    autoCapitalize="none"
                                />
                            </View>
                            <View>
                                <Select
                                    label='Gender'
                                    style={styles.inputPassword}
                                    data={data}
                                    selectedOption={objInfo['sex'] === 'M' ? data[0] : objInfo['sex'] === 'F' ? data[1] : data[2]}
                                    onSelect={(value) => setObjInfo({...objInfo, ['sex']: value.value})}
                                />
                            </View>
                        </View>
                        :
                            Object.keys(objInfo).map((item) => {
                                let itemFront = tofrontendTitle(item)
                                return (    
                                    <View key={'tr' + item}>
                                        <Text appearance='hint' key={itemFront + 'Title'}>{itemFront} : </Text>
                                        <Text key={objInfo[item] +'Value'}>{objInfo[item]}</Text>
                                    </View>
                                )
                            })
                    }
                </View>
                <ButtonGroup size='small' appearance='outline' status='primary' style={styles.buttonGroup}>
                    {
                        modifyInfos ?
                            <Button onPress={() => modifyInfo()}>Submit changes</Button>
                        :
                            <Button onPress={() => setModifyInfos(true)}>Change informations</Button>
                    }
                    <Button onPress={() => {history.push("/changepwd")}}>Change password</Button>
                    <Button onPress={() => removeAccount()}>Delete my account</Button>
                </ButtonGroup>
            </View>
            <View>
                <Text style={styles.text}>
                    {hasBeenChanged}
                </Text>
            </View>
                <View>
                    <Text style={styles.text} category='h4'>Super like</Text>
                    <View>
                        {
                            cartImageSL ? cartImageSL : <Text>Loading ...</Text>
                        }
                    </View>
                </View>
                <View>
                    <Text style={styles.text} category='h4'>Like</Text>
                    <View>
                        {
                            cartImageL ? cartImageL : <Text>Loading ...</Text>
                        }
                    </View>
                </View>
        </ScrollView>
    );
}

export default Cart;

const styles = StyleSheet.create({
    text : {
        margin: 8
    },
    buttonGroup: {
        flexDirection: 'column'
    },
    imageCart: {
        width: 300,
        height: 300,
        borderRadius: 3,
        marginTop: 30,
    },
    info: {
        marginBottom: 30
    },
    inputPassword: {
        width: 300
    },
});