import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, Image, Button, AsyncStorage } from 'react-native';
import jwt_decode from 'jwt-decode'
import { useHistory } from "react-router-native";


function Cart(props) {
    // STYLED

    // STATE
    const [cartImageL, setCartImageL] = useState('')
    const [cartImageSL, setCartImageSL] = useState('')
    const [tokenState, setTokenState] = useState('')
    const [objInfo, setObjInfo] = useState({})


    const history = useHistory();

    useEffect(() => {
        async function asyncFuncForAsyncStorage() {
            const token = await AsyncStorage.getItem('usertoken')
            setTokenState(token)
            if (!token) {
                history.push("/")
            } else {
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
                    let infos = {}
                    for (let key in res){
                        switch (key) {
                            case 'first_name':
                                infos["First Name"] = res[key]
                                break;
                            
                            case 'last_name':
                                infos["Last Name"] = res[key]
                                break;
                            
                            case 'email':
                                infos["Email"] = res[key]
                                break;

                            case 'created':
                                infos["Creation"] = res[key]
                                break;

                            case 'sex':
                                infos["Sex"] = res[key]
                                break;

                            case 'phone':
                                infos["Phone"] = res[key]
                                break;
                        }
                    }
                    setObjInfo(infos)
                });
            })
        } catch (error) {
            await AsyncStorage.removeItem('usertoken');
			setTokenState('')
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
                setCartImageSL([<Text key="cartSLEmpty">Your didn't super like any image yet</Text>])
            }
            if (!(cart["like"].length === 0)) {
                let like = []
                for (let i = 0; i < cart["like"].length; i++) {
                    like.push(await getImage(i + "L", cart["like"][i]))
                }
                setCartImageL(like)
            } else {
                setCartImageL([<Text key="cartLEmpty">Your didn't like any image yet</Text>])
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

        return <Image style={{ width: 50, height: 50 }} source={{ uri: imageUrl }} key={key} />
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
                        history.push("/")
                        return;
                    }
                });
            })
    }

    return (
        <ScrollView>
            <View>
                <Text>PROFILE</Text>
            </View>
            <View>
                {
                    Object.keys(objInfo).map((item, i) => (
                        <View key={'tr' + i}>
                            <Text key={'td' + item}>
                                {item} : 
                            </Text>
                            <Text key={'td' + objInfo[item]}>
                                {objInfo[item]}
                            </Text>
                        </View>
                    ))
                }
				<View>
					<View>
						<Button title="Delete my account" onPress={() => removeAccount()} />
					</View>
				</View>
            </View>
            <View>
                <Text>Super like</Text>
                <View>
                    {
                        cartImageSL ? cartImageSL : <Text>Loading ...</Text>
                    }
                </View>
            </View>
            <View>
                <Text>Like</Text>
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

