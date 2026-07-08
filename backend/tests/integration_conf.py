import sqlite3
from werkzeug.security import generate_password_hash

def add_user(app, username, password, salt):
    password = generate_password_hash(password)
    with sqlite3.connect(app.config['DATABASE']) as conn:
        conn.execute("INSERT INTO user (username, password, salt) VALUES (?, ?, ?);",
                              (username, password, salt))
        cursor = conn.execute("SELECT * FROM user;").fetchall()
        print(cursor)


def get_user_from_db(app, username):
    with sqlite3.connect(app.config['DATABASE']) as conn:
        cursor = conn.execute("SELECT * FROM user WHERE username = ?;", (username,)).fetchone()
        # return username, password and salt
        return cursor