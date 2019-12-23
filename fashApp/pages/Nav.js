import React, { useEffect } from 'react';
import { View, Text } from 'react-native';

function Nav() {
     // STYLED

     
     // STATE

    //  useEffect(() => {
    //     if(!token){
    //         history.push("/")
    //     } else {
    //         checkToken()
    //     }
    // }, []);
 
     // FUNCTIONS

    //  const checkToken = () => {
    //     const options = {
    //         method: 'GET',
    //         headers: {
    //             'Accept': 'application/json',
    //             'Authorization': token
    //         }
    //     };
    //     fetch(`http://127.0.0.1:5000/check_token`, options)
    //     .then((response) => {
    //         response.json().then(function (text) {
    //             if ("msg" in text) {
    //                 logOut()
    //                 return;
    //             }
    //         });
    //     })
    // }

    // const logOut = () => {
    //     localStorage.removeItem('usertoken')
    //     history.push("/")
    // }

    // const testBack = () => {
    //     const options = {
    //         method: 'GET',
    //     };
    //     fetch(`http://127.0.0.1:5000/`, options)
    //     .then((response) => {
    //         response.text().then(function (text) {
    //             console.log(text)
    //         });
    //     })
    // }
 
    return (
        <View>
            <Text>NAAAAV</Text>
        </View>
        // <div>
        //    <ul>
        //         <li>
        //             <Link to="/">
        //                 Home
        //             </Link>
        //         </li>
        //         <li>
        //             <Link to="/company">
        //                 Company
        //             </Link>
        //         </li>
        //         <li>
        //             <Link to="/client">
        //                 Client
        //             </Link>
        //         </li>
        //         <li>
        //             <Link to="/cart">
        //                 Cart
        //             </Link>
        //         </li>
        //         <li>
        //             {
        //                 localStorage.usertoken ? <p><button onClick={logOut}>Click to disconnect</button></p> : <Link to="/">Click to connect</Link>
        //             }
        //         </li>
        //     </ul>
        //     <button onClick={testBack}>Testing backend</button>
        // </NavDiv>
    );
}

export default Nav;
