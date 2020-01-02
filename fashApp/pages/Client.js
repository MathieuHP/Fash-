import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faTimes, faStar, faHeart } from '@fortawesome/free-solid-svg-icons'
import { View, Image, Text, TouchableHighlight, AsyncStorage } from 'react-native';
import { Link, useHistory } from "react-router-native";

function Client() {
	// STYLED

	// STATE, EFFECT
	const [imageSrc, setImageSrc] = useState('')
	const [imageList, setImageList] = useState([])
	const [name, setName] = useState('')
	const [typeCloth, setTypeCloth] = useState('')
	const [materialCloth, setMaterialCloth] = useState('')
	const [productionMethod, setProductionMethod] = useState('')
	const [price, setPrice] = useState('')
	const [sex, setSex] = useState('')
	const [description, setDescription] = useState('')

	const [tokenState, setTokenState] = useState('')
    const history = useHistory();

    useEffect(() => {
        async function asyncFuncForAsyncStorage() {
            const token = await AsyncStorage.getItem('usertoken')
            setTokenState(token)
            if(!token){
                history.push("/")
            } else {
                getListImages(token);
            }
        }
        asyncFuncForAsyncStorage();
    }, []);

	// FUNCTIONS

	const getListImages = async (token) => {
		const options = {
			method: 'GET',
			headers: {
				'Accept': 'application/json',
				'Authorization': token
			}
		};
		fetch(`http://127.0.0.1:5000/load_image_for_rating`, options)
			.then((response) => {
				response.json().then(async function (listImageFromBackend) {
					if ("msg" in listImageFromBackend) {
						await AsyncStorage.removeItem('usertoken');
        				setTokenState('')
						history.push("/")
						return;
					}
					let iL = imageList.concat(listImageFromBackend)
					setImageList(iL)
					if (!imageSrc) {
						showImage(iL[0])
					}
				});
			})
	};

	const showImage = async (imageInfo) => {
		setName(imageInfo["name"])
		setTypeCloth(imageInfo["typeCloth"])
		setMaterialCloth(imageInfo["productionMethod"])
		setProductionMethod(imageInfo["productionMethod"])
		setPrice(imageInfo["price"])
		setSex(imageInfo["sex"])
		setDescription(imageInfo["description"])

		const options = {
			method: 'POST',
			body: JSON.stringify({ imageName: imageInfo["name"] }),
		};
		fetch(`http://127.0.0.1:5000/show_image`, options)
			.then((response) => {
				response.blob().then(function (imageUrl) {
					var urlCreator = window.URL || window.webkitURL;
					imageUrl = urlCreator.createObjectURL(imageUrl);
					setImageSrc(imageUrl);
				});
			})
	}

	const rateImage = (value) => {
		try {
			const options = {
				method: 'POST',
				body: JSON.stringify({ imageName: imageList[0]["name"], rating: value }),
				headers: {
					'Accept': 'application/json',
					'Authorization': tokenState
				}
			};
			fetch(`http://127.0.0.1:5000/rate_image`, options)
				.then((response) => {
					response.json().then(async function (resText) {
						if ("msg" in resText) {
							await AsyncStorage.removeItem('usertoken');
							setTokenState('')
							history.push("/")
							return;
						} else if ("valid" in resText)
							console.log(resText["valid"]);
					});
				})
			let iL = imageList
			iL.shift()
			if (iL.length === 0) {
				console.log("Loading new images...")
			} else if (iL.length < 7) {
				getListImages()
				showImage(iL[0])
				setImageList(iL)
			} else {
				showImage(iL[0])
				setImageList(iL)
			}
		} catch (err) {
			console.log("Loading images ...");
		}
	}

	return (
		<View>
			<View>
				<Text>
					Client
                </Text>
			</View>
			<View>
				{
					imageSrc ? <Image style={{ width: 300, height: 300 }} source={{ uri: imageSrc }} /> : <Text>Loading ...</Text>
				}
				<Text>{name}</Text>
				<Text>{typeCloth}</Text>
				<Text>{materialCloth}</Text>
				<Text>{productionMethod}</Text>
				<Text>{price}</Text>
				<Text>{sex}</Text>
				<Text>{description}</Text>
			</View>
			<View>
				<TouchableHighlight onPress={() => rateImage(0)}><View><FontAwesomeIcon icon={faTimes} /></View></TouchableHighlight>
				<TouchableHighlight onPress={() => rateImage(2)}><View><FontAwesomeIcon icon={faStar} /></View></TouchableHighlight>
				<TouchableHighlight onPress={() => rateImage(1)}><View><FontAwesomeIcon icon={faHeart} /></View></TouchableHighlight>
			</View>
		</View>
	);
}

export default Client;
