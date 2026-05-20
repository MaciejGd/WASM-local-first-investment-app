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
            g.db = self.db_handler.setup_connection(
                                        db_path=current_app.config['DATABASE']
                                    )
        return g.db
    
    def close_db(self, e=None):
        # show exception if occurs
        if e is not None:
            print(e)

        db = g.pop('db', None)
        if db is not None:
            self.db_handler.close(db)

    def init_db(self):
        db = self.get_db()
        self.db_handler.initialize(db, self.schema_path)

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
    

    def add_encrypted_data_record(self, table_name: str, user_id: int, ulid: int, payload: str) -> bool:
        """
        Add new data asset to the table specified by the table name and user_id

        :param table_name: name of the table to be modified. To be extended by user_id
        :param user_id: id of the user which data would be modified
        :param ulid: unique id of appended record
        :param payload: payload to be added to table
        """

        db = self.get_db()
        return self.db_handler.add_encrypted_data_record(db, table_name, user_id, ulid, payload)
    
    
    def add_event_record(self, user_id: int, timestamp: int, table_name: str, type: str, ulid: str) -> bool:
        """
        Add new event record to the user's event table

        :param user_id id of the user performing modifications
        :param timestamp of the performed operation
        :param table_name name of the table that we wanna modify
        :param ulid unique identifier of the record added
        :param type of the operation to be performed on db
        """

        db = self.get_db()
        return self.db_handler.add_event_record(db, user_id, timestamp, table_name, type, ulid)
    
    
    def remove_event_record(self, user_id: int, timestamp: int, table_name: str, type: str, ulid: str) -> bool:
        """
        Remove event record from the user's event table

        :param user_id id of the user performing modifications
        :param timestamp of the performed operation
        :param table_name name of the table that we wanna modify
        :param ulid unique identifier of the record added
        :param type of the operation to be performed on db
        """

        db = self.get_db()
        return self.db_handler.remove_event_record(db, user_id, timestamp, table_name, type, ulid)
    

    def get_encrypted_record(self, table_name: str, user_id: int, ulid: str):
        """
        Get record from encrypted collection, identified by user_id

        :param table_name: name of the table to be modified
        :param user_id: id of user owning modified table
        :param ulid: unique identifier of the record
        """

        db = self.get_db()
        return self.db_handler.get_encrypted_record(db, table_name, user_id, ulid)


    def remove_encrypted_record(self, table_name: str, user_id: int, ulid: str) -> bool:
        """
        Remove encrypted data record from collection

        :param table_name: name of the table to be modified
        :param user_id: id of the user owning the record
        :param ulid: unique identifier of the element to be removed
        """
        
        db = self.get_db()
        return self.db_handler.remove_encrypted_record(db, table_name, user_id, ulid)

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

    
