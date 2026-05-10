import sqlite3
from . import db_handler

from flask import current_app

class SQLite3DB(db_handler.DBHandler):
    WALLET_TABLE = "wallet_assets_"
    # delet from table name ... WHERE name='table name'
    RESET_TABLE = "DELETE FROM {};"
    RESET_AUTOINCREMENT = "DELETE FROM SQLITE_SEQUENCE \
                            WHERE name=?; "            
    VACUUM = "VACUUM;"
    # create table if it does not already exists
    CREATE_WALLET_ASSET_TABLE = "CREATE TABLE IF NOT EXISTS wallet_assets_{} \
                    (id INTEGER PRIMARY KEY AUTOINCREMENT, \
                     ticker TEXT NOT NULL, \
                     quantity REAL NOT NULL, \
                     price REAL NOT NULL); "
    # insert record to the wallet asset table
    ADD_WALLET_ASSET = "INSERT INTO wallet_assets_{} (ticker, quantity, price)\
                    VALUES (?, ?, ?)"

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
    

    def reset_wallet_assets(self, db_handle, user_id) -> bool:
        """
            Reset the user data table
        """
        # table for the user would be 
        wallet_table = SQLite3DB.WALLET_TABLE + str(user_id)
        try:
            db_handle.execute(
                SQLite3DB.RESET_TABLE.format(wallet_table), 
            )
            db_handle.execute(
                SQLite3DB.RESET_AUTOINCREMENT, (wallet_table,)
            )
            db_handle.commit()
            db_handle.execute(
                SQLite3DB.VACUUM
            )
            return True
        except:
            return False
        

    def add_wallet_asset(self, db_handle, user_id: int, ticker: str, quantity: float, price: float) -> bool:
        try:
            # try creating table if not exists
            db_handle.execute(SQLite3DB.CREATE_WALLET_ASSET_TABLE.format(user_id))
            # run query for inserting into a table
            db_handle.execute(SQLite3DB.ADD_WALLET_ASSET.format(user_id), 
                                (ticker, quantity, price,))
            db_handle.commit() # commit changes
            return True
        except:
            return False
        
