import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faTimes, faStar, faHeart } from '@fortawesome/free-solid-svg-icons'
import { View, Image, TouchableHighlight, AsyncStorage, StyleSheet, ScrollView } from 'react-native';
import { Link, useHistory } from "react-router-native";

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

function Client(props) {
	// STYLED

	const StarIcon = (style) => (
		<Icon {...style} name='star'/>
	);

	const HeartIcon = (style) => (
		<Icon {...style} name='heart'/>
	);

	const CloseIcon = (style) => (
		<Icon {...style} name='close'/>
	);	

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

    const history = useHistory();
	const [tokenState, setTokenState] = useState('')

    useEffect(() => {
		let mounted = true;
        async function asyncFuncForAsyncStorage(mounted) {
			const token = await AsyncStorage.getItem('usertoken')
			if (mounted) {
				setTokenState(token)
				if(!token){
					history.push("/")
				} else {
					getListImages(token);
				}
			}
        }
		asyncFuncForAsyncStorage(mounted);
		return () => mounted = false;
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
						props.setTokenState('')
						history.push("/")
						return;
					}

					props.setTokenState(token)
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
							props.setTokenState('')
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
				getListImages(tokenState)
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

	const CustomHeaderCard = () => (
		<React.Fragment>
			{
				imageSrc ? <Image style={{ width: 300, height: 300 }} source={{ uri: imageSrc }} /> : <Text>Loading ...</Text>
			}
		</React.Fragment>
	  );

	return (
		<View>
			<ScrollView>
				<Card style={styles.card} header={CustomHeaderCard}>
					{/* <Text>{name}</Text> */}
					<Text appearance='hint' >Type of cloth: </Text><Text>{typeCloth}</Text> 
					<Text appearance='hint' >Cloth material: </Text><Text>{materialCloth}</Text>
					<Text appearance='hint' >Production method: </Text><Text>{productionMethod}</Text>
					<Text appearance='hint' >Price: </Text><Text>{price}</Text>
					{/* <Text>Gender : {sex}</Text> */}
					<Text appearance='hint' >Description: </Text><Text>{description}</Text>
				</Card>
				<View style={styles.buttonGroup}>
					<Button style={styles.button} onPress={() => rateImage(0)} appearance='outline' status='basic' icon={CloseIcon}/>
					<Button style={styles.button} onPress={() => rateImage(2)} appearance='outline' icon={StarIcon}/>
					<Button style={styles.button} onPress={() => rateImage(1)} appearance='outline' status='danger' icon={HeartIcon}/>
				</View>
			</ScrollView>
		</View>
	);
}

export default Client;

const styles = StyleSheet.create({
	buttonGroup: {
		justifyContent : 'center',
		alignItems: 'center',
		flexDirection: 'row',
		flexWrap: 'wrap'
	},
	button: {
		margin: 8
	},
	headerText: {
		marginHorizontal: 24,
		marginVertical: 16,
	},
	headerImage: {
		flex: 1,
		height: 192,
	},
});