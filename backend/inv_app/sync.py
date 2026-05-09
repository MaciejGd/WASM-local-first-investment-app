import functools

from . import auth
from .db import db_proxy

from flask import (
    Blueprint, jsonify, request, abort, session
)

bp = Blueprint('sync', __name__, url_prefix="/sync")


@bp.route('/push', methods=('POST',))
@auth.login_required
def push_changes():
    """
        Enpoint for pushing changes made for user to its tables
    """

    post_json = request.get_json()
    # retrieve events data
    id = post_json.get('id')
    table = post_json.get('table_name')
    payload = post_json.get('payload')
    if payload in "None":
        abort(500, "Payload should not be None!!!") # test throw

    obj = { "msg" : f"received record: id:{id}, table:{table}, with some additiional payload: {payload}" }

    return jsonify(obj)




@bp.route('/reset_table', methods=('GET',))
@auth.login_required
def reset_table():
    """
        Endpoint for purging user's table
    """

    user_id = session['user_id'] # retrieve user id
    try:
        db_proxy.reset_user_wallet_table(user_id)
    except:
        abort(500, "Failed to purge table for the user")
    
    return jsonify(success=True)

