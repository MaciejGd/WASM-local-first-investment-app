from . import db_handler, db_sqlite

import click
from flask import current_app, g
import secrets

from werkzeug.security import generate_password_hash


class DBProxy(object):
    def __init__(self, db_instance: db_handler.DBHandler, schema_path: str):
        self.db_handler = db_instance
        self.schema_path = schema_path

    def get_db(self):
        if "db" not in g:
            g.db = self.db_handler.setup_connection(
                db_path=current_app.config["DATABASE"]
            )
        return g.db

    def close_db(self, e=None):
        # show exception if occurs
        if e is not None:
            print(e)

        db = g.pop("db", None)
        if db is not None:
            self.db_handler.close(db)

    def init_db(self):
        db = self.get_db()
        self.db_handler.initialize(db, self.schema_path)

    def register_user(self, username, password) -> str | None:
        """
        Register user with passed username and password. Additionally hash the password and generate
        random encryption salt for user. Returns tuple storing: salt (or None on error).
        """

        return self.db_handler.register_user(
            self.get_db(),
            username,
            generate_password_hash(password),
            secrets.token_hex(16),
        )

    def get_user_data(self, id: int):
        """
        Get information about the user specified with user_id from DB

        :param self: Description
        :param id: Description
        :type id: int id of user that we want get info about
        """

        db = self.get_db()
        return self.db_handler.get_user_data(db, id)

    def get_username_data(self, username: str):
        """
        Get information about the user by his username

        :param self: Description
        :param username: Username to be get from the db
        :type username: str
        """

        db = self.get_db()
        return self.db_handler.get_username_data(db, username)

    def reset_collection(self, user_id: int, table_name: str) -> bool:
        """
        Reset wallet table for the user

        :param self: Description
        :param user_id: id of the user that table should be purged
        :type username: int
        """

        db = self.get_db()
        return self.db_handler.reset_collection(db, user_id, table_name)

    def get_encrypted_record(self, user_id: int, table_name: str, ulid: str):
        """
        Get record from encrypted collection, identified by user_id

        :param table_name: name of the table to be modified
        :param user_id: id of user owning modified table
        :param ulid: unique identifier of the record
        """

        db = self.get_db()
        return self.db_handler.get_encrypted_record(db, user_id, table_name, ulid)

    def get_events_from_id(self, user_id: int, last_event_id: int) -> list[int]:
        """
        Get list of ids from the id specified in argument
        """

        db = self.get_db()
        return self.db_handler.get_events_from_id(db, user_id, last_event_id)

    def get_event(self, user_id: int, event_id: int):
        """
        Get event record from the event collection, specified by event_id
        """

        db = self.get_db()
        return self.db_handler.get_event(db, user_id, event_id)

    def get_collection_hash(self, user_id: int, col_name: str) -> str | None:
        """
        Get hash of the user's collection

        :param user_id: id of the user owning the table
        :param col_name: name of the collection we want hash from
        :returns: hash for the specified collection
        """

        db = self.get_db()
        return self.db_handler.get_collection_hash(db, user_id, col_name)

    def add_data_record(
        self,
        user_id,
        timestamp,
        table_name,
        type,
        ulid,
        record_hash,
        table_hash,
        payload,
    ):
        """
        Add data record to the dbs. Adds event as well as data and updates table hash.
        After all operations are performed successfully, commits to the db.

        :param user_id: id of the user owning the request
        :param timestamp: timestamp of event
        :param table_name: name of the table which is being modified
        :param type: type of the operetation
        :param ulid: unique identifier of the record
        :param hash: hash of the record
        :param payload: payload to be added to db
        """

        db = self.get_db()
        event_id = self.db_handler.add_event_record(
            db, user_id, table_name, timestamp, type, ulid
        )
        if event_id == -1:
            return None

        rec_id = self.db_handler.add_encrypted_data_record(
            db, user_id, table_name, ulid, record_hash, payload
        )
        if rec_id == -1:
            return None

        up_state = self.db_handler.update_collection_hash(
            db, user_id, table_name, table_hash
        )
        if not up_state:
            return None
        return event_id

    def get_all_encrypted_records(self, user_id, table_name):
        db = self.get_db()
        return self.db_handler.get_all_encrypted_records(db, user_id, table_name)

    def remove_data_record(
        self, user_id, timestamp, table_name, type, ulid, table_hash
    ):
        db = self.get_db()
        event_id = self.db_handler.add_event_record(
            db, user_id, table_name, timestamp, type, ulid
        )
        if event_id == -1:
            return None

        if table_hash is None:
            return event_id - 1

        rec_id = self.db_handler.remove_encrypted_record(db, user_id, table_name, ulid)
        if not rec_id:
            return None

        up_state = self.db_handler.update_collection_hash(
            db, user_id, table_name, table_hash
        )
        if not up_state:
            return None
        return event_id


# initialize db proxy with wanted implementation, for now sqlite3
db_proxy = DBProxy(db_sqlite.SQLite3DB(), "schema.sql")


@click.command("init-db")
def init_db_command():
    """
    Clear existing db and create a brand new one
    """
    db_proxy.init_db()
    click.echo("Initialized database")


def init_app(app):
    app.teardown_appcontext(db_proxy.close_db)
    app.cli.add_command(init_db_command)
