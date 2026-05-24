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
    obj_hash = post_json.get('hash')
    payload = post_json.get('payload')

    updater = DBUpdater()    
    event_id = updater.process_event(session['user_id'], timestamp, table_name, type, ulid, obj_hash, payload)
    if event_id == None:
        abort(500, "Pushing changes to remote failed")

    return jsonify({"event_id" : event_id})


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
        user_id=session["user_id"],
        payload={
            "compare_obj" : ulid,
            "table_name" : table_name
        }
    )
    if record is None:
        abort(500, "Failed to retrieve record with given ulid")
    
    return jsonify({"record" : record})


# @bp.route('/pull_events/<event_id>', methods=('GET',))
# @auth.login_required
# def get_pending_events(event_id):
#     last_event_id = event_id


@bp.route('/pull_events_ids/<event_id>', methods=('GET',))
@auth.login_required
def pull_changes_amount(event_id):
    user_id = session["user_id"]

    updater = DBUpdater()
    ids = updater.get_pending_events(user_id, event_id)
    return jsonify(ids)


@bp.route('/pull_events/<event_id>', methods=('GET',))
@auth.login_required
def pull_changes(event_id):
    user_id = session["user_id"]
    updater = DBUpdater()

    records = updater.get_events(user_id, event_id)
    return jsonify(records)
