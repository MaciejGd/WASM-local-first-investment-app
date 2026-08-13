from http import HTTPStatus
from unittest.mock import patch

import pytest


@patch("inv_app.endpoints.sync.DBUpdater.get_pending_events", return_value=12)
def test_pull_changes_amount(_, client):
    with client.session_transaction() as sess:
        sess["user_id"] = 1

    response = client.get("/api/sync/pull_events_ids/12")
    assert response.status_code == HTTPStatus.OK


@patch("inv_app.endpoints.sync.DBUpdater.get_events", return_value=12)
def test_pull_changes(_, client):
    with client.session_transaction() as sess:
        sess["user_id"] = 1

    response = client.get("/api/sync/pull_events/12")
    assert response.status_code == HTTPStatus.OK


def test_compare_hashes_post_fail(client):
    with client.session_transaction() as sess:
        sess["user_id"] = 1
    response = client.post(
        "/api/sync/hash_compare",
        data="not json",
        content_type="application/json",
    )
    assert response.status_code == HTTPStatus.BAD_REQUEST


def test_compare_hashes_pass(client):
    with client.session_transaction() as sess:
        sess["user_id"] = 1
    response = client.post(
        "/api/sync/hash_compare",
        data={"data": "json"},
        content_type="application/json",
    )
    assert response.status_code == HTTPStatus.BAD_REQUEST


@pytest.fixture
def example_json():
    yield {
        "ulid": "test",
        "table_name": "test",
        "timestamp": "test",
        "type": "test",
        "hash": "test",
        "payload": "test",
    }


@patch("inv_app.endpoints.sync.DBUpdater.process_event", return_value=12)
def test_push_changes_pass(_, client, example_json):
    with client.session_transaction() as sess:
        sess["user_id"] = 1

    response = client.post(
        "/api/sync/push_event",
        json=example_json,
        content_type="application/json",
    )

    assert response.status_code == HTTPStatus.OK


@patch("inv_app.endpoints.sync.DBUpdater.process_event", return_value=12)
def test_push_changes_no_ulid(_, client, example_json):
    example_json["ulid"] = None

    with client.session_transaction() as sess:
        sess["user_id"] = 1

    response = client.post(
        "/api/sync/push_event",
        json=example_json,
        content_type="application/json",
    )

    assert response.status_code == HTTPStatus.BAD_REQUEST


@patch("inv_app.endpoints.sync.DBUpdater.process_event", return_value=12)
def test_push_changes_no_table_name(_, client, example_json):
    example_json["table_name"] = None

    with client.session_transaction() as sess:
        sess["user_id"] = 1

    response = client.post(
        "/api/sync/push_event",
        json=example_json,
        content_type="application/json",
    )

    assert response.status_code == HTTPStatus.BAD_REQUEST


@patch("inv_app.endpoints.sync.DBUpdater.process_event", return_value=12)
def test_push_changes_no_type(_, client, example_json):
    example_json["type"] = None

    with client.session_transaction() as sess:
        sess["user_id"] = 1

    response = client.post(
        "/api/sync/push_event",
        json=example_json,
        content_type="application/json",
    )

    assert response.status_code == HTTPStatus.BAD_REQUEST


@patch("inv_app.endpoints.sync.DBUpdater.process_event", return_value=12)
def test_push_changes_no_hash_should_pass(_, client, example_json):
    example_json["hash"] = None

    with client.session_transaction() as sess:
        sess["user_id"] = 1

    response = client.post(
        "/api/sync/push_event",
        json=example_json,
        content_type="application/json",
    )

    assert response.status_code == HTTPStatus.OK


@patch("inv_app.endpoints.sync.DBUpdater.process_event", return_value=12)
def test_push_changes_no_payload_for_add(_, client, example_json):
    example_json["payload"] = None
    example_json["type"] = "add"

    with client.session_transaction() as sess:
        sess["user_id"] = 1

    response = client.post(
        "/api/sync/push_event",
        json=example_json,
        content_type="application/json",
    )

    assert response.status_code == HTTPStatus.BAD_REQUEST


@patch("inv_app.endpoints.sync.DBUpdater.process_event", return_value=12)
def test_push_changes_remove_without_payload_should_pass(_, client, example_json):
    example_json["payload"] = None
    example_json["type"] = "remove"

    with client.session_transaction() as sess:
        sess["user_id"] = 1

    response = client.post(
        "/api/sync/push_event",
        json=example_json,
        content_type="application/json",
    )

    assert response.status_code == HTTPStatus.OK


@patch("inv_app.endpoints.sync.DBUpdater.process_event", return_value=12)
def test_push_changes_invalid_payload(_, client):

    with client.session_transaction() as sess:
        sess["user_id"] = 1

    response = client.post(
        "/api/sync/push_event",
        json="no json",
        content_type="application/json",
    )

    assert response.status_code == HTTPStatus.BAD_REQUEST


@patch("inv_app.endpoints.sync.DBUpdater.process_event", return_value=None)
def test_push_changes_process_event_fail(_, client, example_json):

    with client.session_transaction() as sess:
        sess["user_id"] = 1

    response = client.post(
        "/api/sync/push_event",
        json=example_json,
        content_type="application/json",
    )

    assert response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
