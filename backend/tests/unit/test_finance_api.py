from unittest.mock import MagicMock

import pytest

from inv_app.finance_api import FinanceAPIException, FinanceDataAPI


@pytest.fixture
def mongo_handler():
    mongo_h = MagicMock()

    mongo_h.find_one.return_value = ""
    mongo_h.get_all_docs.return_value = ""

    return mongo_h


@pytest.fixture
def finance_api(mongo_handler):
    fin_api = FinanceDataAPI()
    fin_api.db_handler = mongo_handler

    return fin_api


def test_get_tickers_list(finance_api, mongo_handler):
    mongo_handler.get_all_docs.return_value = [
        {"ticker": "LPP.WA"},
        {"ticker": "BDX.WA"},
    ]
    db_name = finance_api.db_name
    col_name = finance_api.stock_markers_col
    result = finance_api.get_tickers_list()

    mongo_handler.get_all_docs.assert_called_once_with(db_name, col_name)
    assert result == ["LPP.WA", "BDX.WA"]


def test_get_tickers_list_throw(finance_api, mongo_handler):
    mongo_handler.get_all_docs.side_effect = Exception("test")
    with pytest.raises(Exception) as exc_info:
        finance_api.get_tickers_list()
    assert "Failed to retrieve tickers" in exc_info.value.args[0]


def test_get_stocks_prices(finance_api):
    ticker_lpp = {"ticker": "LPP.WA", "Close": 1}
    ticker_bdx = {"ticker": "BDX.WA", "Close": 2}
    ticker_cdr = {"ticker": "CDR.WA", "Close": 3}

    def my_get_stock(ticker: str):
        if ticker == "LPP.WA":
            return ticker_lpp
        if ticker == "BDX.WA":
            return ticker_bdx
        if ticker == "CDR.WA":
            return ticker_cdr

    finance_api.get_stock_prices = MagicMock(side_effect=my_get_stock)
    results = finance_api.get_stocks_prices(["LPP.WA", "BDX.WA", "CDR.WA"])
    assert results == [ticker_lpp, ticker_bdx, ticker_cdr]


def test_get_indicators_values(finance_api, mongo_handler):
    mongo_handler.find_one.return_value = {
        "ticker": "test_ticker",
        "10": {"start": 21, "end": 31, "test": 11},
        "11": {"start": 22, "end": 32, "test": 12},
        "12": {"start": 23, "end": 33, "test": 13},
    }    
    ret = finance_api.get_indicator("test_ticker", "test")
    mongo_handler.find_one.assert_called_once_with(
        "StockData", "StockMarkers", {"ticker": "test_ticker"}
    )
    assert ret == {
        "10": 11,
        "11": 12,
        "12": 13,
    }

def test_get_indicators_ticker_not_found(finance_api, mongo_handler):
    mongo_handler.find_one.return_value = None
    
    with pytest.raises(FinanceAPIException):
        finance_api.get_indicator("test_ticker", "test")        
    assert mongo_handler.find_one.called
