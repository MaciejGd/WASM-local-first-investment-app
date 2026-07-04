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

    def get_recent_prices(self, tickers: str) -> dict:
        """Get most recent prices of stocks specified in the list passed as argument"""
        prices = {}
        for ticker in tickers:
            try:
                price = self.get_recent_price(ticker)
                prices[ticker] = price
            except Exception:
                prices[ticker] = None

        return prices

    def get_recent_price(self, ticker: str) -> dict:
        """Get most recent price of the specified ticker"""
        try:
            doc = self.db_handler.find_one(
                self.db_name, self.stock_prices_col, {"ticker": ticker}
            )

            if doc is None:
                raise Exception

            close_prices = doc.get("Close", {})

            if not close_prices:
                raise Exception

            last_date = max(close_prices.keys())
            last_price = close_prices[last_date]

            return {
                "date": last_date,
                "price": last_price,
            }

        except Exception as e:
            raise Exception("Failed to get {} finance data".format(ticker)) from e

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
