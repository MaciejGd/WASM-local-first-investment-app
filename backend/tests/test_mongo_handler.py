import pytest
from inv_app.finance_api.mongo_handler import MongoHandler
from unittest.mock import MagicMock

@pytest.fixture
def mongo_col():
    db_col = MagicMock()
    db_col.find_one.return_value = 'cursor'
    db_col.find.return_value = 'cursor'
    return db_col


@pytest.fixture
def mongo_db(mongo_col):
    db_mock = MagicMock()
    db_mock.get_collection.return_value = mongo_col
    return db_mock


@pytest.fixture
def mongo_client(mongo_db):
    client_mock = MagicMock()
    client_mock.get_database.return_value = mongo_db
    return client_mock


@pytest.fixture
def mongo_handler(mongo_client):
    m = MongoHandler("dummy_url")
    m.client = mongo_client
    return m


def test_get_db(mongo_handler, mongo_db):
    assert mongo_handler.get_db('test') == mongo_db


def test_get_db_throw(mongo_handler, mongo_client):
    mongo_client.get_database.side_effect = Exception('test')
    with pytest.raises(Exception) as exc_info:
        mongo_handler.get_db('wrong_db')
    assert "Failed to get db" in exc_info.value.args[0]


def test_get_collection(mongo_handler, mongo_db, mongo_col):
    assert mongo_handler.get_collection(mongo_db, 'test') == mongo_col 


def test_get_collection_throw(mongo_handler, mongo_db):
    mongo_db.get_collection.side_effect = Exception('test')
    with pytest.raises(Exception) as exc_info:
        mongo_handler.get_collection(mongo_db, 'dummy_col')
    assert "Collection" in exc_info.value.args[0]


def test_find_one(mongo_handler, mongo_col):
    mongo_handler.find_one('test', 'test', {'test':'test'})
    mongo_col.find_one.assert_called_once_with(
        {'test':'test'}, {"_id" : 0}
    )
    # assert cursor == 'cursor'


def test_find_one_throw(mongo_handler, mongo_col):
    mongo_col.find_one.side_effect = Exception('test') # throw explicitly
    with pytest.raises(Exception) as exc_info:
        mongo_handler.find_one('test', 'test', {})
    assert "Failed to obtain one record" in exc_info.value.args[0]

def test_get_all_docs(mongo_handler, mongo_col):
    mongo_handler.get_all_docs('test', 'test')
    mongo_col.find.assert_called_once_with({}, {'ticker' : 1})


def test_get_all_docs_throw(mongo_handler, mongo_col):
    mongo_col.find.side_effect = Exception('test')
    with pytest.raises(Exception) as exc_info:
        mongo_handler.get_all_docs('test', 'dummy')
    assert "Failed to get all docs" in exc_info.value.args[0]