
from abc import ABC, abstractmethod
from ..db import db_proxy


class ITableHandler(ABC):
    """
    Interface that Table Handlers should inherit from
    """

    def __init__(self):
        pass

    @abstractmethod
    def add_record(self, user_id, payload) -> bool:
        pass

    @abstractmethod
    def remove_record(self, user_id, payload) -> bool:
        pass

    @abstractmethod
    def purge_table(self, user_id, table_name) -> bool:
        pass


class WalletAssetTableHandler(ITableHandler):    
    """
    Implementation of ITableHandler. Used for filling wallet assets table
    """

    def __init__(self):
        self.ticker_col = "ticker"
        self.quantity_col = "quantity"
        self.price_col = "price"


    def add_record(self, user_id, payload) -> bool:
        ticker = payload.get(self.ticker_col)

        quant = payload.get(self.quantity_col)
        price = payload.get(self.price_col)
        if ticker is None or quant is None or price is None:
            return False

        return db_proxy.add_wallet_asset(user_id, ticker, quant, price)
        

    def remove_record(self, user_id, payload) -> bool:
        pass

    def purge_table(self, user_id, table_name) -> bool:
        return db_proxy.reset_user_wallet_table(user_id)
