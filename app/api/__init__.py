from flask import Blueprint

bp = Blueprint('api', __name__)

from app.api import urls
from app.errors import handlers