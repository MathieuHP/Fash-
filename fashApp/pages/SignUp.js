import React, { useState, useEffect } from 'react';
import axios from 'axios'
import { View, TextInput, AsyncStorage, StyleSheet, ScrollView } from 'react-native';
import RadioForm from 'react-native-simple-radio-button';
import { useHistory, Link } from "react-router-native";


// UI KITTEN
import {
    Layout,
    Text,
    Input,
    Button,
	Icon,
	Select,
	Modal,
} from '@ui-kitten/components';

function SignUp() {
	// STYLED

	const [secureTextEntry, setSecureTextEntry] = React.useState(true);

    const onIconPress = () => {
        setSecureTextEntry(!secureTextEntry);
      };
    
      const renderIcon = (style) => (
        <Icon {...style} name={secureTextEntry ? 'eye-off' : 'eye'}/>
      );

	// STATE
	const [first_name, setFirst_name] = useState('')
	const [last_name, setLast_name] = useState('')
	const [email, setEmail] = useState('')	
	const [reEmail, setReEmail] = useState('')	
	const [password, setPassword] = useState('')
	const [rePassword, setRePassword] = useState('')
	const [sex, setSex] = useState('')
	const [phone, setPhone] = useState('')
	const [connectionMessage, setConnectionMessage] = useState('')

	const [visible, setVisible] = React.useState('f');

	const data = [
		{ text: 'Male', value: "M"},
		{ text: 'Female',  value: "F"},
		{ text: 'Not defined',  value: "ND" },
	];

	const history = useHistory();

	useEffect(() => {
        async function asyncFuncForAsyncStorage() {
            const token = await AsyncStorage.getItem('usertoken')
            if (token) {
                history.push("/client")
            }
        }
        asyncFuncForAsyncStorage();
	}, []);
	
	useEffect(() => {
		if(visible === false){
			history.push("/")
		}
	  }, [visible]);

	// FUNCTIONS

	const onSubmit = () => {
        if (first_name.length > 0 && last_name.length > 0 && email.length > 0 && password.length > 0 && sex.length > 0 && phone.length > 0){
			if (password === rePassword && reEmail === email) {
				const newUser = {
					first_name: first_name,
					last_name: last_name,
					email: email,
					password: password,
					sex: sex,
					phone: phone,
				}
				register(newUser)
			} else {
				setConnectionMessage(<Text>Passwords or emails are differents</Text>)
			}
		} else {
			setConnectionMessage(<Text>All fields are not complete</Text>)
		}
	}

	const register = newUser => {
	    return axios
	        .post("http://127.0.0.1:5000/new_user", {
	            first_name: newUser.first_name,
	            last_name: newUser.last_name,
	            email: newUser.email,
	            password: newUser.password,
	            sex: newUser.sex,
	            phone: newUser.phone
	        })
	        .then(response => {
	            if (response.data === "ok") {
	                handleOpen()
	            } else if (response.data === "already exists"){
	                setConnectionMessage(<Text>This email address already exists</Text>)
	            } else {
	                setConnectionMessage(<Text>An error occured. Try again later please.</Text>)
	                history.push("/signup")
	            }
		    })
	}

	const handleOpen = () => {
        setVisible(true);
    };
    
    const handleClose = () => {
		setVisible(false)
	};

	return (
		<ScrollView style={{width: 300}}>
				<Text style={styles.text} category='h5'>
					Sign Up
				</Text>
				<View>
					<View>
						<Input
							style={styles.inputPassword}
							value={first_name}
							label='First Name'
							placeholder="Insert First Name"
							onChangeText={text => setFirst_name(text)}
						/>
						<Input
							style={styles.inputPassword}
							value={last_name}
							label='Last Name'
							placeholder="Insert Last Name"
							onChangeText={text => setLast_name(text)}
						/>
						<Input
							style={styles.inputPassword}
							value={phone}
							label='Phone number'
							placeholder="Insert Phone number"
							onChangeText={text => setPhone(text)}
							autoCapitalize="none"
						/>
						<Input
							style={styles.inputPassword}
							value={email}
							label='Email Address'
							placeholder="Insert Email Address"
							onChangeText={text => setEmail(text)}
							autoCapitalize="none"
						/>
						<Input
							style={styles.inputPassword}
							value={reEmail}
							label='Email Address again'
							placeholder="Insert Email Address again"
							onChangeText={text => setReEmail(text)}
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
						<Input
							style={styles.inputPassword}
							value={rePassword}
							placeholder="Insert Password again"
							onChangeText={text => setRePassword(text)}
							secureTextEntry={secureTextEntry}
							onIconPress={onIconPress}
							autoCapitalize="none"
							icon={renderIcon}
							label='Password again'
						/>
						<Select
							label='Gender'
							style={styles.inputPassword}
							data={data}
							selectedOption={sex}
							onSelect={(text) => setSex(text.value)}
						/>
					</View>
					<Button style={styles.button} onPress={() => onSubmit()}>
						Register
					</Button>
					<Text style={styles.inputPassword}>{connectionMessage}</Text>
				</View>
				<Modal
					backdropStyle={styles.backdrop}
					visible={visible}
				>
					<Layout style={styles.modalContainer}>
						<Text category='h5'>
							Thanks for signing up 
						</Text>
						<Text style={styles.text}>
							You will receive a confirmation email shortly.
						</Text>
						<Button onPress={() => handleClose()}>Ok</Button>
					</Layout>
				</Modal>
			</ScrollView>
	);
}

export default SignUp;

const styles = StyleSheet.create({
    inputPassword: {
        width: 300
    },
    button:{
        marginTop: 15,
        marginBottom: 8
	},
	text: {
		marginTop: 30,
		marginBottom: 30,
		alignItems : 'center',
		justifyContent : 'center'
	},
	titleFash:{
		alignItems : 'center',
		justifyContent : 'center'
	},
	modalContainer: {
		justifyContent: 'center',
		alignItems: 'center',
		width: 300,
		padding: 16,
	},
	backdrop: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
    },
});
