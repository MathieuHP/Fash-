import React, {useState, useEffect} from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes, faStar, faHeart } from '@fortawesome/free-solid-svg-icons'
import { useHistory } from "react-router-dom";

function Client(props) {
    // STYLED
    const ClientDiv = styled.div`
    `;

    const ClothImg = styled.img`
        max-width : 640px;
        max-height : 640px;
        height : 500px;
    `;

    // STATE, EFFECT
    const [imageSrc, setImageSrc] = useState('')
    const [imageList, setImageList] = useState([])
    const [name, setName] = useState('')
    const [typeCloth, setTypeCloth] = useState('')
    const [materialCloth, setMaterialCloth] = useState('')
    const [productionMethod, setProductionMethod] = useState('')
    const [price, setPrice] = useState('')
    const [sex, setSex] = useState('')
    const [description, setDescription] = useState('')

    const token = localStorage.usertoken
    const history = useHistory();

    useEffect(() => {
        if(!token){
            history.push("/")
        } else {
            getListImages();
        }
    }, []);
    
    // FUNCTIONS
    const getListImages = async () => {
        const options = {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': token
            }
        };
        fetch(`http://127.0.0.1:5000/load_image_for_rating`, options)
        .then((response) => {
            response.json().then(function (listImageFromBackend) {
                if ("msg" in listImageFromBackend) {
                    props.setTokenState('')
                    localStorage.removeItem('usertoken')
                    history.push("/")
                    return;
                }

                props.setTokenState(token)
                let iL = imageList.concat(listImageFromBackend)
                setImageList(iL)
                if (!imageSrc) {
                    showImage(iL[0])
                }
            });
        })
    };

    const showImage = async (imageInfo) => {
        setName(imageInfo["name"])
        setTypeCloth(imageInfo["typeCloth"])
        setMaterialCloth(imageInfo["productionMethod"])
        setProductionMethod(imageInfo["productionMethod"])
        setPrice(imageInfo["price"])
        setSex(imageInfo["sex"])
        setDescription(imageInfo["description"])

        const options = {
            method: 'POST',
            body: JSON.stringify({ imageName: imageInfo["name"] }),
        };
        fetch(`http://127.0.0.1:5000/show_image`, options)
        .then((response) => {
            response.blob().then(function (imageUrl) { 
                var urlCreator = window.URL || window.webkitURL;
                imageUrl = urlCreator.createObjectURL(imageUrl);
                setImageSrc(imageUrl);
            });
        })
    }

    const rateImage = (value) => {
        try {
            const options = {
                method: 'POST',
                body: JSON.stringify({ imageName: imageList[0]["name"], rating: value }),
                headers: {
                    'Accept': 'application/json',
                    'Authorization': token
                }
            };
            fetch(`http://127.0.0.1:5000/rate_image`, options)
            .then((response) => {
                response.json().then(function(resText) {
                    if ("msg" in resText) {
                    localStorage.removeItem('usertoken')
                    history.push("/")
                    return;
                } else if ("valid" in resText)
                    console.log(resText["valid"]);   
                });
            })
            let iL = imageList
            iL.shift()
            if (iL.length === 0) {
                console.log("Loading new images...")
            } else if (iL.length < 7) {
                getListImages()
                showImage(iL[0])
                setImageList(iL)
            } else {
                showImage(iL[0])
                setImageList(iL)
            }
        } catch (err) {
            console.log("Loading images ...");
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
                {
                    imageSrc ? <ClothImg src={imageSrc} alt="image"/> : <p>Loading ...</p>
                }
                <p>{name}</p>
                <p>{typeCloth}</p>
                <p>{materialCloth}</p>
                <p>{productionMethod}</p>
                <p>{price}</p>
                <p>{sex}</p>
                <p>{description}</p>
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
