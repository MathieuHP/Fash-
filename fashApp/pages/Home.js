import React, { useState } from 'react';
import { Text, View, TouchableOpacity, TextInput, Button } from 'react-native';
import axios from 'axios'


function Home() {
    // STYLED
    
    // STATE
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [connectionMessage, setConnectionMessage] = useState('')

    // FUNCTIONS
    
    const onSubmit = () => {
        const user = {
            email: email,
            password: password
        }
        login(user)
    }

    const login = (user) => {        
        return axios.post("http://127.0.0.1:5000/login", {
            email: user.email,
            password: user.password
        }).then(response => {
            if (response.data) {
                localStorage.setItem('usertoken', response.data.token)
                history.push("/client")
            } else {
                console.log("Cannot connect");
                setConnectionMessage('Wrong email or password')
            }
        })
        .catch(err => {
            console.log(err)
        })
    }

    const goToSignUp = () => {
        Actions.SignUp()
     }

    return (
        <View>
            <Text>Home</Text>
            <View>
                <TextInput
                    placeholder="Enter Email"
                    onChangeText={text => setEmail(text)}
                    autoCapitalize="none"
                />
                <TextInput
                    placeholder="Enter Password"
                    onChangeText={text => setPassword(text)}
                    secureTextEntry={true}
                    autoCapitalize="none"
                />
                <Button
                    title="Log in"
                    onPress={() => onSubmit()}
                />
                <Text>{connectionMessage}</Text>
            </View>
            <TouchableOpacity onPress = {goToSignUp}>
                <Text>This is HOME!</Text>
            </TouchableOpacity>
        </View>

//         <div>
//             <h1>
//                 Home
//             </h1>
//             <div>
//                 <form onSubmit={(e) => onSubmit(e)}>
//                     <div>
//                         <label htmlFor="email">Email Address</label>
//                         <input type="email" name="email" id="email" placeholder="Enter Email" value={email} onChange={(e) => setEmail(e.target.value)}/>
//                     </div>
//                     <div>
//                         <label htmlFor="password">Password </label>
//                         <input type="password" name="password" id="password" placeholder="Enter Password" value={password} onChange={(e) => setPassword(e.target.value)}/>
//                     </div>
//                     <div>
//                         <input type="submit" name="login" value="Log in"/>
//                         <p>{connectionMessage}</p>
//                     </div>
//                 </form>
//             </div>
//             <Link to="/signup">Sign up</Link>
//         </div>  
    );
}

export default Home;
