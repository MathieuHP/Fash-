import React, {useState} from 'react';
import styled from 'styled-components';

function Company() {
    // STYLED
    const CompanyDiv = styled.div`
    `;
    
    // STATE
    const [image, setImage] = useState('')
    const [typeCLoth, setTypeCLoth] = useState('')
    const [materialCloth, setMaterialCloth] = useState('')
    const [productionMethod, setProductionMethod] = useState('')
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

    const sendValue = () => {
        console.log(image)
        console.log(typeCLoth)
        console.log(materialCloth)
        console.log(productionMethod)
        console.log("Send values to backend");
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
                    <input type="file" name="uploadImage" onChange={(e) => setImage(e.target.value)}/>
                </div>
                <div>
                    <label htmlFor="typeCloth">Type of cloth : </label>
                    <input type="text" name="typeCloth" value={typeCLoth} onChange={(e) => setTypeCLoth(e.target.value)}/>
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
                    <input type="submit" name="submitCloth" value="Submit" onClick={() => checkState()}/>
                    <p>{formValidationText}</p>
                </div>
            </div>
        </div>
    );
}

export default Company;
