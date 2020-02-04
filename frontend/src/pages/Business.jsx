import React, { useState, useEffect } from 'react';
import { NavLink, useHistory } from "react-router-dom";
import axios from 'axios'

// MATERIAL UI
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import BusinessIcon from '@material-ui/icons/Business';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';


function Business(props) {
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
		signUp: {
			textDecoration: 'none',
		}
    }));
    
    const classes = useStyles();
    
    // STATE
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [connectionMessage, setConnectionMessage] = useState('')

    const history = useHistory();
    const token = localStorage.usertoken

    useEffect(() => {
        if(token){
            props.setTokenState(token)
            history.push("/business/company")
        } else {
            props.setTokenState('')
        }
    }, [token, history, props]);

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
            userType: "company"
        }).then(response => {
            if (response.data) {
                localStorage.setItem('usertoken', response.data.token)
                props.setTokenState(response.data.token)
                history.push("/business/company")
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
					<BusinessIcon />
				</Avatar>
				<Typography component="h1" variant="h5">
					Business
				</Typography>
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
						Log In as company
					</Button>
				</form>
			</div>
			<NavLink to="/business/signupbusiness" className={classes.signUp}>
				<Button variant="outlined" fullWidth color="primary">
					Sign up as company
				</Button>
			</NavLink>
			<Typography variant="subtitle1" align="center" color="textSecondary" component="p">{connectionMessage}</Typography>
        </Container>  
        // <div>
        //     <div>
        //         <form onSubmit={(e) => onSubmit(e)}>
        //             <div>
        //                 <label htmlFor="email">Email Address</label>
        //                 <input type="email" name="email" id="email" placeholder="Insert Email" required value={email} onChange={(e) => setEmail(e.target.value)}/>
        //             </div>
        //             <div>
        //                 <label htmlFor="password">Password </label>
        //                 <input type="password" name="password" id="password" placeholder="Insert Password" required value={password} onChange={(e) => setPassword(e.target.value)}/>
        //             </div>
        //             <div>
        //                 <input type="submit" name="login" value="Log in"/>
        //                 <p>{connectionMessage}</p>
        //             </div>
        //         </form>
        //     </div>
        //     <div>
        //         <Link to="/business/signupbusiness">Sign up as company</Link>
        //     </div>
        // </div>  
    );
}

export default Business;
