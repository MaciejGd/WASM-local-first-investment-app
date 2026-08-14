import base64

from ..db import db_proxy


class DBUpdater:
    def __init__(self):
        self.registered_tables = {"wallet_assets", "sim_history"}

    def compare_hashes(self, user_id, hashes):
        res = {}
        for table, hash in hashes.items():
            if table not in self.registered_tables:
                print("Table not registered!!!")
                continue

            res[table] = {}
            current_hash = db_proxy.get_collection_hash(user_id, table)
            
            match = (hash == current_hash)
            res[table]["equal"] = match
            if match:
                continue

            # handle scenario in which we need to pass all records to remote db
            records = self.get_all_records(user_id, table)
            if records is None:
                res[table]["records"] = records
                continue
            records = [
                {
                    "ulid": record["ulid"],
                    "hash": record["hash"],
                    "payload": self._encode_payload(record["payload"]),
                }
                for record in records
            ]
            res[table]["records"] = records
        return res

    def get_all_records(self, user_id, table_name):

        return db_proxy.get_all_encrypted_records(user_id, table_name)

    def process_add_event(
        self, user_id, table_name, type, ulid, hash, payload
    ) -> int | None:
        table_hash = self.reevaluate_hash(user_id, table_name, hash)
        return db_proxy.add_data_record(
            user_id,
            table_name,
            type,
            ulid,
            hash,
            table_hash,
            self._decode_payload(payload),
        )

    def process_remove_event(self, user_id, table_name, type, ulid):
        # get hash of removed element
        obj_hash = self.get_record_hash(user_id, table_name, ulid)
        if obj_hash is None:
            table_hash = None
        else:
            table_hash = self.reevaluate_hash(user_id, table_name, obj_hash)

        return db_proxy.remove_data_record(user_id, table_name, type, ulid, table_hash)

    def process_event(self, user_id, table_name, type, ulid, hash, payload):
        """
        Process incoming user's event

        :param user_id: id of the user
        :param table_name: name of the table to be modified
        :param type: type of the event, either "add" or "remove"
        :param ulid: unique record identifier
        :param hash: hashed object for fast compliance check
        :param payload: data to be added to table
        """

        if table_name not in self.registered_tables:
            return False

        if type == "add":
            return self.process_add_event(
                user_id, table_name, type, ulid, hash, payload
            )

        elif type == "remove":
            return self.process_remove_event(user_id, table_name, type, ulid)

    def get_pending_events(self, user_id, last_event_id) -> list[int]:
        """
        Return list of events that happened from the last event

        :param user_id: user firing the request
        :param last_event_id: id of last event
        """

        return db_proxy.get_events_from_id(user_id, last_event_id)

    def get_event(self, user_id, event_id):
        return db_proxy.get_event(user_id, event_id)

    def get_data_record(self, user_id: int, table_name: str, ulid: str) -> dict | None:
        """
        Get record from encrypted table and process its content so it can be jsonified.
        """

        record = db_proxy.get_encrypted_record(user_id, table_name, ulid)
        if record is None:
            return None
        obj = {
            "ulid": record["ulid"],
            "hash": record["hash"],
            "payload": self._encode_payload(record["payload"]),
        }
        return obj

    def get_events(self, user_id, last_event_id):
        """
        Get all event's data and return it as list
        """

        ids = self.get_pending_events(user_id, last_event_id)

        records = []
        for id in ids:
            event_obj = self.get_event(user_id, id)
            event_dir = {
                "id": event_obj["id"],
                "table_name": event_obj["table_name"],
                "type": event_obj["type"],
                "ulid": event_obj["ulid"],
                "payload": None,
            }

            if event_dir["type"] in "add":
                encrypted_record = self.get_data_record(
                    user_id, event_dir["table_name"], event_dir["ulid"]
                )
                # already removed from db so do not propagate event
                if encrypted_record is None:
                    continue
                event_dir["payload"] = encrypted_record["payload"]
                event_dir["hash"] = encrypted_record["hash"]
                # here we should fetch payload as well
            records.append(event_dir)

        return records

    def _encode_payload(self, msg):
        """
        Encode encrypted payload so that it can be serializable

        :param msg: encrypted payload to be encoded
        """

        encoded_payload = base64.b64encode(msg).decode("utf-8")
        return encoded_payload

    def _decode_payload(self, payload):
        """
        Decode payload encoded as base64 string

        :param payload: data to be decoded
        """

        return base64.b64decode(payload)

    def reevaluate_hash(self, user_id, table_name, hash):
        """
        Obtain hash of table and count new one by xoring with provided as arg
        """

        old_hash = db_proxy.get_collection_hash(user_id, table_name)
        # count new hash using the old one
        new_hash = self._xor_hashes(old_hash, hash)
        return new_hash

    def _xor_hashes(self, hash1: str | None, hash2: str) -> str:
        """
        Turn two hash strings into bytes, hash them and stransform back to string
        """

        # cover edge case in which hash is empty on init
        if hash1 is None:
            return hash2

        b1 = bytes.fromhex(hash1)
        b2 = bytes.fromhex(hash2)

        if len(b1) != len(b2):
            raise ValueError("Hashes must be same length!")
        xored = bytes(a ^ b for a, b in zip(b1, b2))
        return xored.hex()

    def get_record_hash(self, user_id, table_name, ulid):
        row = db_proxy.get_encrypted_record(user_id, table_name, ulid)
        if not row:
            return None
        return row["hash"]  # hash is stored at second position
