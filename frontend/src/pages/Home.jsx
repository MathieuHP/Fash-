import React, { useState, useEffect } from 'react';
import { NavLink, useHistory } from "react-router-dom";
import { useParams} from "react-router";
import axios from 'axios'

// MATERIAL UI
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Face from '@material-ui/icons/Face';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';


function Home(props) {
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
		signUp: {
			textDecoration: 'none',
		}
	}));
	
	const classes = useStyles();

    // STATE
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
	const [connectionMessage, setConnectionMessage] = useState('')
	const [emailConfirm, setEmailConfirm] = useState('')

    const history = useHistory();
	const token = localStorage.usertoken
	let { mail } = useParams();

    useEffect(() => {
        if(token){
            props.setTokenState(token)
            history.push("/client")
        } else {
			props.setTokenState('')
			if (mail === 'confirm') {
				setEmailConfirm(<Typography variant="subtitle1" align="center" color="textSecondary" component="h6">Your email has been verified</Typography>)
			}
        }
    }, [token, history, props, mail]);

    // FUNCTIONS

    const onSubmit = (e) => {
        e.preventDefault()
        const user = {
            email: email,
            password: password
        }
        login(user)
    }

    const login = (user) => {
        return axios.post("http://127.0.0.1:5000/login", {
            email: user.email,
            password: user.password,
            userType: "client"
        }).then(response => {
            if (response.data) {
                localStorage.setItem('usertoken', response.data.token)
                props.setTokenState(response.data.token)
                history.push("/client")
            } else {
                console.log("Cannot connect");
                setConnectionMessage('Wrong email or password')
            }
        })
        .catch(err => {
            console.log(err)
        })
	}

    return (
        <Container component="main" maxWidth="xs">
			<div className={classes.paper}>
				<Avatar className={classes.avatar}>
					<Face />
				</Avatar>
				<Typography component="h1" variant="h5">
					Log In
				</Typography>
				{emailConfirm}
				<form onSubmit={(e) => onSubmit(e)} className={classes.form} noValidate>
					<Grid container spacing={2}>
						<Grid item xs={12}>
							<TextField
								autoFocus
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
								name="password"
								label="Password"
								type="password"
								id="password"
								autoComplete="current-password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
							/>
						</Grid>
					</Grid>
					<Button
						type="submit"
						fullWidth
						variant="contained"
						color="primary"
						className={classes.submit}
					>
						Log In
					</Button>
				</form>
			</div>
			<NavLink to="/signup" className={classes.signUp}>
				<Button variant="outlined" fullWidth color="primary">
					Sign up
				</Button>
			</NavLink>
			<Typography variant="subtitle1" align="center" color="textSecondary" component="p">{connectionMessage}</Typography>
        </Container>  
    );
}

export default Home;
