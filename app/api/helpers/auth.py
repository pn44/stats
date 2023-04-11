# from functools import wraps
import time

from flask import current_app
import jwt

from app import mysql

class User(int):
    @property
    def otp_secret(self):
        if not hasattr(self, "_cache_otpsecret"):
            cur = mysql.connection.cursor()
            cur.execute("SELECT `otp_secret` FROM user where `id` = %s;",
                        (self,))
            self._cache_otpsecret = cur.fetchone()[0]
            cur.close()
        
        return self._cache_otpsecret
    
    @otp_secret.setter
    def otp_secret(self, value):
        cur = mysql.connection.cursor()
        cur.execute("UPDATE `user` SET `otp_secret`=%s WHERE `id` = %s;",
                    (value, self,))
        mysql.connection.commit()
        cur.close()
    
    @property
    def admin(self):
        if not hasattr(self, "_cache_admin"):
            cur = mysql.connection.cursor()
            cur.execute("SELECT `is_admin` FROM user where `id` = %s;",
                        (self,))
            self._cache_admin = cur.fetchone()[0]
            cur.close()
        
        return self._cache_admin
    
    @admin.setter
    def admin(self, value):
        cur = mysql.connection.cursor()
        cur.execute("UPDATE `user` SET `is_admin`=%s WHERE `id` = %s;",
                    (value, self,))
        mysql.connection.commit()
        cur.close()
    
    def generate_token(user_id, expiration=600):
        return jwt.encode({'user_id': user_id,
                    'exp': time.time() + expiration},
            current_app.config['SECRET_KEY'], algorithm='HS256')


