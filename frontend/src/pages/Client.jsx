import React, {useState, useEffect} from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes, faStar, faHeart } from '@fortawesome/free-solid-svg-icons'
import axios from 'axios';

function Client() {
    // STYLED
    const ClientDiv = styled.div`
    `;

    const ClothImg = styled.img`
        max-width : 640px;
        max-height : 640px;
    `;

    // STATE, EFFECT
    const [image, setImage] = useState('')
    const [imageList, setImageList] = useState([])

    useEffect(() => {
        fetchData();
      }, []);
    
    // FUNCTIONS
    const fetchData = async () => {
        // const result = await axios(
        //   'load_image_for_rating',
        // );
        // let newImageList = imageList.concat(result.data)
        // setImageList(newImageList);
        // if (image === '') {
        //     setImage(newImageList[0].download_url)
        // }
        const options = {
            method: 'GET',
        };
        fetch(`http://127.0.0.1:5000/load_image_for_rating`, options)
        .then((response) => {
            response.text().then(function (text) {
                console.log(text)
            });
        })
    };

    const rateImage = (value) => {
        let il = imageList
        console.log(image, value);
        console.log("Send values to backend");
        il.shift()
        setImage(il[0].download_url)
        setImageList(il)
        if (il.length < 15) {
            fetchData()
        }
    }

    return (
        <ClientDiv>
            <div>
                <h1>
                    Client
                </h1>
            </div>
            <div>
                <ClothImg src={image} alt="image"/>
            </div>
            <div>
                <button onClick={() => rateImage(0)} type="button"><FontAwesomeIcon icon={faTimes} /></button>
                <button onClick={() => rateImage(2)} type="button"><FontAwesomeIcon icon={faStar} /></button>
                <button onClick={() => rateImage(1)} type="button"><FontAwesomeIcon icon={faHeart} /></button>
            </div>
        </ClientDiv>  
    );
}

export default Client;
