import React, {useState,useEffect} from 'react';
import { useHistory } from "react-router-dom";

// MATERIAL UI

import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Publish from '@material-ui/icons/Publish';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import CircularProgress from '@material-ui/core/CircularProgress';


function Company(props) {
    // STYLED

    const useStyles = makeStyles(theme => ({
        paper: {
          marginTop: theme.spacing(8),
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        },
        avatar: {
          margin: theme.spacing(1),
          backgroundColor: theme.palette.primary.main,
        },
        form: {
          width: '100%', // Fix IE 11 issue.
          marginTop: theme.spacing(3),
        },
        submit: {
          margin: theme.spacing(3, 0, 2),
        },
        formControl: {
            minWidth: 120,
        },
        selectEmpty: {
            marginTop: theme.spacing(2),
        },
        inputUpload: {
            display: 'none',
            marginBottom: theme.spacing(4),
        },
        inputUploadText: {
            marginLeft: theme.spacing(2),
        },
        title: {
            marginBottom: theme.spacing(6),
        },
    }));

    const classes = useStyles();
    
    // STATE
    const [image, setImage] = useState('')
    const [typeCloth, setTypeCloth] = useState('')
    const [materialCloth, setMaterialCloth] = useState('')
    const [productionMethod, setProductionMethod] = useState('')
    const [price, setPrice] = useState('')
    const [sex, setSex] = useState('')
    const [description, setDescription] = useState('')
    const [formValidationText, setFormValidationText] = useState('')
    const [loading, setLoading] = useState(false);

    const token = localStorage.usertoken
    const history = useHistory();

    useEffect(() => {
        if(!token){
            history.push("/business")
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
                'fromUserType' : 'company',
                'Authorization': token
            }
        };
        fetch(`http://127.0.0.1:5000/check_token`, options)
        .then((response) => {
            response.json().then(function (text) {
                if ("msg" in text) {
                    props.setTokenState('')
                    localStorage.removeItem('usertoken')
                    history.push("/business")
                    return;
                }
                props.setTokenState(token)
            });
        })
    }
    
    const checkState = (e) => {
        e.preventDefault()
        if (image) {
            setFormValidationText("")
            sendValue()
        } else {
            setFormValidationText("Make sure to add an image")
        }
    }

    const sendValue = async () => {
        console.log('ici');
        
        setLoading(true)
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
                setLoading(false)
                if ("msg" in text) {
                    props.setTokenState('')
                    localStorage.removeItem('usertoken')
                    history.push("/business/products")
                    return;
                } else if ("valid" in text) {
                    setTypeCloth('')
                    setMaterialCloth('')
                    setProductionMethod('')
                    setPrice('')
                    setSex('')
                    setDescription('')
                    setImage('')
                    setFormValidationText("Your cloth has been uploaded")
                    console.log(text["valid"]);
                }
            });
        })
    }

    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            <div className={classes.paper}>
                <Avatar className={classes.avatar}>
                    <Publish />
                </Avatar>
                <Typography className={classes.title} component="h1" variant="h5">
                    Upload cloth
                </Typography>
                <div>
                    <form onSubmit={(e) => checkState(e)}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    variant="outlined"
                                    required
                                    fullWidth
                                    id="typeCloth"
                                    label="Type of cloth"
                                    name="typeCloth"
                                    autoComplete="typeCloth"
                                    value={typeCloth}
                                    onChange={(e) => setTypeCloth(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    variant="outlined"
                                    required
                                    fullWidth
                                    id="materialCloth"
                                    label="Cloth material"
                                    name="materialCloth"
                                    autoComplete="materialCloth"
                                    value={materialCloth}
                                    onChange={(e) => setMaterialCloth(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    variant="outlined"
                                    required
                                    fullWidth
                                    id="productionMethod"
                                    label="Production method"
                                    name="productionMethod"
                                    autoComplete="productionMethod"
                                    value={productionMethod}
                                    onChange={(e) => setProductionMethod(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    variant="outlined"
                                    required
                                    fullWidth
                                    id="price"
                                    label="Price"
                                    name="price"
                                    autoComplete="price"
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl className={classes.formControl} required>
                                    <InputLabel id="sex">Gender</InputLabel>
                                    <Select
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        onChange={(e) => setSex(e.target.value)}
                                        value={sex}
                                    >
                                        <MenuItem value={'M'}>Male</MenuItem>
                                        <MenuItem value={'F'}>Female</MenuItem>
                                        <MenuItem value={'ND'}>Not defined</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    variant="outlined"
                                    required
                                    fullWidth
                                    id="desciption"
                                    label="Description"
                                    name="desciption"
                                    autoComplete="desciption"
                                    value={description}
                                    multiline
                                    rows="4"
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <input
                                    accept="image/*"
                                    className={classes.inputUpload}
                                    id="contained-button-file"
                                    multiple
                                    type="file"
                                    onChange={(e) => setImage(e.target.files)}
                                />
                                <label htmlFor="contained-button-file">
                                    <Button color="primary" component="span">
                                        Select an image
                                    </Button>
                                </label>
                                <Typography variant="subtitle1" align="center" color="textSecondary" component="span" className={classes.inputUploadText}>{image ? image[0].name : ''}</Typography>
                            </Grid>
                        </Grid>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            name="signUp"
                            className={classes.submit}
                        >
                            Upload cloth
                        </Button>
                        { 
                            loading ? 
                                <CircularProgress />
                            :
                                <Typography variant="subtitle1" align="center" color="textSecondary" component="p">{formValidationText}</Typography>
                        }
                    </form>
                </div>
            </div>
        </Container>
    );
}

export default Company;
