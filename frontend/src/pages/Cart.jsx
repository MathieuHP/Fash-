import React, { useState, useEffect} from 'react';
import { useHistory } from "react-router-dom";
import styled from 'styled-components';
import jwt_decode from 'jwt-decode'

function Cart() {
    // STYLED
    const CartDiv = styled.div`
    `;

    const ImgCard = styled.img`
        width : 100px;
        height : 100px;
    `;

    // STATE
    const [cartImageL, setCartImageL] = useState('')
    const [cartImageSL, setCartImageSL] = useState('')
    const [first_name, setFirst_name] = useState('')
    const [last_name, setLast_name] = useState('')
    const [email, setEmail] = useState('')

    const token = localStorage.usertoken
    const history = useHistory();

    useEffect(() => {
        if(!token){
            history.push("/")
        } else {
            getProfileInfo();
            getCart()
        }
      }, []);

    // FUNCTIONS

    const getProfileInfo = () => {
        try {
            const decoded = jwt_decode(token)
            setFirst_name(decoded.identity.first_name)
            setLast_name(decoded.identity.last_name)
            setEmail(decoded.identity.email)
        } catch (error) {
            console.log("Not connected");
            localStorage.removeItem('usertoken')
            history.push("/")
        }
    }

    const getCart = async () => {
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
            if(!(cart["super_like"].length === 0)) {
                let super_like = []
                for (let i = 0; i < cart["super_like"].length; i++) {
                    super_like.push(await getImage(i + 'SL', cart["super_like"][i]))
                }
                setCartImageSL(super_like)
            } else {
                setCartImageSL([ <p key="cartSLEmpty">Your didn't super like any images yet</p> ])
            }
            if(!(cart["like"].length === 0)) {
                let like = []
                for (let i = 0; i < cart["like"].length; i++) {
                    like.push(await getImage(i + "L", cart["like"][i]))
                }
                setCartImageL(like)
            } else {
                setCartImageL([ <p key="cartLEmpty">Your didn't like any images yet</p> ])
            }
        } catch(err) {
            if ("msg" in cart){
                localStorage.removeItem('usertoken')
                history.push("/")
            }
            setCartImageSL([ <p key="cartSLEmpty">Sorry, an error occurred try again later</p> ])
            setCartImageL([ <p key="cartLEmpty">Sorry, an error occurred try again later</p> ])
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
        
        return <ImgCard key={key} src={imageUrl} alt="image"/>
    }

    return (
        <CartDiv>
             <div>
                <h1>PROFILE</h1>
            </div>
            <table>
                <tbody>
                    <tr>
                        <td>First Name :</td>
                        <td>{first_name}</td>
                    </tr>
                    <tr>
                        <td>Last Name : </td>
                        <td>{last_name}</td>
                    </tr>
                    <tr>
                        <td>Email : </td>
                        <td>{email}</td>
                    </tr>
                </tbody>
            </table>
            <div>
                <h3>Super like</h3>
                <div>
                {
                    cartImageSL ? cartImageSL : <p>Loading ...</p>
                }
                </div>
            </div>
            <div>
                <h3>Like</h3>
                <div>
                {
                    cartImageL ? cartImageL : <p>Loading ...</p>
                }
                </div>
            </div>
        </CartDiv>  
    );
}

export default Cart;

