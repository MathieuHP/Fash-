import React, {useState,useEffect} from 'react';
import styled from 'styled-components';
import { useHistory } from "react-router-dom";


function Company() {
    // STYLED
    
    // STATE
    const [image, setImage] = useState('')
    const [typeCloth, setTypeCloth] = useState('')
    const [materialCloth, setMaterialCloth] = useState('')
    const [productionMethod, setProductionMethod] = useState('')
    const [price, setPrice] = useState('')
    const [sex, setSex] = useState('')
    const [description, setDescription] = useState('')
    const [formValidationText, setFormValidationText] = useState('')

    const token = localStorage.usertoken
    const history = useHistory();

    useEffect(() => {
        if(!token){
            history.push("/")
        } else {
            checkToken()
        }
    }, []);

    // FUNCTIONS

    const checkToken = () => {
        const options = {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': token
            }
        };
        fetch(`http://127.0.0.1:5000/check_token`, options)
        .then((response) => {
            response.json().then(function (text) {
                if ("msg" in text) {
                    localStorage.removeItem('usertoken')
                    history.push("/")
                    return;
                }
            });
        })
    }
    
    const checkState = (e) => {
        e.preventDefault()
        if (image) {
            setFormValidationText("")
            sendValue()
        } else {
            setFormValidationText("Make sure to add an image !")
        }
    }

    const sendValue = async () => {
        const formDataObj = {
            imageFile : image[0],
            typeCloth : typeCloth,
            materialCloth : materialCloth,
            productionMethod : productionMethod,
            price : price,
            sex : sex,
            description : description
        }

        const formData = new FormData();
        for ( var key in formDataObj ) {
            formData.append(key, formDataObj[key]);
        }
        const options = {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json',
                'Authorization': token
            }
        };
        fetch(`http://127.0.0.1:5000/upload_image`, options)
        .then((response) => {
            response.json().then(function (text) {
                if ("msg" in text) {
                    localStorage.removeItem('usertoken')
                    history.push("/")
                    return;
                } else if ("valid" in text) {
                    console.log(text["valid"]);
                }
            });
        })
    }

    return (
        <div>
            <div>
                <h1>
                    Company
                </h1>
            </div>
            <div>
                <form onSubmit={(e) => checkState(e)}>
                    <h3>
                        Upload cloth
                    </h3>
                    <div>
                        <label htmlFor="uploadImage">Cloth image : </label>
                        <input type="file" id="uploadImage" name="uploadImage" onChange={(e) => setImage(e.target.files)}/>
                    </div>
                    <div>
                        <label htmlFor="typeCloth">Type of cloth : </label>
                        <input type="text" id="typeCloth" value={typeCloth} onChange={(e) => setTypeCloth(e.target.value)}/>
                    </div>
                    <div>
                        <label htmlFor="materialCloth">Cloth material : </label>
                        <input type="text" id="materialCloth" value={materialCloth} onChange={(e) => setMaterialCloth(e.target.value)}/>
                    </div>
                    <div>
                        <label htmlFor="productionMethod">Production method : </label>
                        <input type="text" id="productionMethod" value={productionMethod} onChange={(e) => setProductionMethod(e.target.value)}/>
                    </div>
                    <div>
                        <label htmlFor="price">Price : </label>
                        <input type="text" id="price" value={price} onChange={(e) => setPrice(e.target.value)}/>
                    </div>
                    <div>
                        <label htmlFor="sex">Sex : </label>
                        <input type="text" id="sex" value={sex} onChange={(e) => setSex(e.target.value)}/>
                    </div>
                    <div>
                        <label htmlFor="desciption">Description : </label>
                        <textarea type="text" id="desciption" value={description} onChange={(e) => setDescription(e.target.value)}/>
                    </div>
                    <div>
                        <input type="submit" name="submitCloth" value="Submit"/>
                        <p>{formValidationText}</p>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Company;
