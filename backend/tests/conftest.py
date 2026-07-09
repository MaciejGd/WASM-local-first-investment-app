import os
import tempfile

import pytest
from inv_app import create_app
from inv_app.db import db_proxy


with open(os.path.join(os.path.dirname(__file__), "data.sql"), "rb") as f:
    _data_sql = f.read().decode("utf-8")


@pytest.fixture
def app():
    db_fd, db_path = tempfile.mkstemp()
    # create app instance for testing
    app = create_app(
        {
            "TESTING": True,
            "DATABASE": db_path,
        }
    )

    with app.app_context():
        db_proxy.init_db()
        # TODO change that call so it is not sql specific
        db_proxy.get_db().executescript(_data_sql)
        db_proxy.close_db()

    yield app

    os.close(db_fd)
    os.unlink(db_path)


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def runner(app):
    return app.test_cli_runner()


class AuthActions(object):
    def __init__(self, client):
        self._client = client

    def login(self, username="test", password="test"):
        return self._client.post(
            "/auth/login", json={"username": username, "password": password}
        )

    def logout(self):
        return self._client.get("/auth/logout")

    def register(self, username="test", password="test"):
        return self._client.post(
            "/auth/register", json={"username": username, "password": password}
        )


@pytest.fixture
def authentication(client):
    return AuthActions(client)
