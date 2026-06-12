import sqlite3
from . import db_handler

from flask import current_app


class SQLite3DB(db_handler.DBHandler):
    WALLET_TABLE = "wallet_assets_"
    EVENTS_TABLE = "events_"
    META_TABLE = "meta_"
    # delet from table name ... WHERE name='table name'
    RESET_TABLE = "DELETE FROM {};"
    RESET_AUTOINCREMENT = "DELETE FROM SQLITE_SEQUENCE \
                            WHERE name=?; "
    VACUUM = "VACUUM;"

    # create events table
    CREATE_EVENTS_TABLE = "CREATE TABLE IF NOT EXISTS {} \
                        (id INTEGER PRIMARY KEY AUTOINCREMENT, \
                        timestamp INTEGER NOT NULL, \
                         table_name TEXT NOT NULL, \
                         type TEXT NOT NULL, \
                         ulid TEXT NOT NULL); "

    APPLY_TIMESTAMP_INDEX = "CREATE INDEX IF NOT EXISTS idx_events_timestamp\
                            ON {}(timestamp);"

    ADD_EVENT_RECORD = "INSERT INTO {} (timestamp, table_name, type, ulid)\
                        VALUES (?, ?, ?, ?);"

    DELETE_EVENT_RECORD = (
        "DELETE FROM {} WHERE timestamp=? AND table_name=? AND type=? AND ulid=?;"
    )
    GET_EVENT_IDS_FROM = "SELECT * FROM {} WHERE id > ? ORDER BY id ASC;"
    GET_EVENT_BY_ID = "SELECT * FROM {} WHERE id = ?;"

    # encrypted data
    CREATE_ENCRYPTED_TABLE = "CREATE TABLE IF NOT EXISTS {} \
                                (id INTEGER PRIMARY KEY AUTOINCREMENT, \
                                    ulid TEXT UNIQUE NOT NULL, \
                                    hash TEXT NOT NULL, \
                                    payload BLOB NOT NULL); "

    ADD_ENCRYPTED_RECORD = "INSERT INTO {} (ulid, hash, payload) VALUES (?, ?, ?);"
    REMOVE_ENCRYPTED_RECORD = "DELETE FROM {} WHERE ulid=?;"
    GET_ENCRYPTED_RECORD = "SELECT * FROM {} WHERE ulid=?;"
    GET_ALL_ENCRYPTED_RECORDS = "SELECT * FROM {} WHERE 1=1;"

    # update meta table
    CREATE_META_TABLE = "CREATE TABLE IF NOT EXISTS {} \
                        (id INTEGER PRIMARY KEY AUTOINCREMENT, \
                            table_name TEXT UNIQUE NOT NULL,\
                            hash TEXT NOT NULL);"

    UPDATE_META = "INSERT INTO {} (table_name, hash)\
                    VALUES (?, ?)\
                    ON CONFLICT(table_name)\
                    DO UPDATE SET\
                        table_name=excluded.table_name,\
                        hash=excluded.hash;"

    GET_META = "SELECT * FROM {} WHERE table_name = ?;"

    def __init__(self):
        pass

    def close(self, db_handle):
        db_handle.close()
        print("SQLITE close db!")

    def setup_connection(self, db_path):
        print("Setting up sqlite3 database")
        db_handle = sqlite3.connect(
            database=db_path, detect_types=sqlite3.PARSE_DECLTYPES
        )
        db_handle.row_factory = sqlite3.Row
        return db_handle

    # TODO - probably should not rely on flask at all
    def initialize(self, db_handle, schema_path: str):
        with current_app.open_resource(schema_path) as f:
            db_handle.executescript(f.read().decode("utf-8"))

    def get_user_data(self, db_handle, user_id: int):
        return db_handle.execute(
            "SELECT * FROM user WHERE id = ?", (user_id,)
        ).fetchone()

    def get_username_data(self, db_handle, username: str):
        return db_handle.execute(
            "SELECT * FROM user WHERE username = ?", (username,)
        ).fetchone()

    def reset_collection(self, db_handle, user_id: int, table_name: str) -> bool:
        """
        Reset the db collection
        """

        collection = table_name + "_" + str(user_id)
        try:
            db_handle.execute(
                SQLite3DB.RESET_TABLE.format(collection),
            )
            db_handle.execute(SQLite3DB.RESET_AUTOINCREMENT, (collection,))
            db_handle.commit()
            db_handle.execute(SQLite3DB.VACUUM)
            return True
        except Exception:
            db_handle.rollback()
            return False

    def add_event_record(
        self,
        db_handle,
        user_id: int,
        timestamp: int,
        table_name: str,
        type: str,
        ulid: str,
    ) -> bool:
        table = SQLite3DB.EVENTS_TABLE + str(user_id)
        try:
            db_handle.execute(SQLite3DB.CREATE_EVENTS_TABLE.format(table))
            db_handle.execute(SQLite3DB.APPLY_TIMESTAMP_INDEX.format(table))

            cursor = db_handle.execute(
                SQLite3DB.ADD_EVENT_RECORD.format(table),
                (timestamp, table_name, type, ulid),
            )

            # db_handle.commit()
            return cursor.lastrowid
        except Exception:
            db_handle.rollback()
            return -1

    def add_encrypted_data_record(
        self, db_handle, table_name: str, user_id: int, ulid: int, hash: str, payload
    ) -> int:
        table = table_name + "_" + str(user_id)
        # try creating table if not exists already and add record
        try:
            db_handle.execute(SQLite3DB.CREATE_ENCRYPTED_TABLE.format(table))
            cursor = db_handle.execute(
                SQLite3DB.ADD_ENCRYPTED_RECORD.format(table),
                (
                    ulid,
                    hash,
                    payload,
                ),
            )
            # db_handle.commit()
            return cursor.lastrowid
        except Exception:
            db_handle.rollback()
            return -1

    def get_encrypted_record(self, db_handle, table_name: str, user_id: int, ulid: str):
        table = table_name + "_" + str(user_id)

        try:
            val = db_handle.execute(
                SQLite3DB.GET_ENCRYPTED_RECORD.format(table),
                (ulid,),
            ).fetchone()
            return val
        except Exception:
            db_handle.rollback()
            return None

    def remove_encrypted_record(
        self, db_handle, table_name: str, user_id: int, ulid: str
    ):
        table = table_name + "_" + str(user_id)

        try:
            db_handle.execute(SQLite3DB.REMOVE_ENCRYPTED_RECORD.format(table), (ulid,))
            # db_handle.commit()
            return True
        except Exception:
            db_handler.rollback()
            return False

    def get_events_from_id(self, db_handle, user_id, last_event_id) -> list[int]:
        table = SQLite3DB.EVENTS_TABLE + str(user_id)
        try:
            records = db_handle.execute(
                self.GET_EVENT_IDS_FROM.format(table),
                (last_event_id,),
            ).fetchall()
            ids = [row[0] for row in records]
            return ids
        except Exception as e:
            db_handle.rollback()
            return []

    def get_event(self, db_handle, user_id, event_id):
        table = SQLite3DB.EVENTS_TABLE + str(user_id)
        try:
            record = db_handle.execute(
                self.GET_EVENT_BY_ID.format(table),
                (event_id,),
            ).fetchone()

            return record
        except Exception:
            return None

    def update_collection_hash(self, db_handle, user_id, table_name, hash):
        table = SQLite3DB.META_TABLE + str(user_id)
        table_record = (
            table_name + "_" + str(user_id)
        )  # table which record should be updated
        try:
            db_handle.execute(SQLite3DB.CREATE_META_TABLE.format(table))
            db_handle.execute(
                SQLite3DB.UPDATE_META.format(table),
                (
                    table_record,
                    hash,
                ),
            )
            db_handle.commit()
            return True
        except Exception:
            db_handle.rollback()
            return False

    def get_collection_hash(self, db_handle, user_id, table_name):
        table = SQLite3DB.META_TABLE + str(user_id)
        table_record = table_name + "_" + str(user_id)
        try:
            hash = db_handle.execute(SQLite3DB.GET_META.format(table), (table_record,))
            return hash.fetchone()[2]
        except Exception:
            db_handle.rollback()

    def get_all_encrypted_records(self, db_handle, user_id, table_name):
        table = table_name + "_" + str(user_id)
        try:
            cursor = db_handle.execute(
                SQLite3DB.GET_ALL_ENCRYPTED_RECORDS.format(table)
            )
            return cursor.fetchall()
        except Exception:
            print("FAIL!!!")
