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
    def add_event_record(self, db_handle, user_id: int, timestamp: int, table_name: str, type: str, ulid: str) -> int:
        raise NotImplementedError
    
    @abstractmethod
    def add_encrypted_data_record(self, db_handle, table_name: str, user_id: int, ulid: int, hash: str, payload) -> int:
        raise NotImplementedError

    @abstractmethod
    def get_encrypted_record(self, db_handle, table_name: str, user_id: int, ulid: str):
        raise NotImplementedError
    
    @abstractmethod
    def remove_encrypted_record(self, db_handle, table_name: str, user_id: int, ulid: str):
        raise NotImplementedError
    
    @abstractmethod
    def get_events_from_id(self, db_handler, user_id, last_event_id):
        raise NotImplementedError
    
    @abstractmethod
    def get_event(self, db_handler, user_id, last_event_id):
        raise NotImplementedError
    
    @abstractmethod
    def get_collection_hash(self, db_handle, user_id: int, collection_name: str) -> str:
        raise NotImplementedError
    

    @abstractmethod
    def update_collection_hash(self, db_handle, user_id: int, collection_name: str, hash: str):
        raise NotImplementedError
