from . import (
    db_handler, 
    db_sqlite
)

import click 
from flask import current_app, g

class DBProxy(object):
    def __init__(self, db_instance: db_handler.DBHandler, schema_path: str):
        self.db_handler = db_instance
        self.schema_path = schema_path

    def get_db(self):
        if 'db' not in g:
            g.db = self.db_handler.setup_connection()
        return g.db
    
    def close_db(self, e=None):
        # show exception if occurs
        if e is not None:
            print(e)

        db = g.pop('db', None)
        if db is not None:
            db.close()

    def init_db(self):
        db = self.get_db()
        self.db_handler.initialize(db, self.schema_path)

# initialize db proxy with wanted implementation, for now sqlite3
db_proxy = DBProxy(db_sqlite.SQLite3DB(), "schema.sql")

@click.command('init-db')
def init_db_command():
    """
    Clear existing db and create a brand new one
    """
    db_proxy.init_db()
    click.echo("Initialized database")


def init_app(app):
    app.teardown_appcontext(db_proxy.close_db)
    app.cli.add_command(init_db_command)

    
