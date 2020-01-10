import React, { useState, useEffect} from 'react';
import { useHistory } from "react-router-dom";
import styled from 'styled-components';
import axios from 'axios'

import {tofrontendTitle} from '../../utils/convertTitles'
import {isEquivalent} from '../../utils/isEquivalent'

function ImagesUploaded(props) {
    // STYLED

    const ImgCard = styled.img`
        width : 100px;
        height : 100px;
    `;

    // STATE

    const [companyImages, setCompanyImages] = useState('')
    const [modifyInfos, setModifyInfos] = useState(false);
    const [hasBeenChanged, setHasBeenChanged] = useState(false);
    const [objInfo, setObjInfo] = useState({})
    const [objInfoBeforeChanges, setObjInfoBeforeChanges] = useState({});
    const [reEmail, setReEmail] = useState('');

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
                    setObjInfoBeforeChanges(res)
                    setObjInfo(res)
                    setReEmail(res['email'])
                });
            })
        } catch (error) {
            localStorage.removeItem('usertoken')
            props.setTokenState('')
            history.push("/")
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
                setCompanyImages([ <p key="productsEmpty">You didn't post any image yet</p> ])
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

    const modifyInfo = () => {
        if (objInfo['email'] === reEmail) {
            if (isEquivalent(objInfoBeforeChanges, objInfo)) {
                setModifyInfos(false)
                setHasBeenChanged('No changes detected')
            } else {
                return axios
                    .post("http://127.0.0.1:5000/update_info", objInfo, {
                        headers: {
                            'Accept': 'application/json',
                            'Authorization': token
                        }
                    })
                    .then(response => {
                        if ('valid' in response.data) {
                            console.log("Informations has changed")
                            setModifyInfos(false)
                            setHasBeenChanged('Your informations has been updated')
                        } else if ('msg' in response.data) {
                            setHasBeenChanged('An error occured. Try again later please')
                            props.setTokenState('')
                            localStorage.removeItem('usertoken')
                            history.push("/")
                        }
                    })
                    .catch(error => {
                        console.log(error.response)
                    });
            }
        } else {
            setHasBeenChanged('Emails are different')
        }
    }
    
    const handleInputChange = (e) => {
        const {name, value} = e.target
        setObjInfo({...objInfo, [name]: value})
    }

    return (
        <div>
             <div>
                <h1>COMPANY PROFILE</h1>
            </div>
            <table>
                <tbody>
                    {
                        modifyInfos ?
                            Object.keys(objInfo).map((item, i) => {
                                let itemFront = tofrontendTitle(item)
                                if (item === 'email') {
                                    return (
                                        <tr key={'tr' + i}>
                                            <td key={'tdTitle' + item}>
                                                {itemFront} : 
                                            </td>
                                            <td key={'tdInput' + item}>
                                                <input key={'input' + item} type="text" name={item} id={item} placeholder={"Insert " + item} value={objInfo[item]} onFocus={(e) => e.target.select()} onChange={(e) => handleInputChange(e)} />
                                            </td>
                                            <td key={'tdTitle' + 're' + item}>
                                                Email again : 
                                            </td>
                                            <td key={'tdInput' + 're' + item}>
                                                <input key={'input' + 're' + item} type="text" name='reEmail' id={'reEmail'} placeholder={"Insert " + item + ' again'} value={reEmail} onFocus={(e) => e.target.select()} onChange={(e) => setReEmail(e.target.value)} />
                                            </td>
                                        </tr>
                                    )
                                } else {
                                    return (
                                        <tr key={'tr' + i}>
                                            <td key={'tdTitle' + item}>
                                                {itemFront} : 
                                            </td>
                                            <td key={'tdInput' + item}>
                                                <input key={'input' + item} type="text" name={item} id={item} placeholder={"Insert " + item} value={objInfo[item]} onFocus={(e) => e.target.select()} onChange={(e) => handleInputChange(e)} />
                                            </td>
                                        </tr>
                                    )
                                }
                            })
                        :
                            Object.keys(objInfo).map((item, i) => {
                                let itemFront = tofrontendTitle(item)
                                return (    
                                    <tr key={'tr' + i}>
                                        <td key={'td' + itemFront}>
                                            {itemFront} : 
                                        </td>
                                        <td key={'td' + objInfo[item]}>
                                            {objInfo[item]}
                                        </td>
                                    </tr>
                                )
                            })
                    }
                    <tr>
                        <td>
                            {
                                modifyInfos ?
                                    <button onClick={() => modifyInfo()}>Submit changes</button>
                                :
                                    <button onClick={() => setModifyInfos(true)}>Change informations</button>
                            }
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <button onClick={() => {history.push("/changepwd")}}>
                                Change password
                            </button>
                        </td>
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
                <p>
                    {hasBeenChanged}
                </p>
            </div>
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

