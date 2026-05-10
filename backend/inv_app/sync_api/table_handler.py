
from abc import ABC, abstractmethod
from ..db import db_proxy


class ITableHandler(ABC):
    """
    Interface that Table Handlers should inherit from
    """

    def __init__(self):
        pass

    @abstractmethod
    def add_record(self, user_id, payload) -> bool:
        pass

    @abstractmethod
    def remove_record(self, user_id, payload) -> bool:
        pass

    def purge_table(self, user_id: int, table_name: str) -> bool:
        return db_proxy.reset_collection(user_id, table_name)


class WalletAssetTableHandler(ITableHandler):    
    """
    Implementation of ITableHandler. Used for filling wallet assets table
    """

    def __init__(self):
        self.ticker_col = "ticker"
        self.quantity_col = "quantity"
        self.price_col = "price"

    def add_record(self, user_id, payload) -> bool:
        ticker = payload.get(self.ticker_col)

        quant = payload.get(self.quantity_col)
        price = payload.get(self.price_col)
        if ticker is None or quant is None or price is None:
            return False

        return db_proxy.add_wallet_asset(user_id, ticker, quant, price)
        

    def remove_record(self, user_id, payload) -> bool:
        pass


class EventTableHandler(ITableHandler):
    def __init__(self):
        self.table_col = "table_name"
        self.ulid_col = "ulid"
        self.timestamp_col = "timestamp"
        self.type_col = "type" 
        pass

    def add_record(self, user_id, payload):
        (timestamp, table_name, type, ulid) = self._unpack_payload(payload)
        if table_name is None or ulid is None or timestamp is None or type is None:
            return False
        return db_proxy.add_event_record(user_id, timestamp, table_name, type, ulid)

    def remove_record(self, user_id, payload):
        (timestamp, table_name, type, ulid) = self._unpack_payload(payload)
        if table_name is None or ulid is None or timestamp is None or type is None:
            return False

        return db_proxy.remove_event_record(user_id, timestamp, table_name, type, ulid)
    
    def _unpack_payload(self, payload):
        table_name = payload.get(self.table_col)
        ulid = payload.get(self.ulid_col)
        timestamp = payload.get(self.timestamp_col)
        type = payload.get(self.type_col)
        return (timestamp, table_name, type, ulid)