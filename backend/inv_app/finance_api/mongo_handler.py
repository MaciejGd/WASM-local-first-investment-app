"""
    Simple class wrapper for MongoDb calls
"""

from pymongo import MongoClient

class MongoHandler():
    def __init__(self, uri: str):
        self.uri = uri
        self.client = MongoClient(uri)
        self.db_cache = dict()
        self.col_cache = dict()

    def get_db(self, db_name: str):
        # try searching for db in cache
        if db_name in self.db_cache:
            return self.db_cache[db_name]
        # update cache if not stored already
        db_handle = self.client.get_database(db_name)
        self.db_cache[db_name] = db_handle
        return db_handle
    
    def get_collection(self, db, col_name: str):
        if col_name in self.col_cache:
            return self.col_cache[col_name]
        # update cache if not stored already
        collection = db.get_collection(col_name)
        self.col_cache[col_name] = collection
        return collection
    
    def find_one(self, db_name, col_name, filter):
        # get element from db and reset id 
        cursor = self.client[db_name][col_name].find_one(filter, {"_id" : 0})
        return cursor
        #return json.loads(json.dumps(cursor))


    

    

    

    