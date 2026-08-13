import functools
from http import HTTPStatus

from flask import (
    Blueprint,
    abort,
    g,
    jsonify,
    request,
    session,
)
from werkzeug.security import check_password_hash

from ..db import db_proxy

bp = Blueprint("auth", __name__, url_prefix="/api/auth")


# endpoint for registering new user account
@bp.route("/register", methods=("POST",))
def register():
    # get both username and password from request
    req_json = request.get_json()
    username = req_json.get("username", None)
    password = req_json.get("password", None)
    # check invalid cases
    if not username:
        return jsonify({"error": "Username is required."}), HTTPStatus.BAD_REQUEST

    elif not password:
        return jsonify({"error": "Password is required."}), HTTPStatus.BAD_REQUEST

    salt = db_proxy.register_user(username, password)
    if salt is None:
        return jsonify({"error": "Username already used."}), HTTPStatus.CONFLICT

    return {}, HTTPStatus.OK


# endpoint for logging into the service
@bp.route("/login", methods=("POST",))
def login():
    data = request.get_json()

    username = data.get("username")
    password = data.get("password")

    user = db_proxy.get_username_data(username)
    error = None
    if not username:
        error = ({"error": "Username is required"}, HTTPStatus.BAD_REQUEST)
    elif not password:
        error = ({"error": "Password is required"}, HTTPStatus.BAD_REQUEST)
    # TODO - currently password stored without hashing for simplicity
    elif user is None or not check_password_hash(user["password"], password):
        error = ({"error": "Invalid username or password"}, HTTPStatus.UNAUTHORIZED)
    else:
        session.clear()
        session["user_id"] = user["id"]
        return {"data": "Properly logged in", "salt": user["salt"]}, HTTPStatus.OK

    return error


# endpoint for logging user out
@bp.route("/logout", methods=("GET",))
def logout():
    session.clear()
    return {"data": "Properly logged out"}, 200


# should be called each time before requesting from a blueprint
@bp.before_app_request
def load_logged_in_user():
    user_id = session.get("user_id")

    if user_id is None:
        g.user = None
    else:
        g.user = db_proxy.get_user_data(user_id)


# decorator for checking if user is logged in when launching a request
def login_required(view):
    @functools.wraps(view)
    def wrapped_view(*args, **kwargs):
        if g.user is None:
            return abort(HTTPStatus.FORBIDDEN, "Log in to retrieve data!")
        return view(*args, **kwargs)

    return wrapped_view
