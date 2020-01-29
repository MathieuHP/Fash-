import React, { useState, useEffect } from 'react';
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
	Modal,
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
	
	const [visible, setVisible] = useState(false);
	
	const [noMoreCloth, setNoMoreCloth] = useState(false)

	const [filtersObj, setFiltersObj] = useState({
        clothe_sex: [],
        clothe_type: [],
        clothe_material: [],
        clothe_production: [],
        clothe_price_range: [0, 999],
    })
	const [clothe_sex, setClothe_sex] = useState([])
	const [clothe_type, setClothe_type] = useState([])
	const [clothe_material, setClothe_material] = useState([])
	const [clothe_production, setClothe_production] = useState([])
	const [clothe_price_range_min, setClothe_price_range_min] = useState(0)
	const [clothe_price_range_max, setClothe_price_range_max] = useState(999)


    const history = useHistory();
	const [tokenState, setTokenState] = useState('')

	const sexList = [
        { text: 'M' },
  		{ text: 'F' },
    ];

    const typeList= [
		{ text: 'Type 1' },
		{ text: 'Type 2' },
		{ text: 'Type 3' },
    ];

    const materialList= [
		{ text: 'Material 1' },
		{ text: 'Material 2' },
		{ text: 'Material 3' },
    ];
    
    const productionList= [
		{ text: 'Production 1' },
		{ text: 'Production 2' },
		{ text: 'Production 3' },
	];
	
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

	const getListImages = async (token, update = false) => {
		const options = {
			method: 'POST',
            body: JSON.stringify(imageList),
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
					setClothe_price_range_min(listImageFromBackend['filters']['clothe_price_range'][0])
					setClothe_price_range_max(listImageFromBackend['filters']['clothe_price_range'][1])
					setFiltersObj(listImageFromBackend['filters'])
					if ("no_more_pictures" in listImageFromBackend){
						props.setTokenState(token)
						if (update === 'filters') {
							setImageList([])
							setImageSrc('')
						} else {
							let iL = imageList
							iL.shift()
							if (iL.length > 0 ) {
								setImageList(iL)
								showImage(iL[0])
							} else {
								setImageSrc('')
							}
						}
						setNoMoreCloth(true)
						return;
					}
					if (update === 'rate') {
						props.setTokenState(token)
						let iL = imageList.concat(listImageFromBackend['imgs'])
						iL.shift()
						setImageList(iL)
						showImage(iL[0])
					} else {
						props.setTokenState(token)
						setImageList(listImageFromBackend['imgs'])
						showImage(listImageFromBackend['imgs'][0])
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
            if (iL.length === 0 && noMoreCloth) {
                setImageSrc('')
            } else if (iL.length === 0) {
                console.log("Loading new images...")
            } else if (iL.length < 7) {
                getListImages(tokenState, 'rate')
            } else {
                iL.shift()
                showImage(iL[0])
                setImageList(iL)
            }
		} catch (err) {
			console.log("Loading images ...");
		}
	}

	const updateFilters = async () => {
		let newFilters = {
			clothe_sex : clothe_sex.map(function(item){ return item.text }),
			clothe_type: clothe_type.map(function(item){ return item.text }),
			clothe_material: clothe_material.map(function(item){ return item.text }),
			clothe_production: clothe_production.map(function(item){ return item.text }),
			clothe_price_range: [clothe_price_range_min === '' ? 0 : parseInt(clothe_price_range_min), clothe_price_range_max === '' ? 0 : parseInt(clothe_price_range_max)]
		}
        const options = {
            method: 'POST',
            body: JSON.stringify(newFilters),
            headers: {
                'Accept': 'application/json',
                'Authorization': tokenState
            }
        };
        fetch(`http://127.0.0.1:5000/update_filters`, options)
        .then((response) => {
            response.json().then(async function (res) {
                if ("msg" in res) {
                    props.setTokenState('')
                    await AsyncStorage.removeItem('usertoken');
					setTokenState('')
                    history.push("/")
                    return;
                }
                if ("valid" in res) {
                    getListImages(tokenState, 'filters')
                }
            });
        })
    };

	const CustomHeaderCard = () => (
		<React.Fragment>
			{
				imageSrc ? <Image style={{ width: 300, height: 300 }} source={{ uri: imageSrc }} /> : <Text>{noMoreCloth ? 'No more clothes for now. Try again later.' : 'Loading ...'}</Text>
			}
		</React.Fragment>
	);

	const toggleModal = () => {
		if (visible === true) {
			updateFilters()
			setClothe_sex([])
			setClothe_type([])
			setClothe_material([])
			setClothe_production([])
		}
		setVisible(!visible);
	};

	const handleChangePrice = (val, setStateFunc) => {
		if((!isNaN(val)) && val >= 0){
			setStateFunc(val)
		}
	}
	
	const renderModalElement = () => (
		<Layout
			style={styles.modalContainer}
		>
			<Layout style={styles.containerSelect}>
				<Text appearance='hint' >Sex: ({filtersObj['clothe_sex'].map(element => element + ', ')})</Text>
				<Select
					style={styles.labelSelect}
					data={sexList}
					multiSelect={true}
					selectedOption={clothe_sex}
					onSelect={e => setClothe_sex(e)}
				/>
				<Text appearance='hint' >Type of cloth: ({filtersObj['clothe_type'].map(element => element + ', ')})</Text>
				<Select
					style={styles.labelSelect}
					data={typeList}
					multiSelect={true}
					selectedOption={clothe_type}
					onSelect={e => setClothe_type(e)}
				/>
				<Text appearance='hint' >Cloth material: ({filtersObj['clothe_material'].map(element => element + ', ')})</Text>
				<Select
					style={styles.labelSelect}
					data={materialList}
					multiSelect={true}
					selectedOption={clothe_material}
					onSelect={e => setClothe_material(e)}
				/>
				<Text appearance='hint' >Production method: ({filtersObj['clothe_production'].map(element => element + ', ')})</Text>
				<Select
					style={styles.labelSelect}
					data={productionList}
					multiSelect={true}
					selectedOption={clothe_production}
					onSelect={e => setClothe_production(e)}
				/>
				{/* <Text appearance='hint' >Price: (min, max)</Text>
				<Layout style={styles.containerPrice}>
					<Input
						style={styles.inputPrice}
						value={clothe_price_range_min.toString()}
						onChangeText={e => handleChangePrice(e, setClothe_price_range_min)}
						placeholder='Min'
					/>
					<Input
						style={styles.inputPrice}
						value={clothe_price_range_max.toString()}
						onChangeText={e => handleChangePrice(e, setClothe_price_range_max)}
						placeholder='Max'
					/>
				</Layout> */}
			</Layout>
		</Layout>
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
				<Layout style={styles.container}>
					<Button appearance='ghost' status='basic' onPress={toggleModal}>
						FILTERS
					</Button>
					<Modal
						allowBackdrop={true} 
						backdropStyle={styles.backdrop}
						onBackdropPress={toggleModal}
						visible={visible}
					>
						{renderModalElement()}
					</Modal>
				</Layout>
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
	container: {
		flex:1,
		minHeight: 256,
		padding: 16,
	},
	modalContainer: {
		justifyContent: 'center',
		alignItems: 'center',
		width: 400,
	},
	backdrop: {
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
	},
	containerSelect:{
		padding: 10,
		height: 500,
		width : 400,
	},
	labelSelect: {
		marginBottom: 20
	},
	containerPrice: {
		flexDirection: 'row',
	},
	inputPrice: {
		flex: 1,
	}
});