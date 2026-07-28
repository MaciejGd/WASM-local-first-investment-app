from http import HTTPStatus

from tests.integration_conf import add_user


def test_password_hash_fail(authentication):
    response = authentication.login(username="test", password="test")
    assert response.status_code == HTTPStatus.UNAUTHORIZED


def test_properly_logged_in(app, authentication):
    add_user(app, "test", "pass", "salt")
    response = authentication.login(username="test", password="pass")
    assert response.status_code == HTTPStatus.OK
