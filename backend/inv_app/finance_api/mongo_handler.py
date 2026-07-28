"""
Simple class wrapper for MongoDb calls
"""

from pymongo import MongoClient


class MongoHandler:
    def __init__(self, uri: str):
        self.uri = uri
        self.client = MongoClient(uri)

    def get_db(self, db_name: str):
        try:
            db = self.client.get_database(db_name)
            return db
        except Exception as e:
            raise Exception(f"Failed to get db: {db_name}") from e

    def get_collection(self, db, col_name: str):
        """Try getting collection from db"""

        try:
            collection = db.get_collection(col_name)
            return collection
        except Exception as e:
            raise Exception(f"Collection: {col_name}") from e

    def find_one(self, db_name, col_name, filter):
        # get element from db and reset id
        try:
            db = self.get_db(db_name)
            col = self.get_collection(db, col_name)
            cursor = col.find_one(filter, {"_id": 0})
            return cursor
        except Exception as e:
            raise Exception("Failed to obtain one record from MongoDB") from e

    def get_all_docs(self, db_name, col_name):
        try:
            db = self.get_db(db_name)
            col = self.get_collection(db, col_name)
            cursor = col.find({}, {"ticker": 1})
            return cursor
        except Exception as e:
            raise Exception("Failed to get all docs from collection") from e
