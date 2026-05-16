import functools

from . import auth
from .db import db_proxy
from .sync_api import DBUpdater

from flask import (
    Blueprint, jsonify, request, abort, session
)

bp = Blueprint('sync', __name__, url_prefix="/sync")


@bp.route('/push_event', methods=('POST',))
@auth.login_required
def push_changes():
    """
        Endpoint for pushing changes made for user to its tables
    """

    post_json = request.get_json()
    # retrieve events data
    ulid = post_json.get('ulid')
    table_name = post_json.get('table_name')
    timestamp = post_json.get('timestamp')    
    type = post_json.get('type')
    payload = post_json.get('payload')

    updater = DBUpdater()    
    if updater.process_event(session['user_id'], timestamp, table_name, type, ulid, payload) == False:
        abort(500, "Pushing changes to remote failed")

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


@bp.route('/get_record/<table_name>/<ulid>', methods=('GET', ))
@auth.login_required
def get_record(table_name, ulid):
    """
    Testing endpoint for testing end-to-end frontend-backend connection

    :param table_name: name of the table from which information should be taken
    :param ulid: 
    """

    updater = DBUpdater()
    record = updater.get_record(
        compare_obj= {"ulid" : ulid},
        table_name=table_name,
        user_id=session["user_id"],
    )
    if record is None:
        abort(500, "Failed to retrieve record with given ulid")
    
    return jsonify({"record" : record})

    

