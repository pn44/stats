import re
import time

from flask import current_app, request
from flask import abort, jsonify
from flask.views import MethodView
import jwt
from werkzeug.security import generate_password_hash, check_password_hash
import onetimepass

from app import mysql
from app.api.auth import basic_auth, token_auth, admin_required
from app.api.helpers.auth import User
from app.api.errors.exceptions import InvalidEmailTokenError
from app.api.helpers.validation import EMAIL_REGEX, VALID_PREFTYPES
from app.api.helpers.email import send_new_account_email
from app.api.errors.exceptions import LoginError, TwoFactorCodeMissing, \
    BadSchemaError, PreferenceDoesNotExist


NEWACCOUNT_CODE_EXP = 300

# from app.models import Announcement, Achievement
# from app.api.helpers import remove_html_tags

class Login(MethodView):
    decorators = [basic_auth.login_required]
    def get(self):
        user = basic_auth.current_user()
        if user.otp_secret:
            if "code" in request.args:
                if not onetimepass.valid_totp(request.args["code"], 
                                               user.otp_secret):
                    raise LoginError("invalid code")
            else:
                raise TwoFactorCodeMissing
        
        args = [user]
        
        if "expiration" in request.args:
            args.append(request.args.get("expiration", type=int))
        
        return jsonify({
            "token": User.generate_token(*args)
        })

    # def post(self):
    #     rdata = request.get_json()
    #     user = basic_auth.current_user()
    #     if not user.otp_secret or "code" not in rdata:
    #         raise LoginError("two factor login only, use GET instead")
    #     elif not onetimepass.valid_totp(rdata["code"], user.otp_secret):
    #         raise LoginError("invalid code")
        
    #     args = [user]
        
    #     if "expiration" in rdata:
    #         args.append(rdata["expiration"])
        
    #     return jsonify({
    #         "token": User.generate_token(*args)
    #     })


class MeUser(MethodView):
    decorators = [token_auth.login_required]
    def get(self):
        user = token_auth.current_user()
        cur = mysql.connection.cursor()
        cur.execute("SELECT id, email, is_admin FROM user WHERE id=%s",
                    (user,))
        user_tup = cur.fetchone()
        cur.close()
        
        return jsonify({
                        "id": user_tup[0],
                        "email": user_tup[1],
                        "admin": user_tup[2]
                       })
    
    def put(self):
        user = token_auth.current_user()
        data = request.get_json()
        if "password" in data and "opassword" in data:
            cur = mysql.connection.cursor()
            cur.execute("SELECT password FROM user WHERE id=%s", (user,))
            userp = cur.fetchone()
            if check_password_hash(userp[0], data["opassword"]):
                cur.execute("UPDATE user SET password=%s WHERE id=%s",
                            (generate_password_hash(data["password"]), user))
                mysql.connection.commit()
                return ""
            else:
                raise LoginError("old password does not match")
        else:
            raise BadSchemaError


class UserLists(MethodView):
    decorators = [token_auth.login_required, admin_required]
    def get(self):
        cur = mysql.connection.cursor()
        cur.execute("SELECT id, email, is_admin FROM users")
        users_tup = cur.fetchall()
        ret_list = []
        for user_tup in users_tup:
            ret_list.append({
                                "id": user_tup[0],
                                "email": user_tup[1],
                                "admin": bool(user_tup[2])
                            })
        return jsonify(ret_list)


class UserPreferences(MethodView):
    decorators = [token_auth.login_required]
    def get(self, key):
        user = token_auth.current_user()
        cur = mysql.connection.cursor()
        cur.execute("SELECT `key`, `value` FROM `preference` WHERE `user`=%s AND `key`=%s LIMIT 1;", (user, key,))
        ret = cur.fetchone()
        cur.close()
        if ret:
            return jsonify({
                ret[0]: ret[1]
            })
        else:
            raise PreferenceDoesNotExist
    
    def put(self, key):
        user = token_auth.current_user()
        value = request.get_json()["value"]
        typeo = VALID_PREFTYPES.index(value.__class__.__name__)
        cur = mysql.connection.cursor()
        cur.execute("SELECT `key`, `value` FROM `preference` WHERE `user`=%s AND `key`=%s LIMIT 1;", (user, key,))
        if cur.fetchone():
            raise NotImplemented
        else:
            cur.execute("INSERT INTO `preference` (`type`, `key`, `value`, `user`) VALUES (%s, %s, %s, %s);", (typeo, key, value, user))
            mysql.connection.commit()
            cur.close()
            return "", 201


class RegistrationGUI(MethodView):
    def get(self):
        data = request.args
        if "email" in data \
                and re.fullmatch(EMAIL_REGEX, data["email"]):
            send_new_account_email(
                data["email"],
                jwt.encode({"email": data["email"],
                    'exp': time.time() + NEWACCOUNT_CODE_EXP},
                    current_app.config['SECRET_KEY'], algorithm='HS256')
            )
            return '', 200
        else:
            abort(400)
    
    def post(self):
        data = request.get_json()
        if "token" in data and "password" in data:
            try:
                jtkn = jwt.decode(data["token"], current_app.config['SECRET_KEY'],
                    algorithms=['HS256'])
            except:
                raise InvalidEmailTokenError
            cur = mysql.connection.cursor()
            cur.execute("INSERT INTO user (email, password) VALUES (%s, %s)",
                        (jtkn["email"], generate_password_hash(data["password"])))
            mysql.connection.commit()
            cur.close()
            return '', 201
        else:
            abort(400)
'''
class Register(MethodView):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('username', type = str, required = True,
            help = 'No username provided', location = 'json')
        self.reqparse.add_argument('password', type = str, required = True,
            help = 'No password provided', location = 'json')
        super().__init__()
    
    def post(self):
        data = self.reqparse.parse_args()
        username = data["username"]
        password = generate_password_hash(data["password"])
        cur = mysql.connection.cursor()
        cur.execute("INSERT INTO users (username, password, user_type) VALUES (%s, %s, 'customer')", (username, password))
        mysql.connection.commit()


class UserInfo(Resource):
    # Advaith
    def get(self, user_id):
        """Get User Info"""
        cur = mysql.connection.cursor()
        cur.execute("SELECT username, user_type FROM users WHERE user_id=%s LIMIT 1", (user_id,))
        result = cur.fetchone()
        if result:
            return {
                "user_id": user_id,
                "username": result[0],
                "user_type": result[1]
            }
        else:
            abort(404, "no such user exists")


class Menu(Resource):
    decorators = [token_auth.login_required]
    # Nishant
    def get(self,item_id):
        cur = mysql.connection.cursor()
        cur.execute("SELECT * FROM items WHERE item_id = %s",(item_id,))
        menu_tup = cur.fetchone()
        return ({"item_id": menu_tup[0],
                "name": menu_tup[1],
                "price": menu_tup[2]
            })

    def put(self,item_id):
        data = request.get_json()
        item_id = data['item_id']
        name = data["name"]
        price = data["price"]
        cur = mysql.connection.cursor()
        cur.execute("UPDATE items SET item_name = %s, price = %s WHERE item_id = %s", (name,price,item_id))
        mysql.connection.commit()

'''

"""
Template
class <<resource_name>>(Resource):
    
    decorators = [token_auth.login_required]
    
    def get(self):
        <<your code>>
    
    def post(self):
        <<your code>>
    
    ... for other HTTP methods

NOTE: Replace things in << >> as applicable.
"""