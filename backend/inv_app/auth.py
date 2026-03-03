import functools

from flask import (
    Blueprint, flash, g, redirect, render_template, request, session, jsonify, Response
)

from .db import db_proxy

bp = Blueprint('auth', __name__, url_prefix="/auth")

# endpoint for registering new user account
@bp.route("/register", methods=('GET', 'POST'))
def register():
    # TODO - implement registering new users
    pass

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
    elif user is None or (user["password"] != password):
        error = "Invalid username or password"
    else:
        session.clear()
        session['user_id'] = user['id']
        return {'data' : 'Properly logged in'}, 200
    
    return {'data' : error}, 401
    
    

# endpoint for logging user out
@bp.route("/logout", methods=("GET", ))
def logout():
    session.clear()
    return {'data' : 'Properly logged out'}, 200

# should be called each time before requesting from a blueprint
@bp.before_app_request
def load_logged_in_user():
    user_id = session.get('user_id')

    if user_id is None:
        g.user = None
    else:
        g.user = db_proxy.get_user_data(user_id)

# decorator for checking if user is logged in when launching a request
def login_required(view):
    @functools.wraps
    def wrapped_view(**kwargs):
        if g.user is None:
            return jsonify({"returncode" : "ERROR"})
        return view(**kwargs)
    
    return wrapped_view

