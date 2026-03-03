import sqlite3
from . import db_handler

from flask import current_app

class SQLite3DB(db_handler.DBHandler):
    def __init__(self):
        pass


    def close(self, db_handle):
        db_handle.close()
        print("SQLITE close db!")


    def setup_connection(self, db_path):
        print("Setting up sqlite3 database")
        db_handle = sqlite3.connect(
            database=db_path,
            detect_types=sqlite3.PARSE_DECLTYPES
        )
        db_handle.row_factory = sqlite3.Row
        return db_handle

    # TODO - probably should not rely on flask at all
    def initialize(self, db_handle, schema_path: str):
        with current_app.open_resource(schema_path) as f:
            db_handle.executescript(f.read().decode('utf-8'))


    def get_user_data(self, db_handle, user_id: int):
        return db_handle.execute(
            'SELECT * FROM user WHERE id = ?', (user_id,)
        ).fetchone()


    def get_username_data(self, db_handle, username: str):
        return db_handle.execute(
            'SELECT * FROM user WHERE username = ?', (username, )
        ).fetchone()

        
