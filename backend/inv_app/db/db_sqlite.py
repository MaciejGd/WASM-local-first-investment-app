import sqlite3
from . import db_handler

from flask import current_app

class SQLite3DB(db_handler.DBHandler):
    def __init__(self):
        self.db = None # db handle
        pass

    def close(self, db_handle):
        db_handle.close()
        print("SQLITE close db!")

    def setup_connection(self):
        print("Setting up sqlite3 database")
        db_handle = sqlite3.connect(
            current_app.config['DATABASE'],
            detect_types=sqlite3.PARSE_DECLTYPES
        )
        db_handle.row_factory = sqlite3.Row
        return db_handle
    
    def initialize(self, db_handle, schema_path: str):
        with current_app.open_resource(schema_path) as f:
            db_handle.executescript(f.read().decode('utf-8'))
