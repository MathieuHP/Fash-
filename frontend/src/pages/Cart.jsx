import React from 'react';
import styled from 'styled-components';

function Cart() {
    // STYLED
    const CartDiv = styled.div`
    `;
    
    // STATE

    // FUNCTIONS

    // const getCart = async () => {
    //     const options = {
    //         method: 'POST',
    //         body: JSON.stringify({ userId : userId}),
    //     };
    //     fetch(`http://127.0.0.1:5000/cart`, options)
    //     .then((response) => {
    //         response.text().then(function(resText) { 
    //             console.log(resText);   
    //         });
    //     })
    // }

    return (
        <CartDiv>
            <h1>
                Cart
            </h1>
        </CartDiv>  
    );
}

export default Cart;

