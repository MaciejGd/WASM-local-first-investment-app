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
    

    def reset_user_wallet_table(self, user_id: int) -> bool:
        """
        Reset wallet table for the user
        
        :param self: Description
        :param user_id: id of the user that table should be purged
        :type username: int
        """

        db = self.get_db()
        return self.db_handler.reset_wallet_assets(db, user_id)
    

    def add_wallet_asset(self, user_id: int, ticker: str, quantity: float, price: float) -> bool:
        """
        Add new record to the user's wallet table

        :param self:
        :param user_id: id of the logged user
        :param ticker: ticker of asset
        :param quantity: amount of stock bought
        :param price: cost of one stock at buy time 
        """

        db = self.get_db()
        return self.db_handler.add_wallet_asset(db, user_id, ticker, quantity, price)
    


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

    
