import React, { useEffect, useState } from 'react';
import { NavLink, useHistory } from "react-router-dom";
import jwt_decode from 'jwt-decode'

// MATERIAL UI

import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';


const useStyles = makeStyles(theme => ({
    root: {
        marginBottom: theme.spacing(4),
        flexGrow: 1,
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    title: {
        flexGrow: 1,
        display: 'flex',
    },
    navTitle: {
        marginRight: theme.spacing(4),
        textDecoration: 'none',
        color: 'white',
    }
}));


function NavClient(props) {
    const classes = useStyles();
    return (
        <div className={classes.root}>
            <AppBar position="static">
                <Container>
                    <Toolbar>
                        <nav className={classes.title}>
                            <NavLink to="/client" className={classes.navTitle}>
                                <Typography variant="h6">
                                    Clothes
                                </Typography>
                            </NavLink>
                            <NavLink to="/cart" className={classes.navTitle}>
                                <Typography variant="h6">
                                    Profile
                                </Typography>
                            </NavLink>
                        </nav>
                        <Button onClick={() => props.logOut(props.navUserType)} color="inherit">Log out</Button>
                    </Toolbar>
                </Container>
            </AppBar>
        </div>
    );
}

function NavBusiness(props) {
    const classes = useStyles();
    return (
        <div className={classes.root}>
            <AppBar position="static">
            <Container>
                <Toolbar>
                    <nav className={classes.title}>
                        <NavLink to="/business/company" className={classes.navTitle}>
                            <Typography variant="h6">
                                Upload cloth
                            </Typography>
                        </NavLink>
                        <NavLink to="/business/products" className={classes.navTitle}>
                            <Typography variant="h6">
                                Company profile
                            </Typography>
                        </NavLink>
                    </nav>
                    <Button onClick={() => props.logOut(props.navUserType)} color="inherit">Log out</Button>
                </Toolbar>
            </Container>
            </AppBar>
        </div>
    );
}

function NavLog() {
    const classes = useStyles();
    return (
        <div className={classes.root}>
            <AppBar position="static">
            <Container>
                <Toolbar>
                    <nav className={classes.title}>
                        <NavLink to="/" className={classes.navTitle}>
                            <Typography variant="h6">
                                Home
                            </Typography>
                        </NavLink>
                        <NavLink to="/business" className={classes.navTitle}>
                            <Typography variant="h6">
                                Business
                            </Typography>
                        </NavLink>
                    </nav>
                </Toolbar>
            </Container>
            </AppBar>
        </div>
    );
}

function Nav(props) {
     // STYLED
    
    // STATE, USEFFECT, HISTORY, TOKEN
    const [navContent, setNavContent] = useState('');

    const history = useHistory(); 

    useEffect(() => {
        if(props.tokenState){
            const decoded = jwt_decode(props.tokenState)
            if (decoded.identity.userType === "client") {
                setNavContent([<NavClient key={'navClient'} logOut={logOut} navUserType={"client"} />])
            } else if (decoded.identity.userType === "company"){
                setNavContent([<NavBusiness key={'navBusiness'} logOut={logOut} navUserType={"company"} />])
            } else {
                setNavContent([<NavLog key={'navLog'} />])
            }
        } else {
            setNavContent([<NavLog key={'navLog'} />])
        }
    }, [props.tokenState]);
 
     // FUNCTIONS

    const logOut = (userType) => {
        let pushTo = '/'
        if (userType === "company") {
            pushTo = '/business'
        }
        const options = {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Authorization': props.tokenState
            }
        };
        fetch(`http://127.0.0.1:5000/logout`, options)
        .then((response) => {
            response.json().then(function(resText) {
                if ("msg" in resText) {
                    localStorage.removeItem('usertoken')
                    history.push(pushTo)
                    return;
                }
            });
        })
    }

    return (
        <div>
            {navContent}
        </div>  
    );
}

export default Nav;
