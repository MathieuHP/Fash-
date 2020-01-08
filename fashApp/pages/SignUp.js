import React, { useState, useEffect } from 'react';
import axios from 'axios'
import { View, Text, Button, TextInput, AsyncStorage } from 'react-native';
import RadioForm from 'react-native-simple-radio-button';
import { useHistory } from "react-router-native";


function SignUp() {
	// STYLED

	// STATE
	const [first_name, setFirst_name] = useState('')
	const [last_name, setLast_name] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [rePassword, setRePassword] = useState('')
	const [sex, setSex] = useState('')
	const [phone, setPhone] = useState('')
	const [connectionMessage, setConnectionMessage] = useState('')

	const radio_props = [
		{label: 'M', value: "M" },
		{label: 'F', value: "F" },
		{label: 'ND', value: "ND" }
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

	// FUNCTIONS

	const onSubmit = () => {
	    if (password === rePassword) {
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
	        setConnectionMessage(<Text>Passwords are different</Text>)
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
	                console.log("Registered")
	                history.push("/")
	            } else if (response.data === "already exists"){
	                setConnectionMessage(<Text>This email address already exists</Text>)
	            } else {
	                setConnectionMessage(<Text>An error occured. Try again later please.</Text>)
	                history.push("/signup")
	            }
	        })
	}

	return (
		<View>
		    <Text>
		        Sign in
		    </Text>
		    <View>
				<View >	
					<TextInput placeholder="First Name" autoCapitalize="none" value={first_name} onChangeText={text => setFirst_name(text)} />
				</View>
				<View >
					<TextInput placeholder="Last Name" autoCapitalize="none" onChangeText={text => setLast_name(text)} />
				</View>
				<View >
					<TextInput placeholder="Phone number" autoCapitalize="none" onChangeText={text => setPhone(text)} />
				</View>
				<View >
					<TextInput placeholder="Email Address" autoCapitalize="none" onChangeText={text => setEmail(text)} />
				</View>
				<View >
					<TextInput placeholder="Password" secureTextEntry={true} autoCapitalize="none" onChangeText={text => setPassword(text)} />
				</View>
				<View >
					<TextInput placeholder="Password again" secureTextEntry={true} autoCapitalize="none" onChangeText={text => setRePassword(text)} />
				</View>
				<View>
					<RadioForm
						radio_props={radio_props}
						initial={-1}
						onPress={(value) => setSex(value)}
					/>
				</View>
				<Button title="Register" onPress={() => onSubmit()} />
				<Text>{connectionMessage}</Text>
		    </View>
		</View>  
	);
}

export default SignUp;
