from itsdangerous import URLSafeTimedSerializer
import smtplib 
from email.mime.text import MIMEText
import config
from flask import url_for


def generate_confirmation_token(email):
    # serializer = URLSafeTimedSerializer(config['SECRET_KEY'])
    serializer = URLSafeTimedSerializer(config.SECRET_KEY)
    return serializer.dumps(email, salt=config.SECURITY_PASSWORD_SALT)


def confirm_token(token, expiration=3600):
    serializer = URLSafeTimedSerializer(config.SECRET_KEY)
    try:
        email = serializer.loads(
            token,
            salt=config.SECURITY_PASSWORD_SALT,
            max_age=expiration
        )
    except:
        return False
    return email


def send_email(subject, body, receiver):
    # creates SMTP session 
    s = smtplib.SMTP('smtp.gmail.com', 587) 

    # start TLS for security 
    s.starttls() 

    # Authentication 
    s.login(config.MAIL_USERNAME, config.MAIL_PASSWORD) 

    # message to be sent 
    msg = MIMEText(str(body))
    msg['Subject'] = str(subject)


    # sending the mail 
    s.sendmail("fashtest.brainjar@gmail.com", receiver, msg.as_string()) 

    # terminating the session 
    s.quit() 


def verify_email(receiver):

    token = generate_confirmation_token(receiver)
    confirm_url = url_for('confirm_email', token=token, _external=True)

    body =f""" Welcome! Thanks for signing up. Please follow this link to activate your account: \n
        {confirm_url}  \n    Cheers!"""

    subject = "Please confirm your email"

    
    try:
        send_email(subject, body, receiver)
        print(f'confirmation email sent to {receiver}') 

    except:
        return "email invalid"