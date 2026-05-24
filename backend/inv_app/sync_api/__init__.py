from collections import defaultdict
from .table_handler import ( 
    ITableHandler, 
    EncryptedTableHandler, 
    EventTableHandler,
    MetaTableHandler,
)


class DBUpdater:
    def __init__(self):
        self.handlers = defaultdict(ITableHandler)
        self.operations = {}        
        self._initOperationsMap()
        self.event_handler = EventTableHandler()
        self.encrypted_table = EncryptedTableHandler()
        self.meta_handler = MetaTableHandler()
        self._initHandlersMap()


    def _initHandlersMap(self):
        """
        Initialize map of handlers for each table
        """

        self.handlers["wallet_assets"] =  self.encrypted_table
        self.handlers["sim_history"] = self.encrypted_table
        self.handlers["events"] = self.event_handler


    def _initOperationsMap(self):
        """
        Initialize map of available operations
        """

        self.operations["add"] = self.add_record
        self.operations["remove"] = self.remove_record


    def process_event(self, user_id, timestamp, table_name, type, ulid, hash, payload):
        """
        Process incoming user's event

        :param user_id: id of the user
        :param timestamp: timestamp of event
        :param table_name: name of the table to be modified
        :param type: type of the event, either "add" or "remove"
        :param ulid: unique record identifier
        :param hash: hashed object for fast compliance check
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

        event_id = ev_handler.add_record(user_id, event_obj)
        if event_id == -1:
            return -1
        # we should probably add everything in one take, so update both tables and commit both TODO
        if not op(user_id, ulid, table_name, hash, payload):
           return -1
        
        return event_id

    def get_record(self, user_id, table_name, compare_obj):
        """
        Get record from the db

        :param user_id: id of the user that owns the table
        :param table_name: name of the table from which we should obtain data
        :param compare_obj: params to be used for comparison
        :return: true on success, false otherwise
        """

        handle = self.handlers.get(table_name)
        if handle is None:
            return None

        return handle.get_record(user_id, 
                    {
                        "table_name" : table_name, 
                        "compare_obj" : compare_obj
                    })


    def add_record(self, user_id, ulid, table_name, hash, payload) -> bool:
        """
        Add record to the table

        :param user_id: id of the user 
        :param ulid: unique identifier of the record
        :param table_name: name of the table to be modified
        :param hash: hash of the record
        :param payload: payload to be added to table
        """

        handle = self.handlers.get(table_name)
        if handle is None:
            return False
        ret = handle.add_record(user_id, {
            "table_name" : table_name,
            "ulid" : ulid,
            "hash": hash,
            "payload" : payload
            })

        if not ret:
            return False
        
        if not self.meta_handler.update_hash(user_id, table_name, hash):
            return False
        return True
        

    def remove_record(self, user_id, ulid, table_name, hash=None, payload=None) -> bool:
        """
        Remove record from table_name + user_id, specified by payload members

        :param user_id: user which data we are erasing
        :param ulid: unique identifier of the record to be removed
        :param table_name: table from which we wanna delete
        :param hash: object hash, by default None for removing
        :param payload: object specifying fields to identify deleted object
        """

        handle = self.handlers.get(table_name)
        if handle is None:
            return False
        
        # get hash of removed element
        obj_hash = self.meta_handler.get_record_hash(user_id, table_name, ulid)
        if obj_hash is None:
            # record already removed from the db, return True 
            return True

        ret = handle.remove_record(user_id, {
            "ulid" : ulid,
            "table_name" : table_name,
        })
        if not ret:
            return False
        
        if not self.meta_handler.update_hash(user_id, table_name, obj_hash):
            return False
        return True


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
    

    def get_pending_events(self, user_id, last_event_id) -> list[int]:
        """
        Return list of events that happened from the last event

        :param user_id: user firing the request
        :param last_event_id: id of last event
        """

        return self.event_handler.get_events_from_id(user_id, last_event_id)
    

    def get_events(self, user_id, last_event_id):
        """
        Get all event's data 
        """

        ids = self.get_pending_events(user_id, last_event_id)

        records = []
        for id in ids:
            event_obj = self.event_handler.get_record(user_id, {'compare_obj' : id})
            event_dir = {
                "id" : event_obj[0],
                "timestamp" : event_obj[1],
                "table_name" : event_obj[2],
                "type" : event_obj[3],
                "ulid" : event_obj[4],
                "payload" : None,
            }

            if event_dir['type'] in "add":
                encrypted_record = self.get_record(
                    user_id, 
                    event_dir['table_name'],
                    event_dir['ulid']
                )
                # already removed from db so do not propagate event
                if encrypted_record is None:
                    continue
                event_dir['payload'] = encrypted_record['payload']
                # here we should fetch payload as well
            records.append(event_dir)

        return records