from functools import wraps
from flask_httpauth import HTTPBasicAuth, HTTPTokenAuth
from werkzeug.security import check_password_hash
from flask import current_app
import jwt

from app import mysql
from app.api.helpers.auth import User
from app.api.errors.exceptions import LoginError, InvalidTokenError, \
    PermissionDeniedError

basic_auth = HTTPBasicAuth()
token_auth = HTTPTokenAuth()

@basic_auth.verify_password
def verify_password(username, password):
    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM user WHERE email=%s", (username,))
    user = cur.fetchone()
    if user:
        password_hash = user[2]
        if check_password_hash(password_hash, password):
            return User(user[0])


@basic_auth.error_handler
def basic_auth_error(status):
    raise LoginError("incorrect credentials or 2FA enabled")



@token_auth.verify_token
def verify_token(token):
    try:
        jtkn = jwt.decode(token, current_app.config['SECRET_KEY'],
        algorithms=['HS256'])
        # print(jtkn)
        return User(jtkn["user_id"])
    except:
        return None
        

@token_auth.error_handler
def token_auth_error(status):
    raise InvalidTokenError


# the only helper here - because of circular import issues
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not token_auth.current_user().admin:
            raise PermissionDeniedError

        return f(*args, **kwargs)
    return decorated_function