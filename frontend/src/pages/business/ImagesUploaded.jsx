import React, { useState, useEffect} from 'react';
import { useHistory } from "react-router-dom";
import styled from 'styled-components';
import jwt_decode from 'jwt-decode'

function ImagesUploaded(props) {
    // STYLED

    const ImgCard = styled.img`
        width : 100px;
        height : 100px;
    `;

    // STATE

    const [companyImages, setCompanyImages] = useState('')
    const [companyName, setCompanyName] = useState('')
    const [location, setLocation] = useState('')
    const [email, setEmail] = useState('')

    const token = localStorage.usertoken
    const history = useHistory();

    useEffect(() => {
        if(!token){
            history.push("/business")
        } else {
            getProfileInfo();
            getImagesUploaded()
        }
      }, []);

    // FUNCTIONS

    const getProfileInfo = () => {
        try {
            const decoded = jwt_decode(token)
            setCompanyName(decoded.identity.company_name)
            setLocation(decoded.identity.location)
            setEmail(decoded.identity.email)
        } catch (error) {
            console.log("Not connected");
            localStorage.removeItem('usertoken')
            history.push("/business")
        }
    }

    const getImagesUploaded = async () => {
        const options = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Authorization': token
            },
        };
        const response = await fetch(`http://127.0.0.1:5000/images_uploaded`, options)
        let list_images = await response.json()

        try {
            props.setTokenState(token)
            if(!(list_images["company_list_images"].length === 0)) {
                let company_images = []
                for (let i = 0; i < list_images["company_list_images"].length; i++) {
                    company_images.push(await getImage(i + 'SL', list_images["company_list_images"][i]))
                }
                setCompanyImages(company_images)
            } else {
                setCompanyImages([ <p key="productsEmpty">Your didn't like any image yet</p> ])
            }
        } catch (err) {
            if ("msg" in list_images){
                props.setTokenState('')
                localStorage.removeItem('usertoken')
                history.push("/business")
            }
            setCompanyImages([ <p key="productsEmpty">Sorry, an error occurred try again later</p> ])
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
                history.push("/business")
                return;
            });
        })
    }

    return (
        <div>
             <div>
                <h1>COMPANY PROFILE</h1>
            </div>
            <table>
                <tbody>
                    <tr>
                        <td>Company Name :</td>
                        <td>{companyName}</td>
                    </tr>
                    <tr>
                        <td>Location : </td>
                        <td>{location}</td>
                    </tr>
                    <tr>
                        <td>Email : </td>
                        <td>{email}</td>
                    </tr>
                    {/* <tr>
                        <td>
                            <button onClick={removeAccount}>
                                Delete company account
                            </button>
                        </td>
                    </tr> */}
                </tbody>
            </table>
            <div>
                <h3>Products</h3>
                <div>
                {
                    companyImages ? companyImages : <p>Loading ...</p>
                }
                </div>
            </div>
        </div>  
    );
}

export default ImagesUploaded;

