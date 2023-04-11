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


class ListArticlesPaginated(MethodView):
    decorators = [token_auth.login_required]
    def get(self):
        page = request.args.get("page", type=int) if "page" in request.args \
            else None
        per_page = request.args.get("per_page", default=NO_PER_PAGE, type=int)
        nbpages = no_pages("article", per_page=per_page)
        
        if page is not None and not 0 < page <= nbpages:
            raise InvalidPageError(nbpages)
        
        cur = mysql.connection.cursor()
        
        query = "SELECT * FROM article"
        
        if "filter" in request.args:
            query += " WHERE `category` IN ("
            
            filterman = next(
                csv.reader([request.args["filter"]], skipinitialspace=True))
            
            lf = 0
            
            for el in filterman:
                if re.fullmatch(r"[0-9]+", el):
                    query += "%s, " % (el,)
                    lf = 1
            
            if lf:
                query = query[:-2]
            
            query += ")"
        
        query += " ORDER BY"
        
        orderman = next(csv.reader(
                [request.args.get("order", default="date_time.DESC", 
                                    type=safe_name_typecaster)], 
                skipinitialspace=True))
        lo = 0
        
        for el in orderman:
            if re.fullmatch(r"[a-z_]+\.[A-Z]+", el):
                query += " %s %s, " % tuple(el.split("."))
                lo = 1
        
        if lo:
            query = query[:-2]
        
        if page is not None:
            query += " LIMIT %s, %s" % ((page-1)*per_page, per_page)
        
        query += ";"
        
        cur.execute(query)
        data = []
        for res in cur.fetchall():
            data.append({
                "id": res[0],
                "title": res[1],
                "timestamp": res[2].isoformat('T'),
                "link": res[3],
                "description": res[4],
                "creator": res[5],
                "uid": res[6],
                "category_id": res[7],
                "imageurl": res[8],
                "provider_id": res[9]
            })
        
        final = {
            "articles": data,
            "_links": {
                "prev": None,
                "next": None,
                "total": nbpages
            }}
        
        if page is not None:
            if page > 1:
                final["_links"]["prev"] = url_for(".articles", page=page-1, _external=True)
            
            if page < nbpages:
                final["_links"]["next"] = url_for(".articles", page=page+1, _external=True)
        
        return jsonify(final)

    def post(self):
        if token_auth.current_user().admin:
            data = request.get_json()
            cur = mysql.connection.cursor()
            if isinstance(data, list):
                for item in data:
                    cur.execute("INSERT into `article` VALUES (DEFAULT, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
                                (item["title"], 
                                 datetime.datetime.fromisoformat(
                                     item["timestamp"]), 
                                 item["link"], item["description"], 
                                 item["creator"], item["uid"], 
                                 int(item["category_id"]), item["imageurl"], 
                                 int(item["provider_id"])))
                    mysql.connection.commit()
            
            return '', 201
        else:
            raise PermissionDeniedError

# class AddLatestArticles(MethodView):
#     decorators = [token_auth.login_required]