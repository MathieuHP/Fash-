import React, { useState, useEffect} from 'react';
import styled from 'styled-components';

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

    useEffect(() => {
        getCart()
      }, []);

    // FUNCTIONS

    const getCart = async () => {
        const options = {
            method: 'POST',
        };
        const response = await fetch(`http://127.0.0.1:5000/cart`, options)
        try {
            let cart = await response.json()
            if(!cart["super_like"].length === 0) {
                let super_like = []
                for (let i = 0; i < cart["super_like"].length; i++) {
                    super_like.push(await getImage(i + 'SL', cart["super_like"][i]))
                }
                setCartImageSL(super_like)
            } else {
                setCartImageSL([ <p key="cartSLEmpty">Your didn't super like any images yet</p> ])
            }
            if(!cart["like"].length === 0 ) {
                let like = []
                for (let i = 0; i < cart["like"].length; i++) {
                    like.push(await getImage(i + "L", cart["like"][i]))
                }
                setCartImageL(like)
            } else {
                setCartImageL([ <p key="cartLEmpty">Your didn't like any images yet</p> ])
            }
        }
        catch(err) {
            console.log(err);
            console.log('Your cart is empty');
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
            <h1>
                Cart
            </h1>
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

