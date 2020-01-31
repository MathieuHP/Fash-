import React, { useState, useEffect} from 'react';
import { useHistory } from "react-router-dom";
import styled from 'styled-components';
import axios from 'axios'

import {tofrontendTitle} from '../../utils/convertTitles'
import {isEquivalent} from '../../utils/isEquivalent'

//MATERIAL UI 

import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import CardActionArea from '@material-ui/core/CardActionArea';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import TextField from '@material-ui/core/TextField';
import Modal from '@material-ui/core/Modal';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import CircularProgress from '@material-ui/core/CircularProgress';


function ImagesUploaded(props) {
    // STYLED

    const useStyles = makeStyles(theme => ({
        icon: {
            marginRight: theme.spacing(2),
        },
        heroContent: {
            backgroundColor: theme.palette.background.paper,
            padding: theme.spacing(8, 0, 6),
        },
        heroButtons: {
            marginTop: theme.spacing(4),
        },
        cardGrid: {
            paddingTop: theme.spacing(8),
            paddingBottom: theme.spacing(8),
        },
        card: {
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
        },
        cardMedia: {
            paddingTop: '56.25%', // 16:9
        },
        cardContent: {
            flexGrow: 1,
        },
        footer: {
            backgroundColor: theme.palette.background.paper,
            padding: theme.spacing(6),
        },
        titleLike: {
            paddingBottom: theme.spacing(4),
        },
        root: {
            width: '100%',
            maxWidth: 360,
            backgroundColor: theme.palette.background.paper,
        },
        formControl: {
            margin: theme.spacing(1),
            minWidth: 120,
        },
        modal: {
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
        },
        modalDiv: {
            outline: 'none',
        },
        modalContent: {
            display: 'flex',
            justifyContent: 'center',
        },
        modalContentText: {
            borderRadius: 3,
            color: 'white',
            backgroundColor: 'rgba(254, 254, 254, 0.9)',
            marginTop: 20,
            padding: 10,
        },
        modalContentTextField: {
        },
        imgModal: {
            maxWidth: '70vw',
            maxHeight: '70vh',
            borderRadius: 3,
        },
    }));

    const classes = useStyles();


    // STATE

    const [companyImages, setCompanyImages] = useState('')
    const [modifyInfos, setModifyInfos] = useState(false);
    const [hasBeenChanged, setHasBeenChanged] = useState(false);
    const [objInfo, setObjInfo] = useState({})
    const [objInfoBeforeChanges, setObjInfoBeforeChanges] = useState({});
    const [reEmail, setReEmail] = useState('');
    const [open, setOpen] = React.useState(false);
    const [imageInfoCard, setImageInfoCard] = useState({
        typeCloth: '',
        materialCloth: '',
        productionMethod: '',
        price: '',
        sex: '',
        description: ''
    });
    const [imgCardSrc, setImgCardSrc] = React.useState('')

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
                setCompanyImages([ <Typography variant="subtitle1" align="center" color="textSecondary" component="p" key="productsEmpty">You didn't post any image yet</Typography>])
            }
        } catch (err) {
            if ("msg" in list_images){
                props.setTokenState('')
                localStorage.removeItem('usertoken')
                history.push("/business")
            }
            setCompanyImages([ <Typography variant="subtitle1" align="center" color="textSecondary" component="p" key="productsEmpty">Sorry, an error occurred try again later</Typography> ])
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
        
        return (
            <Grid key={key + 'grid'} item xs={12} sm={6} md={3}>
                <Card key={key + 'card'} className={classes.card}>
                    <CardActionArea onClick={() => handleOpen(imageUrl, imageName)}>
                        <CardMedia
                            key={key + 'img'}
                            style={{ height: "300px" }}
                            className={classes.cardMedia}
                            image={imageUrl}
                        />
                    </CardActionArea>
                </Card>
            </Grid>
        )
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
                        } else if ('already_exist' in response.data) {
                            console.log("Email address already exist")
                            setObjInfo({...objInfo, email: objInfoBeforeChanges['email']})
                            setReEmail(objInfoBeforeChanges['email'])
                            setModifyInfos(false)
                            setHasBeenChanged('Email address already exist')
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

    const handleOpen = (imageUrlModal = '', imageNameModal = '') => {
        try {
            const options = {
                method: 'POST',
                body: JSON.stringify({ image_name: imageNameModal }),
            };
            fetch(`http://127.0.0.1:5000/one_image_info`, options)
            .then((response) => {
                response.json().then(function (res) {
                    setImageInfoCard(res['image_info'])
                });
            })
            setImgCardSrc(imageUrlModal)
            setOpen(true);
        } catch (error) {
            setHasBeenChanged('An error occured. Try again later please')
            props.setTokenState('')
            localStorage.removeItem('usertoken')
            history.push("/")
        }
    };
    
    const handleClose = () => {
        try {
            const options = {
                method: 'POST',
                body: JSON.stringify({ image_info_card: imageInfoCard }),
                headers: {
                    'Accept': 'application/json',
                    'Authorization': token
                }
            };
            fetch(`http://127.0.0.1:5000/update_image_info`, options)
            .then((response) => {
                response.json().then(function (res) {
                    if ('valid' in res) {
                        setHasBeenChanged('Your image informations has been updated')
                    } else if ('msg' in res) {
                        setHasBeenChanged('An error occured. Try again later please')
                        props.setTokenState('')
                        localStorage.removeItem('usertoken')
                        history.push("/")
                    }
                });
                setOpen(false);
            })
        } catch (error) {
            setHasBeenChanged('An error occured. Try again later please')
            props.setTokenState('')
            localStorage.removeItem('usertoken')
            history.push("/")
        }
    };

    return (
        <div>
            <Container component="main">
                <div>
                    <Typography variant="h3"color="primary" component="h1">
                        COMPANY PROFILE
                    </Typography>
                </div>
                <div className={classes.root}>
                    <div>
                        {
                            modifyInfos ?
                                Object.keys(objInfo).map((item, i) => {
                                    let itemFront = tofrontendTitle(item)
                                    if (item === 'email') {
                                        return (
                                            <div key={'div' + i}>
                                                <Grid key={'grid' + i}>
                                                    <TextField
                                                        key={'TextField' + i}
                                                        id="email"
                                                        label="Email Address"
                                                        name="email"
                                                        autoComplete="email"
                                                        value={objInfo[item]}
                                                        onFocus={(e) => e.target.select()}
                                                        onChange={(e) => handleInputChange(e)}
                                                    />
                                                    <TextField
                                                        key={'input' + 're' + item}
                                                        id="reEmail"
                                                        label="Email Address again"
                                                        name="reEmail"
                                                        autoComplete="reEmail"
                                                        value={reEmail}
                                                        onFocus={(e) => e.target.select()}
                                                        onChange={(e) => setReEmail(e.target.value)}
                                                    />
                                                </Grid>
                                            </div>
                                        )
                                    } else {
                                        return (
                                            <div key={'div' + i}>
                                                <TextField
                                                    key={'TextField' + i}
                                                    id={item}
                                                    label={itemFront}
                                                    name={item}
                                                    autoComplete={item}
                                                    value={objInfo[item]}
                                                    onFocus={(e) => e.target.select()}
                                                    onChange={(e) => handleInputChange(e)}
                                                />
                                            </div>
                                        )
                                    }
                                })
                            :
                                Object.keys(objInfo).map((item, i) => {
                                    let itemFront = tofrontendTitle(item)
                                    return (
                                        <ListItem key={'tr' + i}>
                                            <ListItemText key={'td' + itemFront} secondary={itemFront + ': '} />
                                            <ListItemText key={'td' + objInfo[item]} primary={objInfo[item]} />
                                        </ListItem>
                                    )
                                })
                        }
                    </div>
                    <ButtonGroup
                        orientation="vertical"
                        color="primary"
                        aria-label="vertical outlined primary button group"
                        className={classes.heroButtons}
                    >
                        {
                            modifyInfos ?
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    name="signUp"
                                    className={classes.submit}
                                    onClick={() => modifyInfo()}
                                >
                                    Submit changes
                                </Button>
                            :
                                <Button
                                    type="submit"
                                    color="primary"
                                    name="signUp"
                                    className={classes.submit}
                                    onClick={() => setModifyInfos(true)}
                                >
                                    Change informations
                                </Button>
                        }
                        <Button
                            type="submit"
                            color="primary"
                            name="signUp"
                            className={classes.submit}
                            onClick={() => { history.push("/changepwd") }}
                        >
                            Change password
                        </Button>
                        <Button
                            disabled
                            type="submit"
                            color="primary"
                            name="signUp"
                            className={classes.submit}
                            onClick={removeAccount}
                        >
                            Delete my account
                        </Button>
                    </ButtonGroup>
                </div>
                <div>
                    <Typography variant="subtitle1" color="textSecondary" component="p" className={classes.heroButtons}>
                        {hasBeenChanged}
                    </Typography>
                </div>
            </Container>
            <div>
                <Container className={classes.cardGrid} maxWidth="lg">
                    <Typography className={classes.titleLike} gutterBottom variant="h5" component="h2">Products</Typography>
                    <Grid container spacing={4}>
                        {
                            companyImages ? companyImages : <CircularProgress />
                        }
                    </Grid>
                </Container>
            </div>
            <Modal
                open={open}
                onClose={handleClose}
                className={classes.modal}
            >
                <div className={classes.modalDiv}>
                    <div className={classes.modalContent}>
                        <img src={imgCardSrc} className={classes.imgModal} alt="Logo" />
                    </div>
                    <div className={classes.modalContentText}>
                        <TextField
                            className={classes.modalContentTextField}
                            id="typeCloth"
                            label="Type of cloth:"
                            name="typeCloth"
                            autoComplete="typeCloth"
                            value={imageInfoCard['typeCloth']}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => setImageInfoCard({... imageInfoCard, ['typeCloth']: e.target.value})}
                        />
                        <TextField
                            className={classes.modalContentTextField}
                            id="materialCloth"
                            label="Cloth material:"
                            name="materialCloth"
                            autoComplete="materialCloth"
                            value={imageInfoCard['materialCloth']}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => setImageInfoCard({... imageInfoCard, ['materialCloth']: e.target.value})}
                        />
                        <TextField
                            className={classes.modalContentTextField}
                            id="productionMethod"
                            label="Production method:"
                            name="productionMethod"
                            autoComplete="productionMethod"
                            value={imageInfoCard['productionMethod']}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => setImageInfoCard({... imageInfoCard, ['productionMethod']: e.target.value})}
                        />
                        <TextField
                            className={classes.modalContentTextField}
                            id="price"
                            label="Price:"
                            name="price"
                            autoComplete="price"
                            type="number"
                            value={imageInfoCard['price']}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => setImageInfoCard({... imageInfoCard, ['price']: e.target.value})}
                        />
                        <TextField
                            className={classes.modalContentTextField}
                            id="description"
                            label="Description:"
                            name="description"
                            autoComplete="description"
                            value={imageInfoCard['description']}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => setImageInfoCard({... imageInfoCard, ['description']: e.target.value})}
                        />
                        <FormControl>
                            <InputLabel id="sexInput">Sex:</InputLabel>
                            <Select
                                labelId="sex"
                                id="sex"
                                onChange={(e) => setImageInfoCard({... imageInfoCard, ['sex']: e.target.value})}
                                value={imageInfoCard['sex']}
                                >
                                <MenuItem value={'M'}>Male</MenuItem>
                                <MenuItem value={'F'}>Female</MenuItem>
                                <MenuItem value={'ND'}>Not defined</MenuItem>
                            </Select>
                        </FormControl>
                    </div> 
                </div>
            </Modal>
        </div>  
    );
}

export default ImagesUploaded;

