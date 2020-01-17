import React, {useState, useEffect} from 'react';
import styled from 'styled-components';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import { faTimes, faStar, faHeart } from '@fortawesome/free-solid-svg-icons'
import { useHistory } from "react-router-dom";

// MATERIAL UI
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Fab from '@material-ui/core/Fab';
import FavoriteIcon from '@material-ui/icons/Favorite';
import CrossIcon from '@material-ui/icons/Clear';
import StarIcon from '@material-ui/icons/Star';

function Client(props) {
    // STYLED

    const useStyles = makeStyles(theme =>({
        card: {
        maxWidth: 500,
        },
        media: {
            height: 500,
        },
        CardActions: {
            justifyContent: 'center',
        },
        root: {
            '& > *': {
              margin: theme.spacing(1),
            },
        },
        extendedIcon: {
            marginRight: theme.spacing(1),
        },
    }))

    const classes = useStyles();

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
                        props.setTokenState('')
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
        <Container component="main" maxWidth="xs">
            <div className={classes.paper}>
                {
                    imageSrc ?
                    <Card className={classes.card}>
                        <CardMedia
                            className={classes.media}
                            image={imageSrc}
                            title="fash"
                        />
                        <CardContent>
                            <Typography component="p">
                                {name}
                            </Typography>
                            <Typography component="p">
                                {typeCloth}
                            </Typography>
                            <Typography component="p">
                                {materialCloth}
                            </Typography>
                            <Typography component="p">
                                {productionMethod}
                            </Typography>
                            <Typography component="p">
                                {price}
                            </Typography>
                            <Typography component="p">
                                {sex}
                            </Typography>
                            <Typography component="p">
                                {description}
                            </Typography>
                        </CardContent>
                        <CardActions className={classes.CardActions}>
                            <div className={classes.root}>
                                <Fab onClick={() => rateImage(0)} aria-label="dislike" title="Dislike">
                                    <CrossIcon />
                                </Fab>
                                <Fab onClick={() => rateImage(2)} color="primary" aria-label="superLike" title="Super like">
                                    <StarIcon />
                                </Fab>
                                <Fab onClick={() => rateImage(1)} color="secondary" aria-label="like" title="Like">
                                    <FavoriteIcon />
                                </Fab>
                            </div>
                        </CardActions>
                    </Card> 
                    :
                    <Typography variant="subtitle1" align="center" color="textSecondary" component="p">Loading ...</Typography>
                }
            </div>
        </Container>
    );
}

export default Client;
