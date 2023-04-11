import threading

from flask import current_app, render_template
from flask_mail import Message

from app import mail

def send_async_email(app, msg):
    with app.app_context():
        mail.send(msg)

def send_email(subject, sender, recipients, text_body, html_body):
    msg = Message(subject, sender=sender, recipients=recipients)
    msg.body = text_body
    msg.html = html_body
    threading.Thread(target=send_async_email, args=(current_app._get_current_object(), msg)).start()

def send_new_account_email(email_id, token):
    send_email('Trunews Account Creation Request',
               sender=current_app.config['ADMINS'][0],
               recipients=[email_id],
               text_body=render_template('emails/newaccount.txt',
                                         email=email_id, token=token),
               html_body=render_template('emails/newaccount.html',
                                         email=email_id, token=token))