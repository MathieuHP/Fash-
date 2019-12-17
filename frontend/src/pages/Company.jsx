import React, {useState} from 'react';
import styled from 'styled-components';

function Company() {
    // STYLED
    const CompanyDiv = styled.div`
    `;
    
    // STATE
    const [image, setImage] = useState('')
    const [typeCloth, setTypeCloth] = useState('')
    const [materialCloth, setMaterialCloth] = useState('')
    const [productionMethod, setProductionMethod] = useState('')
    const [price, setPrice] = useState('')
    const [sex, setSex] = useState('')
    const [description, setDescription] = useState('')
    const [formValidationText, setFormValidationText] = useState('')

    // FUNCTIONS
    
    const checkState = () => {
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
        };
        fetch(`http://127.0.0.1:5000/upload_image`, options)
        .then((response) => {
            response.text().then(function (text) {
                console.log(text)
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
                <h3>
                    Upload cloth
                </h3>
                <div>
                    <label htmlFor="uploadImage">Cloth image : </label>
                    <input type="file" id="uploadImage" name="uploadImage" onChange={(e) => setImage(e.target.files)}/>
                </div>
                <div>
                    <label htmlFor="typeCloth">Type of cloth : </label>
                    <input type="text" name="typeCloth" value={typeCloth} onChange={(e) => setTypeCloth(e.target.value)}/>
                </div>
                <div>
                    <label htmlFor="materialCloth">Cloth material : </label>
                    <input type="text" name="materialCloth" value={materialCloth} onChange={(e) => setMaterialCloth(e.target.value)}/>
                </div>
                <div>
                    <label htmlFor="productionMethod">Production method : </label>
                    <input type="text" name="productionMethod" value={productionMethod} onChange={(e) => setProductionMethod(e.target.value)}/>
                </div>
                <div>
                    <label htmlFor="price">Price : </label>
                    <input type="text" name="price" value={price} onChange={(e) => setPrice(e.target.value)}/>
                </div>
                <div>
                    <label htmlFor="sex">Sex : </label>
                    <input type="text" name="sex" value={sex} onChange={(e) => setSex(e.target.value)}/>
                </div>
                <div>
                    <label htmlFor="desciption">Description : </label>
                    <textarea type="text" name="desciption" value={description} onChange={(e) => setDescription(e.target.value)}/>
                </div>
                <div>
                    <input type="submit" name="submitCloth" value="Submit" onClick={() => checkState()}/>
                    <p>{formValidationText}</p>
                </div>
            </div>
        </div>
    );
}

export default Company;
