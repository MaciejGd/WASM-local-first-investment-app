import pytest
from flask import session, g
from inv_app import auth
from unittest.mock import patch
from http import HTTPStatus
import sqlite3

@pytest.mark.parametrize(
    ("username", "password"),
    (("", "test"), ("test", "")),
)
def test_login_invalid_input(authentication, username, password):
    response = authentication.login(username=username, password=password)
    assert response.status_code == HTTPStatus.BAD_REQUEST


@patch("inv_app.auth.check_password_hash", return_value=False)
@patch(
    "inv_app.auth.db_proxy.get_username_data",
    return_value={"id": 2, "password": "test", "salt": "test"},
)
def test_password_hash_fail(_user, _hash, authentication):
    response = authentication.login(username="test", password="test")
    assert response.status_code == HTTPStatus.UNAUTHORIZED


@patch("inv_app.auth.check_password_hash", return_value=True)
def test_properly_logged_in(_, authentication, monkeypatch):
    monkeypatch.setattr(
        auth.db_proxy,
        "get_username_data",
        lambda x: {"id": 2, "password": "test", "salt": "test"},
    )
    response = authentication.login(username="test", password="test")
    assert response.status_code == HTTPStatus.OK


def test_logout(client, authentication):
    authentication.login()  # log in
    with client:
        authentication.logout()
        # assert session['user_id'] is None
        assert "user_id" not in session


def test_load_logged_in_user_none(app):
    with app.test_request_context():
        auth.load_logged_in_user()

        assert g.user is None


@patch("inv_app.auth.db_proxy.get_user_data", return_value=2)
def test_load_logged_in_user(_, app):
    with app.test_request_context():
        session["user_id"] = 2
        auth.load_logged_in_user()

        assert g.user == 2


def test_login_required_calls_view(app):
    with app.test_request_context():
        g.user = {"id": 1}
        called = False

        @auth.login_required
        def view():
            nonlocal called
            called = True
            return "success"

        response = view()
        assert called
        assert response == "success"


def test_login_required_throws(app):
    with app.test_request_context():
        g.user = None
        called = False

        @auth.login_required
        def view():
            nonlocal called
            called = True
            return "success"

        with pytest.raises(Exception):
            view()


@pytest.mark.parametrize(
    ("username", "password"),
    (
        ("", "test"),
        ("test", ""),
    ),
)
def test_register_missing_params(authentication, username, password):
    response = authentication.register(username=username, password=password)
    assert response.status_code == HTTPStatus.BAD_REQUEST


@patch("inv_app.auth.db_proxy.register_user", return_value=None)
def test_register_used_username(_, authentication):
    response = authentication.register("test", "test")
    assert response.status_code == HTTPStatus.CONFLICT


@patch("inv_app.auth.db_proxy.register_user", return_value=True)
def test_register_set_correct(_, authentication):
    response = authentication.register(username="test", password="test")
    assert response.status_code == HTTPStatus.OK
