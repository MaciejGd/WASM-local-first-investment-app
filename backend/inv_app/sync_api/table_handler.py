
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
    def add_record(self, user_id, data) -> bool:
        pass

    @abstractmethod
    def remove_record(self, user_id, ulid, payload) -> bool:
        pass

    
    @abstractmethod
    def get_record(self, user_id, table_name, compare_obj) -> bool:
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


    def add_record(self, user_id, data) -> bool:
        (table_name, ulid, payload) = self._unpack_data(data)
        if table_name is None or user_id is None or ulid is None or payload is None:
            return False

        return db_proxy.add_encrypted_data_record(table_name, user_id, ulid, self._decode_payload(payload))
        

    def remove_record(self, user_id, data) -> bool:
        pass


    def get_record(self, user_id: int, table_name: str, compare_obj):
        ulid = compare_obj.get("ulid") # retrieve ulid from compare object
        if ulid is None:
            return False
        
        record = db_proxy.get_encrypted_record(table_name, user_id, ulid)
        return_object = {
            "ulid": record["ulid"],
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
        return (table_name, ulid, payload)


class EventTableHandler(ITableHandler):
    def __init__(self):
        self.table_col = "table_name"
        self.ulid_col = "ulid"
        self.timestamp_col = "timestamp"
        self.type_col = "type" 
        pass


    def add_record(self, user_id, data):
        (timestamp, table_name, type, ulid) = self._unpack_data(data)
        if table_name is None or ulid is None or timestamp is None or type is None:
            return False
        return db_proxy.add_event_record(user_id, timestamp, table_name, type, ulid)


    def remove_record(self, user_id, data):
        (timestamp, table_name, type, ulid) = self._unpack_data(data)
        if table_name is None or ulid is None or timestamp is None or type is None:
            return False

        return db_proxy.remove_event_record(user_id, timestamp, table_name, type, ulid)
    

    def get_record(self, user_id: int, table_name: str, compare_obj):
        pass


    def _unpack_data(self, data):
        table_name = data.get(self.table_col)
        ulid = data.get(self.ulid_col)
        timestamp = data.get(self.timestamp_col)
        type = data.get(self.type_col)
        return (timestamp, table_name, type, ulid)