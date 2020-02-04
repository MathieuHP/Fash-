import React, { useState, useEffect } from 'react';
import { useHistory } from "react-router-dom";
import axios from 'axios'

import { tofrontendTitle } from '../utils/convertTitles'
import { isEquivalent } from '../utils/isEquivalent'

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
import Divider from '@material-ui/core/Divider';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import Modal from '@material-ui/core/Modal';
import CircularProgress from '@material-ui/core/CircularProgress';


function Cart(props) {
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
        },
        modalContentText: {
            color: 'white',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            marginTop: 20,
            padding: 10,
        },
        modalContentTextSpan: {
            color: "Gray"
        },
        imgModal: {
            maxWidth: '70vw',
            maxHeight: '70vh',
            borderRadius: 3,
        },
    }));

    const classes = useStyles();

    // STATE
    const [cartImageL, setCartImageL] = useState('')
    const [cartImageSL, setCartImageSL] = useState('')
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
        description: ''
    });
    const [imgCardSrc, setImgCardSrc] = React.useState('')


    const token = localStorage.usertoken
    const history = useHistory();

    useEffect(() => {
        if (!token) {
            history.push("/")
        } else {
            getProfileInfo();
            getCart()
        }
    }, [history, token]);

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
            props.setTokenState('')
            localStorage.removeItem('usertoken')
            history.push("/")
        }
    }

    const getCart = async () => {
        const options = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Authorization': token
            },
        };
        const response = await fetch(`http://127.0.0.1:5000/cart`, options)
        let cart = await response.json()
        try {
            props.setTokenState(token)
            if (!(cart["super_like"].length === 0)) {
                let super_like = []
                for (let i = 0; i < cart["super_like"].length; i++) {
                    super_like.push(await getImage(i + 'SL', cart["super_like"][i]))
                }
                setCartImageSL(super_like)
            } else {
                setCartImageSL([<Typography variant="subtitle1" align="center" color="textSecondary" component="p" key="cartSLEmpty">You didn't super like any image yet</Typography>])
            }
            if (!(cart["like"].length === 0)) {
                let like = []
                for (let i = 0; i < cart["like"].length; i++) {
                    like.push(await getImage(i + "L", cart["like"][i]))
                }
                setCartImageL(like)
            } else {
                setCartImageL([<Typography variant="subtitle1" align="center" color="textSecondary" component="p" key="cartSLEmpty">You didn't super like any image yet</Typography>])
            }
        } catch (err) {
            if ("msg" in cart) {
                props.setTokenState('')
                localStorage.removeItem('usertoken')
                history.push("/")
            }
            setCartImageSL([<Typography variant="subtitle1" align="center" color="textSecondary" component="p" key="cartSLEmpty">Sorry, an error occurred try again later</Typography>])
            setCartImageL([<Typography variant="subtitle1" align="center" color="textSecondary" component="p" key="cartLEmpty">Sorry, an error occurred try again later</Typography>])
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
                    props.setTokenState('')
                    localStorage.removeItem('usertoken')
                    history.push("/")
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
        const { name, value } = e.target
        setObjInfo({ ...objInfo, [name]: value })
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
        setOpen(false);
    };

    return (
        <div>
            <Container component="main">
                <div>
                    <Typography variant="h3"color="primary" component="h1">
                        PROFILE
                    </Typography>
                </div>
                <div className={classes.root}>
                    <div>
                    {
                        modifyInfos ?
                            Object.keys(objInfo).map((item, i) => {
                                let itemFront = tofrontendTitle(item)
                                if (item === 'sex') {
                                    return (
                                        <div key={'div' + i}>
                                            <FormControl key={"FormControl" + i} className={classes.formControl} required>
                                                <InputLabel key={"InputLabel" + i} id="sex">Gender</InputLabel>
                                                <Select
                                                    key={"Select" + i}
                                                    labelId="demo-simple-select-label"
                                                    id="demo-simple-select"
                                                    onChange={(e) => handleInputChange(e)}
                                                    name='sex'
                                                    value={objInfo['sex']}
                                                >
                                                    <MenuItem key={"MenuItemM" + i} selected={objInfo['sex'] === 'M' ? true : false} value={'M'}>Male</MenuItem>
                                                    <MenuItem key={"MenuItemF" + i} selected={objInfo['sex'] === 'F' ? true : false} value={'F'}>Female</MenuItem>
                                                    <MenuItem key={"MenuItemND" + i} selected={objInfo['sex'] === 'ND' ? true : false} value={'ND'}>Not defined</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </div>
                                    )
                                } else if (item === 'email') {
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
                                                    key={'inputre' + item}
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
                    <Typography className={classes.titleLike} gutterBottom variant="h5" component="h2">Super like</Typography>
                    <Grid container spacing={4}>
                        {
                            cartImageSL ? cartImageSL :  <CircularProgress />
                        }
                    </Grid>
                </Container>
            </div>
            <Divider />
            <div>
                <Container className={classes.cardGrid} maxWidth="lg">
                    <Typography className={classes.titleLike} gutterBottom variant="h5" component="h2">Like</Typography>
                    <Grid container spacing={4}>
                        {
                            cartImageL ? cartImageL :  <CircularProgress />
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
                        <Typography color="initial" component="p">
                            <span className={classes.modalContentTextSpan}>Type of cloth: </span> {imageInfoCard['typeCloth']}
                        </Typography>
                        <Typography color="initial" component="p">
                            <span className={classes.modalContentTextSpan}>Cloth material:</span> {imageInfoCard['materialCloth']}
                        </Typography>
                        <Typography color="initial" component="p">
                            <span className={classes.modalContentTextSpan}>Production method:</span> {imageInfoCard['productionMethod']}
                        </Typography>
                        <Typography color="initial" component="p">
                            <span className={classes.modalContentTextSpan}>Price:</span> {imageInfoCard['price']}
                        </Typography>
                        <Typography color="initial" component="p">
                            <span className={classes.modalContentTextSpan}>Description:</span>{imageInfoCard['description']}
                        </Typography>
                    </div> 
                </div>
            </Modal>
        </div>
    );
}

export default Cart;

