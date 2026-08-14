import sqlite3

from flask import current_app

from . import db_handler


class SQLite3DB(db_handler.DBHandler):
    WALLET_TABLE = "wallet_assets_"
    EVENTS_TABLE = "events"
    META_TABLE = "meta_"

    RESET_TABLE = "DELETE FROM {};"
    RESET_AUTOINCREMENT = "DELETE FROM SQLITE_SEQUENCE \
                            WHERE name=?; "
    VACUUM = "VACUUM;"

    ADD_EVENT_RECORD = "INSERT INTO events (table_name, type, ulid, user_id)\
                        VALUES (?, ?, ?, ?);"

    GET_EVENT_IDS_FROM = "SELECT * FROM events WHERE user_id = ? and id > ? ORDER BY id ASC;"
    GET_EVENT_BY_ID = "SELECT * FROM events WHERE  user_id = ? and id = ?;"

    # encrypted data 
    ADD_ENCRYPTED_RECORD = "INSERT INTO {} (ulid, hash, payload, user_id) VALUES (?, ?, ?, ?);"
    REMOVE_ENCRYPTED_RECORD = "DELETE FROM {} WHERE ulid=? and user_id=?;"
    GET_ENCRYPTED_RECORD = "SELECT * FROM {} WHERE ulid=? and user_id=?;"
    GET_ALL_ENCRYPTED_RECORDS = "SELECT * FROM {} WHERE user_id=?;"

    UPDATE_META = "INSERT INTO meta (table_name, hash, user_id)\
                    VALUES (?, ?, ?)\
                    ON CONFLICT(user_id, table_name)\
                    DO UPDATE SET\
                        table_name=excluded.table_name,\
                        hash=excluded.hash,\
                        user_id=excluded.user_id"


    GET_META = "SELECT * FROM meta WHERE table_name=? and user_id=?;"

    REGISTER_USER = "INSERT INTO user (username, password, salt) VALUES (?, ?, ?);"

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

    def register_user(self, db_handle, username, password, salt):
        """
        Try registering user into db. return tuple with two strings, salt and error.
        """
        try:
            db_handle.execute(
                self.REGISTER_USER,
                (username, password, salt),
            )
            db_handle.commit()
            return salt
        except sqlite3.IntegrityError:
            return None

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
        table_name: str,
        type: str,
        ulid: str,
    ) -> int:
        try:
            cursor = db_handle.execute(
                SQLite3DB.ADD_EVENT_RECORD,
                (table_name, type, ulid, user_id),
            )

            return cursor.lastrowid
        except Exception:
            db_handle.rollback()
            return -1

    def add_encrypted_data_record(
        self, db_handle, user_id: int, table_name: str, ulid: int, hash: str, payload
    ) -> int:
        table = table_name
        # try creating table if not exists already and add record
        try:
            cursor = db_handle.execute(
                SQLite3DB.ADD_ENCRYPTED_RECORD.format(table),
                (
                    ulid,
                    hash,
                    payload,
                    user_id,
                ),
            )
            return cursor.lastrowid
        except Exception:
            db_handle.rollback()
            return -1

    def get_encrypted_record(self, db_handle, user_id: int, table_name: str, ulid: str):
        table = table_name

        try:
            val = db_handle.execute(
                SQLite3DB.GET_ENCRYPTED_RECORD.format(table),
                (ulid, user_id),
            ).fetchone()
            return val
        except Exception:
            db_handle.rollback()
            return None

    def remove_encrypted_record(
        self, db_handle, user_id: int, table_name: str, ulid: str
    ):
        try:
            db_handle.execute(SQLite3DB.REMOVE_ENCRYPTED_RECORD.format(table_name), (ulid, user_id,))
            return True
        except Exception:
            db_handle.rollback()
            return False

    def get_events_from_id(self, db_handle, user_id, last_event_id) -> list[int]:
        try:
            records = db_handle.execute(
                self.GET_EVENT_IDS_FROM,
                (user_id, last_event_id,),
            ).fetchall()
            ids = [row[0] for row in records]
            return ids
        except Exception:
            db_handle.rollback()
            return []

    def get_event(self, db_handle, user_id, event_id):
        try:
            record = db_handle.execute(
                self.GET_EVENT_BY_ID,
                (user_id, event_id,),
            ).fetchone()

            return record
        except Exception:
            return None

    def update_collection_hash(
        self, db_handle, user_id: int, collection_name: str, hash: str
    ):
        try:
            db_handle.execute(
                SQLite3DB.UPDATE_META,
                (
                    collection_name,
                    hash,
                    user_id,
                ),
            )
            db_handle.commit()
            return True
        except Exception:
            db_handle.rollback()
            return False

    def get_collection_hash(
        self, db_handle, user_id: int, collection_name: str
    ) -> str | None:
        try:
            cursor = db_handle.execute(
                SQLite3DB.GET_META, (collection_name, user_id,)
            )
            return cursor.fetchone()[2]
        except Exception:
            # if hash is not in the db, then we should just return the zeros
            return "0" * 40 # simulate empty hash

    def get_all_encrypted_records(self, db_handle, user_id, table_name):
        try:
            cursor = db_handle.execute(
                SQLite3DB.GET_ALL_ENCRYPTED_RECORDS.format(table_name), (user_id,)
            )
            return cursor.fetchall()
        except Exception:
            return None
