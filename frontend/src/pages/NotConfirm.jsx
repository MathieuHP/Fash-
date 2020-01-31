import React, { useState } from 'react'
import Typography from '@material-ui/core/Typography';
import { Button } from '@material-ui/core';
import Input from '@material-ui/core/Input';
import Container from '@material-ui/core/Container';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';


function NotFound() {
    const useStyles = makeStyles(theme => ({
        title: {
            marginBottom: 30
        },
        secondTitle:{
            marginBottom: 50
        },
        textField: {
            marginBottom: 30,
            width: '30%' 
        },
        button: {
            display: 'block',
            textAlign: 'center'
        }
    }));

    const classes = useStyles();

    const [email, setEmail] = useState('');

    const sendLink = () => {
        if (email > 0) {

        }
    }

    return (
        <div>
            <Container component="main">
                <Typography className={classes.title} variant="h5" color="primary" component="h5">
                    The confirmation link is invalid or has expired
                </Typography>
                <Typography className={classes.secondTitle} variant="subtitle1" color="textSecondary" component="h6">
                    To get a new link make sure to fill the field with the email address you used to sign up.
                </Typography>
                <TextField
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={classes.textField}
                />
                <Button className={classes.button}  variant="contained" color="primary" onClick={sendLink}>
                    Get new confirmation link
                </Button>
            </Container>
        </div>
    )
}

export default NotFound
