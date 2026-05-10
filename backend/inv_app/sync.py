import functools

from . import auth
from .db import db_proxy
from .sync_api import DBUpdater

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
    table = post_json.get('table_name')
    payload = post_json.get('payload')

    updater = DBUpdater()    
    if updater.add_record(session['user_id'], table, payload) == False:
        abort(500, "Pushing chnges to remote failed")

    return jsonify({"status" : "Properly pushed changes to remote"})




@bp.route('/purge', methods=('POST',))
@auth.login_required
def reset_table():
    """
        Endpoint for purging user's table
    """

    post_json = request.get_json()
    table = post_json.get("table_name")

    updater = DBUpdater()
    if not updater.purge_table(session['user_id'], table):
        abort(500, "Failed to purge table for the user")
    
    return jsonify(success=True)


