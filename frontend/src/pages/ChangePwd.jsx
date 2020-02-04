import React, { useEffect, useState } from 'react'
import { useHistory, NavLink } from "react-router-dom";
import axios from 'axios'
import jwt_decode from 'jwt-decode'

// MATERIAL UI

import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';


function ChangePwd(props) {
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
          backgroundColor: theme.palette.secondary.main,
        },
        form: {
          width: '100%', // Fix IE 11 issue.
          marginTop: theme.spacing(3),
        },
        submit: {
          margin: theme.spacing(3, 0, 2),
        },
        cancel: {
            textDecoration: 'none',
        }
    }));

    const classes = useStyles();

    
    // STATE, USEEFFECT
    const [oldPassword, setOldPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [rePassword, setRePassword] = useState('')
    const [infoMsg, setInfoMsg] = useState('');
    
    const token = localStorage.usertoken
    const history = useHistory();

    useEffect(() => {
        if(!token){
            history.push("/")
        } else {
            checkToken()
        }
    }, [token, history]);

    // FUNCTIONS

    const checkToken = () => {
        const decoded = jwt_decode(token)
        const userType = decoded.identity.userType

        const options = {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'fromUserType' : userType,
                'Authorization': token
            }
        };

        fetch(`http://127.0.0.1:5000/check_token`, options)
        .then((response) => {
            let pushTo = '/'
            if (userType === "company") {
                pushTo = '/business'
            }
            response.json().then(function (text) {
                if ("msg" in text) {
                    props.setTokenState('')
                    localStorage.removeItem('usertoken')
                    history.push(pushTo)
                    return;
                } else if ("valid" in text) {
                    props.setTokenState(token)
                }
            });
            
        })
    }

    const onSubmit = (e) => {
        e.preventDefault()
        if (newPassword === rePassword) {
            return axios.post("http://127.0.0.1:5000/change_pwd", {
                old_password: oldPassword,
                new_password: newPassword
            }, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': token
                }
            })
            .then(response => {
                const decoded = jwt_decode(token)
                const userType = decoded.identity.userType
                let pushTo = '/'
                let pushToCart = "/cart"
                
                if (userType === "company") {
                    pushTo = '/business'
                    pushToCart = "/business/products"
                }

                if ("valid" in response.data) {
                    setInfoMsg(<Typography variant="subtitle1" align="center" color="textSecondary" component="p">Password has been updated</Typography>)
                    history.push(pushToCart)
                } else if ("msg" in response.data){
                    setInfoMsg(<Typography variant="subtitle1" align="center" color="textSecondary" component="p">This email address already exists</Typography>)
                    props.setTokenState('')
                    localStorage.removeItem('usertoken')
                    history.push(pushTo)
                } else if ("info" in response.data){
                    setInfoMsg(<Typography variant="subtitle1" align="center" color="textSecondary" component="p">Old password is wrong</Typography>)
                } else {
                    props.setTokenState('')
                    localStorage.removeItem('usertoken')
                    history.push(pushTo)
                }
            })
        } else {
            setInfoMsg(<Typography variant="subtitle1" align="center" color="textSecondary" component="p">Passwords are different</Typography>)
        }
    }

    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            <div className={classes.paper}>
                <Typography component="h1" variant="h5">
                    Change password
                </Typography>
                <form className={classes.form} noValidate onSubmit={(e) => onSubmit(e)}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            variant="outlined"
                            required
                            fullWidth
                            name="oldPassword"
                            label="Old password"
                            type="password"
                            id="oldPassword"
                            autoComplete="old-password"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            variant="outlined"
                            required
                            fullWidth
                            name="newPassword"
                            label="New password"
                            type="password"
                            id="newPassword"
                            autoComplete="new-password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </Grid>
                     <Grid item xs={12}>
                        <TextField
                            variant="outlined"
                            required
                            fullWidth
                            name="rePassword"
                            label="New password again"
                            type="password"
                            id="rePassword"
                            autoComplete="re-password"
                            value={rePassword}
                            onChange={(e) => setRePassword(e.target.value)}
                        />
                    </Grid>
                </Grid>
                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    name="changePwd"
                    className={classes.submit}
                >
                    Change password
                </Button>
                <NavLink to='/cart' className={classes.cancel}>
                    <Button variant="outlined" fullWidth color="primary">
                        Cancel changes
                    </Button>
                </NavLink>
                </form>
                {infoMsg}
            </div>
        </Container>
    )
}

export default ChangePwd
