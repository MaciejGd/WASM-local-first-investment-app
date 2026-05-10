"""
Docstring for backend.inv_app.db.db_proxy
"""

from abc import ABC, abstractmethod

class DBHandler(ABC):
    """
    Proxy interface for DB implementations
    """
    def __init__(self):
        pass
    
    @abstractmethod
    def close(self):
        raise NotImplementedError
    
    @abstractmethod
    def setup_connection(self, db_path):
        raise NotImplementedError
    
    @abstractmethod
    def initialize(self, schema_path: str):
        raise NotImplementedError

    @abstractmethod
    def get_user_data(self, db_handle, user_id: int):
        raise NotImplementedError
    
    @abstractmethod
    def get_username_data(self, db_handle, username: str):
        raise NotImplementedError
    
    @abstractmethod
    def  reset_collection(self, db_handle, user_id: int) -> bool:
        raise NotImplementedError
    
    @abstractmethod
    def add_wallet_asset(self, db_handle, user_id: int, ticker: str, quantity: float, price: float) -> bool:
        raise NotImplementedError
    
    @abstractmethod
    def add_event_record(self, db_handle, user_id: int, timestamp: int, table_name: str, type: str, ulid: str) -> bool:
        raise NotImplementedError
        
    @abstractmethod
    def remove_event_record(self, db_handle, user_id: int, timestamp: int, table_name: str, type: str, ulid: str) -> bool:
        raise NotImplementedError