import pytest
from inv_app import finance

from unittest.mock import MagicMock


@pytest.fixture
def finance_api(monkeypatch):
    fin_api = MagicMock()
    fin_api.get_stock_prices.return_value = {"test": "test"}
    fin_api.get_stocks_prices.return_value = {"test": "test"}
    fin_api.get_tickers_list.return_value = ["test"]
    monkeypatch.setattr(finance, "finance_api", fin_api)
    return fin_api


def test_get_stock_prices(client, finance_api):
    response = client.get("/finance/get_stock_prices/LPP.WA")
    assert response.data == b'{"test":"test"}\n'
    finance_api.get_stock_prices.assert_called_once_with("LPP.WA")


def test_get_stocks_prices(client, finance_api):
    response = client.post(
        "/finance/get_stocks_prices", json={"tickers": ["LPP.WA", "BDX.WA"]}
    )
    assert response.data == b'{"test":"test"}\n'
    finance_api.get_stocks_prices.assert_called_once_with(["LPP.WA", "BDX.WA"])


def test_get_tickers_list(client, finance_api):
    response = client.get("/finance/get_stocks_list")
    assert response.data == b'["test"]\n'
    assert finance_api.get_tickers_list.called == True
