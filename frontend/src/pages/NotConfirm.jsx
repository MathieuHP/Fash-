import React, { useState } from 'react'
import Typography from '@material-ui/core/Typography';
import { Button } from '@material-ui/core';
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
    const [infoMsg, setInfoMsg] = useState();

    const sendLink = () => {
        if (email.length > 0) {
            const options = {
                method: 'POST',
                body: JSON.stringify({ email: email}),
            };
            fetch(`http://127.0.0.1:5000/re_verify`, options)
            .then((response) => {
                response.json().then(function(res) {
                    if ('msg' in res){
                        setInfoMsg(
                            <Typography className={classes.secondTitle} variant="subtitle1" color="textSecondary" component="h6">
                                {res['msg']}
                            </Typography>
                        )
                    } else if ('success' in res) {
                        setInfoMsg(
                            <Typography className={classes.secondTitle} variant="subtitle1" color="textSecondary" component="h6">
                                You will get a email with a new link shortly.
                            </Typography>
                        )
                    }
                })
            })
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
                {infoMsg}
            </Container>
        </div>
    )
}

export default NotFound
