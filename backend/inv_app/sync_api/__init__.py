from collections import defaultdict
from .table_handler import ITableHandler, WalletAssetTableHandler, EventTableHandler

class DBUpdater:
    def __init__(self):
        self.handlers = defaultdict(ITableHandler)
        self.operations = {}
        self._initHandlersMap()
        self._initOperationsMap()


    def _initHandlersMap(self):
        """
        Initialize map of handlers for each table
        """

        self.handlers["wallet_assets"] = WalletAssetTableHandler()
        self.handlers["events"] = EventTableHandler()


    def _initOperationsMap(self):
        """
        Initialize map of available operations
        """

        self.operations["add"] = self.add_record
        self.operations["remove"] = self.remove_record


    def process_event(self, user_id, timestamp, table_name, type, ulid, payload):
        """
        Process incoming user's event

        :param user_id: id of the user
        :param timestamp: timestamp of event
        :param table_name: name of the table to be modified
        :param type: type of the event, either "add" or "remove"
        :param ulid: unique record identifier
        :param payload: data to be added to table
        """

        op = self.operations.get(type)
        if op is None:
            return False
        
        ev_handler = self.handlers.get("events")
        event_obj = {
            "timestamp" : timestamp,
            "table_name" : table_name,
            "type" : type,
            "ulid" : ulid
        }
        if not ev_handler.add_record(user_id, event_obj):
            return False

        if not op(user_id, table_name, payload):
           ev_handler.remove_record(user_id, event_obj) # remove event record if already added
           return False        
        return True


    def add_record(self, user_id, table_name, payload) -> bool:
        """
        Add record to the table

        :param user_id: id of the user 
        :param table_name: name of the table to be modified
        :param payload: payload to be added to table
        """

        handle = self.handlers.get(table_name)
        if handle is None:
            return False
        return handle.add_record(user_id, payload)


    def remove_record(self, user_id, table_name, payload) -> bool:
        """
        Remove record from table_name + user_id, specified by payload members

        :param user_id: user which data we are erasing
        :param table_name: table from which we wanna delete
        :param payload: object specifying fields to identify deleted object
        """

        handle = self.handlers.get(table_name)
        if handle is None:
            return False
        return handle.remove_record(user_id, payload)


    def purge_table(self, user_id, table_name) -> bool:
        """
        Purge table and reset auto-incrementation

        :param user_id: id of the user whose table we wanna purge
        :param table_name: table to be purged
        """

        handle = self.handlers.get(table_name)
        if handle is None:
            return False
        return handle.purge_table(user_id, table_name)
    