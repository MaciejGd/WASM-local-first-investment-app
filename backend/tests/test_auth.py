import pytest
from flask import session, g


def test_login(client, auth):
    response = auth.login()
    print(response)
    with client:
        client.get("/")
        assert session["user_id"] == 1
        assert g.user["username"] == "test"


@pytest.mark.parametrize(
    ("username", "password", "message"),
    (
        ("", "test", b"Username is required"),
        ("test", "", b"Password is required"),
        ("not_valid", "not_valid", b"Invalid username or password"),
        ("test", "test", b"Properly logged in"),
    ),
)
def test_login_valid_input(auth, username, password, message):
    response = auth.login(username=username, password=password)
    assert message in response.data


def test_logout(client, auth):
    auth.login()  # log in
    with client:
        auth.logout()
        # assert session['user_id'] is None
        assert "user_id" not in session
