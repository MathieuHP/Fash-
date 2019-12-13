import React, { useState, useEffect} from 'react';
import styled from 'styled-components';

function Cart() {
    // STYLED
    const CartDiv = styled.div`
    `;

    const CartImage = styled.img`
        width : 100px;
        height : 100px;
    `;
    
    // STATE
    const [cartImage, setCartImage] = useState({"super_like" : [], "like" : []})

    useEffect(() => {
        getCart()
      }, []);

    // FUNCTIONS

    const getCart = async () => {
        const options = {
            method: 'POST',
        };
        fetch(`http://127.0.0.1:5000/cart`, options)
        .then((response) => {
            response.json().then(function (cart) {
                for (let i = 0; i < cart["super_like"].length; i++) {
                    cart["super_like"][i] = imageCard(cart["super_like"][i])
                }
                // console.log(cart["super_like"]);
                for (let j = 0; j < cart["like"].length; j++) {
                    cart["like"][j] = imageCard(cart["like"][j])
                }
                console.log(cart)
                setCartImage(cart)
                // console.log(cart["super_like"]);
            });
        })
    }

    const imageCard = async (imageName) => {
        const options = {
            method: 'POST',
            body: JSON.stringify({ imageName: imageName }),
        };
        fetch(`http://127.0.0.1:5000/show_image`, options)
        .then((response) => {
            response.blob().then(function (imageUrl) { 
                console.log(imageUrl);
                var urlCreator = window.URL || window.webkitURL;
                imageUrl = urlCreator.createObjectURL(imageUrl);
                console.log(imageUrl)
                return(
                    <div>
                        <CartImage src={imageUrl} alt="image"/>
                        <p>{imageName}</p>
                    </div>
                )
            });
        })
    }

    return (
        <CartDiv>
            <h1>
                Cart
            </h1>
            <div>
                <h3>Super like</h3>
                <div>
                {
                    // cartImage["super_like"].map((imageInfo) => {
                    //     console.log(imageInfo)
                    //     return imageInfo
                    // })
                    // cartImage["super_like"]
                }
                </div>
            </div>
            <div>
                <h3>Like</h3>
                <div>
                {
                    // cartImage["like"].map((imageInfo) => {
                    //     return imageInfo
                    // })
                    // cartImage["like"]
                }
                </div>
            </div>
        </CartDiv>  
    );
}

export default Cart;

