from http import HTTPStatus

from tests.integration_conf import add_user


def test_logout(app, authentication):
    add_user(app, "test", "pass", "salt")  # first add user to db
    authentication.login(username="test", password="pass")
    response = authentication.logout()
    assert response.status_code == HTTPStatus.OK
    # then log-in
