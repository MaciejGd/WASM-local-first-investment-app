import functools

from flask import (
    Blueprint,
    g,
    request,
    session,
    abort,
    jsonify,
)
from werkzeug.security import check_password_hash

from .db import db_proxy

bp = Blueprint("auth", __name__, url_prefix="/auth")


# endpoint for registering new user account
@bp.route("/register", methods=("POST",))
def register():
    if request.method == "POST":
        # get both username and password from request
        req_json = request.get_json()
        username = req_json.get("username", None)
        password = req_json.get("password", None)
        # check invalid cases
        if not username:
            return jsonify({"error": "Username is required."}), 400

        elif not password:
            return jsonify({"error": "Password is required."}), 400

        salt = db_proxy.register_user(username, password)
        if salt is None:
            return jsonify({"error": "Username already used."}), 409

        return 200


# endpoint for logging into the service
@bp.route("/login", methods=("POST",))
def login():
    data = request.get_json()

    username = data.get("username")
    password = data.get("password")

    user = db_proxy.get_username_data(username)
    error = None
    if not username:
        error = "Username is required"
    elif not password:
        error = "Password is required"
    # TODO - currently password stored without hashing for simplicity
    elif user is None or not check_password_hash(user["password"], password):
        error = "Invalid username or password"
    else:
        session.clear()
        session["user_id"] = user["id"]
        return {"data": "Properly logged in", "salt": user["salt"]}, 200

    return {"error": error}, 401


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
            return abort(500, "Log in to retrieve data!")
        return view(*args, **kwargs)

    return wrapped_view
