
from abc import ABC, abstractmethod
from ..db import db_proxy
import base64

# TODO, change to some more generic name, like CollectionHandler or smth like this
class ITableHandler(ABC):
    """
    Interface that Table Handlers should inherit from
    """

    def __init__(self):
        pass

    @abstractmethod
    def add_record(self, user_id, data) -> int:
        pass

    @abstractmethod
    def remove_record(self, user_id, ulid, payload) -> bool:
        pass

    
    @abstractmethod
    def get_record(self, user_id: int, payload: dict):
        pass

    def purge_table(self, user_id: int, table_name: str) -> bool:
        return db_proxy.reset_collection(user_id, table_name)


class EncryptedTableHandler(ITableHandler):    
    """
    Implementation of ITableHandler. Used for filling encrypted tables
    """

    def __init__(self):
        self.ulid = "ulid"
        self.payload = "payload"
        self.table_name = "table_name"
        self.hash = "hash"


    def add_record(self, user_id, data) -> int:
        (table_name, ulid, hash, payload) = self._unpack_data(data)
        if table_name is None or user_id is None or ulid is None or payload is None or hash is None:
            return False

        return db_proxy.add_encrypted_data_record(
                            table_name, 
                            user_id, 
                            ulid, 
                            hash, 
                            self._decode_payload(payload)
                        )
        

    def remove_record(self, user_id, data) -> bool:
        (ulid, table_name) = self._unpack_remove_data(data)        
        if ulid is None or table_name is None or user_id is None:
            return False

        return db_proxy.remove_encrypted_record(table_name, user_id, ulid)


    def get_record(self, user_id: int, payload: dict):
        ulid = payload.get("compare_obj")
        table_name = payload.get("table_name")
        if ulid is None or table_name is None:
            return None

        record = db_proxy.get_encrypted_record(table_name, user_id, ulid)
        if record is None:
            return None
        return_object = {
            "ulid": record["ulid"],
            "hash": record['hash'],
            "payload" : self._encode_payload(record["payload"]),
        }
        return return_object
    

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

    def _unpack_data(self, data):
        table_name = data.get(self.table_name)
        ulid = data.get(self.ulid)
        payload = data.get(self.payload)
        hash = data.get(self.hash)
        return (table_name, ulid, hash, payload)
    

    def _unpack_remove_data(self, data):
        ulid = data.get("ulid")
        table_name = data.get("table_name")
        return (ulid, table_name)


class EventTableHandler(ITableHandler):
    def __init__(self):
        self.table_col = "table_name"
        self.ulid_col = "ulid"
        self.timestamp_col = "timestamp"
        self.type_col = "type" 
        pass


    def add_record(self, user_id, data) -> int:
        (timestamp, table_name, type, ulid) = self._unpack_data(data)
        if table_name is None or ulid is None or timestamp is None or type is None:
            return False
        return db_proxy.add_event_record(user_id, timestamp, table_name, type, ulid)


    def remove_record(self, user_id, data):
        (timestamp, table_name, type, ulid) = self._unpack_data(data)
        if table_name is None or ulid is None or timestamp is None or type is None:
            return False

        return db_proxy.remove_event_record(user_id, timestamp, table_name, type, ulid)
    

    def get_record(self, user_id: int, payload: dict):
        event_id = payload.get("compare_obj")
        if event_id is None:
            return None
        
        return db_proxy.get_event(user_id, event_id)


    def get_events_from_id(self, user_id, last_event_id) -> list[int]: 
        return db_proxy.get_events_from_id(user_id, last_event_id)

    def _unpack_data(self, data):
        table_name = data.get(self.table_col)
        ulid = data.get(self.ulid_col)
        timestamp = data.get(self.timestamp_col)
        type = data.get(self.type_col)
        return (timestamp, table_name, type, ulid)
    

class MetaTableHandler():
    def update_hash(self, user_id, table_name, hash):
        # what we need to do in here:
        # 1) get actual hash from the table
        # 2) xor it with our new hash
        # 3) put new hash to db
        old_hash = db_proxy.get_collection_hash(user_id, table_name)
        # count new hash using the old one
        new_hash = self._xor_hashes(old_hash, hash)
        db_proxy.update_collection_hash(user_id, table_name, new_hash)
        return True

    def _xor_hashes(self, hash1: str, hash2: str) -> str:
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
        xored = bytes(a ^ b for a,b in zip(b1,b2))
        return xored.hex()
    

    def get_record_hash(self, user_id, table_name, ulid):
        row = db_proxy.get_encrypted_record(table_name, user_id, ulid)
        if not row:
            return None
        return row['hash'] # hash is stored at second position