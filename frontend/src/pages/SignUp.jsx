import React, { useState, useEffect } from 'react';
import { useHistory } from "react-router-dom";
import axios from 'axios'

// MATERIAL UI

import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Modal from '@material-ui/core/Modal';


function SignUp() {
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
        formControl: {
            margin: theme.spacing(1),
            minWidth: 120,
        },
        selectEmpty: {
            marginTop: theme.spacing(2),
        },
        modalPaper: {
            position: 'absolute',
            width: 400,
            backgroundColor: theme.palette.background.paper,
            border: '2px solid #000',
            boxShadow: theme.shadows[5],
            padding: theme.spacing(2, 4, 3),
            outline: 'none',
            borderRadius: 3,
        },
        modal: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
        },
        titleModal: {
            marginBottom: 30,
        }
    }));

    const classes = useStyles();
    
    // STATE, USEEFFECT
    const [first_name, setFirst_name] = useState('')
    const [last_name, setLast_name] = useState('')
    const [email, setEmail] = useState('')
    const [reEmail, setReEmail] = useState('')
    const [password, setPassword] = useState('')
    const [rePassword, setRePassword] = useState('')
    const [sex, setSex] = useState('')
    const [phone, setPhone] = useState('')
    const [connectionMessage, setConnectionMessage] = useState('')
    
    const history = useHistory();
    const token = localStorage.usertoken

    const [open, setOpen] = React.useState(false);


    useEffect(() => {
        if(token){
            history.push("/client")
        }
    }, [token, history]);

    // FUNCTIONS

    const onSubmit = (e) => {
        e.preventDefault()
        if (first_name.length > 0 && last_name.length > 0 && email.length > 0 && password.length > 0 && sex.length > 0 && phone.length > 0){
            if (password === rePassword && email === reEmail) {
                const newUser = {
                    first_name: first_name,
                    last_name: last_name,
                    email: email,
                    password: password,
                    sex: sex,
                    phone: phone,
                }
                register(newUser)
            } else {
                setConnectionMessage(<Typography variant="subtitle1" align="center" color="textSecondary" component="p">Passwords or emails are different</Typography>)
            }
        } else {
            setConnectionMessage(<Typography variant="subtitle1" align="center" color="textSecondary" component="p">All fields are not complete</Typography>)
        }
    }

    const register = newUser => {
        return axios
            .post("http://127.0.0.1:5000/new_user", {
                first_name: newUser.first_name,
                last_name: newUser.last_name,
                email: newUser.email,
                password: newUser.password,
                sex: newUser.sex,
                phone: newUser.phone
            })
            .then(response => {
                if (response.data === "ok") {
                    handleOpen()
                } else if (response.data === "already exists"){
                    setConnectionMessage(<Typography variant="subtitle1" align="center" color="textSecondary" component="p">This email address already exists</Typography>)
                } else {
                    setConnectionMessage(<Typography variant="subtitle1" align="center" color="textSecondary" component="p">An error occured. Try again later please.</Typography>)
                }
            })
    }

    const handleOpen = () => {
        setOpen(true);
    };
    
    const handleClose = () => {
        setOpen(false);
        history.push("/")
    };

    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            <div className={classes.paper}>
                <Avatar className={classes.avatar}>
                    <LockOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                    Sign up
                </Typography>
                <form onSubmit={(e) => onSubmit(e)} className={classes.form} noValidate>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                autoComplete="fname"
                                name="first_name"
                                variant="outlined"
                                required
                                fullWidth
                                id="first_name"
                                label="First Name"
                                autoFocus
                                value={first_name}
                                onChange={(e) => setFirst_name(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                variant="outlined"
                                required
                                fullWidth
                                id="last_name"
                                label="Last Name"
                                name="last_name"
                                autoComplete="last_name"
                                value={last_name}
                                onChange={(e) => setLast_name(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                required
                                fullWidth
                                id="email"
                                label="Email Address"
                                name="email"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                required
                                fullWidth
                                id="reEmail"
                                label="Email Address again"
                                name="reEmail"
                                autoComplete="reEmail"
                                value={reEmail}
                                onChange={(e) => setReEmail(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                type="tel"
                                required
                                fullWidth
                                id="phone"
                                label="Phone number"
                                name="phone"
                                autoComplete="phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                type="password"
                                id="password"
                                autoComplete="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                required
                                fullWidth
                                name="rePassword"
                                label="Password again"
                                type="password"
                                id="rePassword"
                                autoComplete="re-password"
                                value={rePassword}
                                onChange={(e) => setRePassword(e.target.value)}
                            />
                        </Grid>
                    </Grid>
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
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        name="signUp"
                        className={classes.submit}
                    >
                        Register
                    </Button>
                </form>
                {connectionMessage}
            </div>
            <Modal
                open={open}
                onClose={handleClose}
                className={classes.modal}
            >
                <div className={classes.modalPaper}>
                    <Typography className={classes.titleModal} component="h5" variant="h5">
                        Thanks for signing up 
                    </Typography>
                    <Typography variant="subtitle1" align="center" color="textSecondary" component="p">
                        You will receive a confirmation email shortly.
                    </Typography>
                </div>
            </Modal>
        </Container>  
    );
}

export default SignUp;
