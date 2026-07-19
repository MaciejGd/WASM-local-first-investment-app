import pytest
from inv_app.db.db_sqlite import SQLite3DB
from unittest.mock import MagicMock, call
import sqlite3


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


def test_register_user(sqlite_db):
    db_handle = MagicMock()

    example_uid = 12
    sqlite_db.get_user_data(db_handle, example_uid)

    db_handle.execute.assert_called_once_with("SELECT * FROM user WHERE id = ?", (12,))
    db_handle.commit.assert_called_once


def test_register_user_throws(sqlite_db):
    db_handle = MagicMock()
    db_handle.execute.side_effect = sqlite3.IntegrityError()

    ret = sqlite_db.register_user(db_handle, "test", "test", "test")
    assert ret is None


def test_reset_collection(sqlite_db):
    db_handle = MagicMock()

    ret = sqlite_db.reset_collection(db_handle, 2, "wallet")
    assert ret
    db_handle.execute.assert_has_calls(
        [
            call(SQLite3DB.RESET_TABLE.format("wallet_2")),
            call(SQLite3DB.RESET_AUTOINCREMENT, ("wallet_2",)),
            call(SQLite3DB.VACUUM),
        ]
    )
    db_handle.commit.assert_called_once


def test_reset_collection_throw(sqlite_db):
    db_handle = MagicMock()

    db_handle.execute.side_effect = Exception()

    ret = sqlite_db.reset_collection(db_handle, 2, "wallet")
    assert not ret
    db_handle.rollback.assert_called_once


def test_add_event_record_pass(sqlite_db):
    table_name = "wallet"
    type = "add"
    ulid = "test"

    cursor_mock = MagicMock()
    cursor_mock.lastrowid = 4

    db_handle = MagicMock()
    db_handle.execute.return_value = cursor_mock

    ret = sqlite_db.add_event_record(db_handle, 2, table_name, type, ulid)
    assert ret == 4

    db_handle.execute.assert_has_calls(
        [
            call(SQLite3DB.CREATE_EVENTS_TABLE.format("events_2")),
            call(
                SQLite3DB.ADD_EVENT_RECORD.format("events_2"),
                (table_name, type, ulid),
            ),
        ]
    )
    db_handle.commit.assert_called_once


def test_add_event_record_exception(sqlite_db):
    table_name = "wallet"
    type = "add"
    ulid = "test"

    db_handle = MagicMock()
    db_handle.execute.side_effect = Exception()

    ret = sqlite_db.add_event_record(db_handle, 2, table_name, type, ulid)
    assert ret == -1
    assert db_handle.rollback.assert_called_once


def test_add_encrypted_data_record_pass(sqlite_db):
    table_name = "wallet"
    ulid = "test"
    hash = "test"
    payload = "test"

    cursor_mock = MagicMock()
    cursor_mock.lastrowid = 4

    db_handle = MagicMock()
    db_handle.execute.return_value = cursor_mock

    ret = sqlite_db.add_encrypted_data_record(
        db_handle, 2, table_name, ulid, hash, payload
    )
    assert ret == 4

    db_handle.execute.assert_has_calls(
        [
            call(SQLite3DB.CREATE_ENCRYPTED_TABLE.format("wallet_2")),
            call(
                SQLite3DB.ADD_ENCRYPTED_RECORD.format("wallet_2"), (ulid, hash, payload)
            ),
        ]
    )


def test_add_encrypted_data_record_exception(sqlite_db):
    table_name = "wallet"
    ulid = "test"
    hash = "test"
    payload = "test"

    db_handle = MagicMock()
    db_handle.execute.side_effect = Exception()

    ret = sqlite_db.add_encrypted_data_record(
        db_handle, 2, table_name, ulid, hash, payload
    )
    assert ret == -1
    db_handle.rollback.assert_called_once


def test_get_encrypted_record(sqlite_db):
    table_name = "wallet"
    ulid = "test"

    cursor_mock = MagicMock()
    cursor_mock.fetchone.return_value = 4

    db_handle = MagicMock()
    db_handle.execute.return_value = cursor_mock

    ret = sqlite_db.get_encrypted_record(db_handle, 2, table_name, ulid)
    assert ret == 4

    db_handle.execute.assert_has_calls(
        [
            call(SQLite3DB.GET_ENCRYPTED_RECORD.format("wallet_2"), (ulid,)),
        ]
    )


def test_get_encrypted_data_record_exception(sqlite_db):
    table_name = "wallet"
    ulid = "test"

    db_handle = MagicMock()
    db_handle.execute.side_effect = Exception()

    ret = sqlite_db.get_encrypted_record(db_handle, 2, table_name, ulid)
    assert ret is None
    db_handle.rollback.assert_called_once


