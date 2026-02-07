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
    def setup_connection(self):
        raise NotImplementedError
    
    @abstractmethod
    def initialize(self, schema_path: str):
        raise NotImplementedError
