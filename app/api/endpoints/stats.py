import csv
import datetime
import re
from flask import request
from flask import abort, jsonify, url_for
from flask.views import MethodView

from werkzeug.security import generate_password_hash

from app import mysql
from app.api.auth import token_auth
from app.api.errors.exceptions import InvalidPageError, PermissionDeniedError
from app.api.helpers.pagination import NO_PER_PAGE, no_pages, safe_name, \
    safe_name_typecaster


class UpdatePageViews(MethodView):
    def get(self):
        cur = mysql.connection.cursor()
        cur.execute("SELECT `views`, `likes`, `dislikes` FROM `page` WHERE `id` = %s", (request.args["pageid"],))
        data = cur.fetchone()
        return jsonify({
            "views": data[0],
            "likes": data[1],
            "dislikes": data[2]
        })
    
    def post(self):
        data = request.get_json()
        cur = mysql.connection.cursor()
        if "views" in data["increment"]:
            cur.execute("UPDATE `page` SET `views` = `views` + 1 WHERE `id` = %s", (data["pageid"],))
        if "likes" in data["increment"]:
            cur.execute("UPDATE `page` SET `likes` = `likes` + 1 WHERE `id` = %s", (data["pageid"],))
        if "dislikes" in data["increment"]:
            cur.execute("UPDATE `page` SET `dislikes` = `dislikes` + 1 WHERE `id` = %s", (data["pageid"],))
        mysql.connection.commit()
        cur.close()
        return "", 200


class Pages(MethodView):
    decorators = [token_auth.login_required]
    def get(self):
        cur = mysql.connection.cursor()
        cur.execute("SELECT * FROM `page`;")
        
        res = []
        for i in cur.fetchall():
            res.append({
                "id": i[0],
                "slug": i[1],
                "name": i[2],
                "views": i[3],
                "likes": i[4],
                "dislikes": i[5]
            })
        
        cur.close()
        return jsonify(res)
        
    def put(self):
        data = request.get_json()
        cur = mysql.connection.cursor()
        
        dut = (data["slug"], data["name"])
        
        if "id" in data:
            query = "UPDATE `page` SET `slug` = %s, `name` = %s WHERE `id` = %s;"
            dut += (data["id"],)
        else:
            query = "INSERT INTO `page` (`slug`, `name`) VALUES (%s, %s);"
        
        cur.execute(query, dut)
        mysql.connection.commit()
        
        return "", 201
