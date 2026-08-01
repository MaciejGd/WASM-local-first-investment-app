from http import HTTPStatus

from flask import Blueprint, abort, jsonify, request, session

from . import auth
from .sync_api import DBUpdater

bp = Blueprint("sync", __name__, url_prefix="/api/sync")


@bp.route("/push_event", methods=("POST",))
@auth.login_required
def push_changes():
    """
    Endpoint for pushing changes made for user to its tables
    """

    post_json = request.get_json()
    if not isinstance(post_json, dict):
        abort(HTTPStatus.BAD_REQUEST, "Invalid payload")
    # retrieve events data
    ulid = post_json.get("ulid")
    table_name = post_json.get("table_name")
    type = post_json.get("type")
    obj_hash = post_json.get("hash")
    payload = post_json.get("payload")

    if any(
        v is None
        for v in (
            ulid,
            table_name,
            type,
        )
    ):
        abort(HTTPStatus.BAD_REQUEST, "Missing required payload fields.")

    # add events carry the encrypted record, while remove events do not
    if type == "add" and payload is None:
        abort(HTTPStatus.BAD_REQUEST, "Missing required payload fields.")

    updater = DBUpdater()
    event_id = updater.process_event(
        session["user_id"], table_name, type, ulid, obj_hash, payload
    )
    if event_id is None:
        abort(HTTPStatus.INTERNAL_SERVER_ERROR, "Pushing changes to remote failed")

    return jsonify({"event_id": event_id})


@bp.route("/pull_events_ids/<event_id>", methods=("GET",))
@auth.login_required
def pull_changes_amount(event_id):
    user_id = session["user_id"]

    updater = DBUpdater()
    ids = updater.get_pending_events(user_id, event_id)
    return jsonify(ids)


@bp.route("/pull_events/<event_id>", methods=("GET",))
@auth.login_required
def pull_changes(event_id):
    user_id = session["user_id"]
    updater = DBUpdater()

    records = updater.get_events(user_id, event_id)
    return jsonify(records)


@bp.route("/hash_compare", methods=("POST",))
@auth.login_required
def compare_hashes():
    hashes_json = request.get_json(silent=True)
    if hashes_json is None:
        return abort(HTTPStatus.BAD_REQUEST, "Invalid request JSON.")

    user_id = session["user_id"]
    updater = DBUpdater()
    response = updater.compare_hashes(user_id, hashes_json)
    return jsonify(response)
