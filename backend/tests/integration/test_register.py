from tests.integration_conf import add_user, get_user_from_db
from werkzeug.security import check_password_hash

from http import HTTPStatus


def test_register_user(app, authentication):
    response = authentication.register("test", "pass")
    response.status_code == HTTPStatus.OK

    cursor = get_user_from_db(app, "test")
    if not cursor:
        assert False

    assert cursor[1] == "test"
    assert check_password_hash(cursor[2], "pass")


def test_register_user_username_already_used(app, authentication):
    add_user(app, "test", "pass", "salt")

    response = authentication.register("test", "pass")
    response.status_code == HTTPStatus.CONFLICT
