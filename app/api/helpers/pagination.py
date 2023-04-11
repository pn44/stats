import math
import re

from app import mysql

QUERY_NBPAGES = "SELECT COUNT(*) FROM `{0}`;"
NO_PER_PAGE = 50

def no_pages(table, per_page=NO_PER_PAGE):
    cur = mysql.connection.cursor()
    cur.execute(QUERY_NBPAGES.format(table))
    return math.ceil((cur.fetchone()[0])/per_page)


def safe_name(name):
    return len(name) <= 15 and re.fullmatch(r"[a-zA-Z0-9_]+", name)


def safe_name_typecaster(name):
    if safe_name(name):
        return name
    else:
        raise ValueError