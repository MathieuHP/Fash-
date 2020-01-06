import React, { useState, useEffect} from 'react';
import { useHistory } from "react-router-dom";
import styled from 'styled-components';

function Cart(props) {
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
    const [objInfo, setObjInfo] = useState({})

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
            props.setTokenState(token)
            if(!(cart["super_like"].length === 0)) {
                let super_like = []
                for (let i = 0; i < cart["super_like"].length; i++) {
                    super_like.push(await getImage(i + 'SL', cart["super_like"][i]))
                }
                setCartImageSL(super_like)
            } else {
                setCartImageSL([ <p key="cartSLEmpty">Your didn't super like any image yet</p> ])
            }
            if(!(cart["like"].length === 0)) {
                let like = []
                for (let i = 0; i < cart["like"].length; i++) {
                    like.push(await getImage(i + "L", cart["like"][i]))
                }
                setCartImageL(like)
            } else {
                setCartImageL([ <p key="cartLEmpty">Your didn't like any image yet</p> ])
            }
        } catch(err) {
            if ("msg" in cart){
                props.setTokenState('')
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


    const removeAccount = () => {
        const options = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Authorization': token
            }
        };
        fetch(`http://127.0.0.1:5000/remove_account`, options)
        .then((response) => {
            response.json().then(function () {
                localStorage.removeItem('usertoken')
                history.push("/")
                return;
            });
        })
    }

    return (
        <CartDiv>
             <div>
                <h1>PROFILE</h1>
            </div>
            <table>
                <tbody>
                    {
                        Object.keys(objInfo).map((item, i) => (
                            <tr key={'tr' + i}>
                                <td key={'td' + item}>
                                    {item} : 
                                </td>
                                <td key={'td' + objInfo[item]}>
                                    {objInfo[item]}
                                </td>
                            </tr>
                        ))
                    }
                    <tr>
                        <td>
                            <button onClick={removeAccount}>
                                Delete my account
                            </button>
                        </td>
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