def test_remove_encrypted_record(sqlite_db):
    db_handle = MagicMock()

    ret = sqlite_db.remove_encrypted_record(db_handle, 4, "wallet", "test")
    assert ret
    db_handle.execute.assert_called_once_with(
        SQLite3DB.REMOVE_ENCRYPTED_RECORD.format("wallet_4"), ("test",)
    )


def test_remove_encrypted_record_throws(sqlite_db):
    db_handle = MagicMock()
    db_handle.execute.side_effect = Exception()

    ret = sqlite_db.remove_encrypted_record(db_handle, 4, "wallet", "test")
    assert not ret
    db_handle.rollback.assert_called_once


def test_get_events_from_id(sqlite_db):
    records_mock = MagicMock()
    records_mock.fetchall.return_value = [[1, 2], [4, 2], [0, 2]]

    db_handle = MagicMock()
    db_handle.execute.return_value = records_mock

    ret = sqlite_db.get_events_from_id(db_handle, 4, 0)
    assert ret == [1, 4, 0]
    db_handle.execute.assert_called_once_with(
        SQLite3DB.GET_EVENT_IDS_FROM.format("events_4"), (0,)
    )


def test_get_events_from_id_throws(sqlite_db):
    db_handle = MagicMock()
    db_handle.execute.side_effect = Exception()

    ret = sqlite_db.get_events_from_id(db_handle, 4, 0)
    assert ret == []
    db_handle.rollback.assert_called_once


def test_get_event_correct(sqlite_db):
    records_mock = MagicMock()
    records_mock.fetchone.return_value = 4

    db_handle = MagicMock()
    db_handle.execute.return_value = records_mock

    ret = sqlite_db.get_event(db_handle, 4, 0)
    assert ret == 4
    db_handle.execute.assert_called_once_with(
        SQLite3DB.GET_EVENT_BY_ID.format("events_4"), (0,)
    )


def test_get_event_throws(sqlite_db):
    db_handle = MagicMock()
    db_handle.execute.side_effect = Exception()

    ret = sqlite_db.get_event(db_handle, 4, 0)
    assert ret is None


def test_update_collection_hash_pass(sqlite_db):
    db_handle = MagicMock()

    ret = sqlite_db.update_collection_hash(db_handle, 4, "wallet", "test_hash")
    assert ret
    db_handle.execute.assert_has_calls(
        [
            call(SQLite3DB.CREATE_META_TABLE.format("meta_4")),
            call(SQLite3DB.UPDATE_META.format("meta_4"), ("wallet_4", "test_hash")),
        ]
    )
    db_handle.commit.assert_called_once


def test_udpate_collection_hash_throws(sqlite_db):
    db_handle = MagicMock()
    db_handle.execute.side_effect = Exception()

    ret = sqlite_db.update_collection_hash(db_handle, 4, "wallet", "test_hash")
    db_handle.rollback.assert_called_once
    assert not ret


def test_get_collection_hash_pass(sqlite_db):
    records_mock = MagicMock()
    records_mock.fetchone.return_value = [1, 2, 3, 4]

    db_handle = MagicMock()
    db_handle.execute.return_value = records_mock

    ret = sqlite_db.get_collection_hash(db_handle, 4, "wallet")
    assert ret == 3
    db_handle.execute.assert_has_calls(
        [
            call(SQLite3DB.CREATE_META_TABLE.format("meta_4")),
            call(SQLite3DB.GET_META.format("meta_4"), ("wallet_4",)),
        ]
    )

    db_handle.commit.assert_called_once


def test_get_collection_hash_pass_throws(sqlite_db):
    db_handle = MagicMock()
    db_handle.execute.side_effect = Exception()

    ret = sqlite_db.get_collection_hash(db_handle, 4, "wallet")
    db_handle.rollback.assert_called_once
    assert ret is None


def test_get_all_encrypted_records(sqlite_db):
    cursor_mock = MagicMock()
    cursor_mock.fetchall.return_value = [1, 2, 3]

    db_handle = MagicMock()
    db_handle.execute.return_value = cursor_mock

    ret = sqlite_db.get_all_encrypted_records(db_handle, 4, "wallet")
    assert ret == [1, 2, 3]
    db_handle.execute.assert_called_once_with(
        SQLite3DB.GET_ALL_ENCRYPTED_RECORDS.format("wallet_4")
    )


def test_get_all_encrypted_records_throws(sqlite_db):
    db_handle = MagicMock()
    db_handle.execute.side_effect = Exception()

    ret = sqlite_db.get_all_encrypted_records(db_handle, 4, "wallet")
    assert ret is None
