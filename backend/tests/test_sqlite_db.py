import pytest
from inv_app.db.db_sqlite import SQLite3DB
from unittest.mock import MagicMock, patch
import sqlite3
from flask import current_app


@pytest.fixture
def sqlite_db():
    yield SQLite3DB()


def test_close(sqlite_db):
    # db = DbHandle()
    db = MagicMock()
    sqlite_db.close(db)

    assert db.close.called


def test_setup_connection(app, sqlite_db, monkeypatch):
    class Recorder(object):
        database = None
        detect_types = None

    def connect(database, detect_types, *args, **kwargs):
        Recorder.database = database
        Recorder.detect_types = detect_types
        return MagicMock()

    monkeypatch.setattr("sqlite3.connect", connect)
    result = sqlite_db.setup_connection("dummy")

    assert result.row_factory == sqlite3.Row
    assert Recorder.detect_types == sqlite3.PARSE_DECLTYPES
    assert Recorder.database == "dummy"


# TODO - implement initialize test
# def test_initialize(app, sqlite_db):
# dummy_path = "./data.sql"
# with app.app_context():
#     with patch("inv_app.db.db_sqlite.current_app.open_resource") as mock_open:
#         db_mock = MagicMock()
#         mock_open.read.return_value =
#         sqlite_db.initialize()


def test_get_user_data(sqlite_db):
    user_mock = MagicMock()
    db_handle = MagicMock()
    db_handle.execute.return_value = user_mock

    example_uid = 12
    sqlite_db.get_user_data(db_handle, example_uid)

    db_handle.execute.assert_called_once_with("SELECT * FROM user WHERE id = ?", (12,))
    assert user_mock.fetchone.called


def test_get_username_data(sqlite_db):
    user_mock = MagicMock()
    db_handle = MagicMock()
    db_handle.execute.return_value = user_mock

    example_user = "Andrzej"
    sqlite_db.get_username_data(db_handle, example_user)

    db_handle.execute.assert_called_once_with(
        "SELECT * FROM user WHERE username = ?", (example_user,)
    )
    assert user_mock.fetchone.called
