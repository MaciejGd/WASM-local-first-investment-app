from .mongo_handler import MongoHandler
import json

uri = "mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.0.0"

class FinanceDataAPI():
    def __init__(self): 
        self.db_handler = MongoHandler(uri)
        self.db_name = "StockData"
        self.stock_prices_col = "StockPrices"
        self.stock_info_col = "StockInfo"
        self.stock_markers_col = "StockMarkers"

    def get_stocks_prices(self, tickers) -> dict:
        tickers_data = []
        for ticker in tickers:
            doc = self.get_stock_prices(ticker)
            tickers_data.append(doc)
        return tickers_data
        

    def get_stock_prices(self, ticker: str) -> dict:
        doc = self.db_handler.find_one(self.db_name, self.stock_prices_col, { "ticker" : ticker })        
        if doc is None:
            raise Exception("Requested ticker not found in db!!!")
        # from retrieved data get, ticker + closing prices
        # ticker_val = doc['ticker']
        # closed = doc['Close']
        return_dict = { 'ticker' : doc['ticker'], 'prices' : doc['Close'] }
        return return_dict


    def get_tickers_available(self) -> list[str]:
        pass
