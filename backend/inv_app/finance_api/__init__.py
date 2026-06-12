from .mongo_handler import MongoHandler

uri = "mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.0.0"


class FinanceDataAPI:
    def __init__(self):
        self.db_handler = MongoHandler(uri)
        self.db_name = "StockData"
        self.stock_prices_col = "StockPrices"
        self.stock_info_col = "StockInfo"
        self.stock_markers_col = "StockMarkers"

    def get_stocks_prices(self, tickers) -> list:
        tickers_data = []
        for ticker in tickers:
            doc = self.get_stock_prices(ticker)
            tickers_data.append(doc)
        return tickers_data

    def get_stock_prices(self, ticker: str) -> dict:
        try:
            doc = self.db_handler.find_one(
                self.db_name, self.stock_prices_col, {"ticker": ticker}
            )
            if doc is None:
                return {}
            return_dict = {"ticker": doc["ticker"], "prices": doc["Close"]}
            return return_dict
        except Exception as e:
            raise Exception("Failed to get {} finance data".format(ticker)) from e

    def get_tickers_list(self) -> list[str]:
        try:
            cursor = self.db_handler.get_all_docs(self.db_name, self.stock_info_col)
            tickers = []
            for c in cursor:
                tickers.append(c["ticker"])
            return tickers
        except Exception as e:
            raise Exception("Failed to retrieve tickers list") from e


# finance data api that should be shared across all files
finance_api = FinanceDataAPI()
