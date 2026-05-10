from collections import defaultdict
from .table_handler import ITableHandler, WalletAssetTableHandler

class DBUpdater:    
    def __init__(self):
        self.handlers = defaultdict(ITableHandler)
        self._initHandlersMap()


    def _initHandlersMap(self):
        self.handlers["wallet_assets"] = WalletAssetTableHandler()


    def add_record(self, user_id, table_name, payload) -> bool:
        handle = self.handlers.get(table_name)
        if handle is None:
            return False
        return handle.add_record(user_id, payload)


    def remove_record(self, user_id, table_name, payload) -> bool:
        handle = self.handlers.get(table_name)
        if handle is None:
            return False
        return handle.remove_record(user_id, payload)
    

    def purge_table(self, user_id, table_name) -> bool:
        handle = self.handlers.get(table_name)
        if handle is None:
            return False
        return handle.purge_table(user_id, table_name)