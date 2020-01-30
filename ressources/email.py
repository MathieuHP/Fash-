from flask_mail import Message, Mail

import config


def send_email(to, subject, template):
    msg = Message(
        subject,
        recipients=[to],
        html=template,
        sender=config.MAIL_DEFAULT_SENDER
    )
    Mail.send(msg)

    print(f"--- email sent to {to} ---")