from http import HTTPStatus
from unittest.mock import patch
from inv_app.finance_api import finance_api
import mongomock


@patch("inv_app.finance_api.mongo_handler.MongoClient", new=mongomock.MongoClient)
def test_get_tickers(client):
    with client.application.app_context():
        handler = finance_api.db_handler
        handler.client["StockData"]["StockInfo"].insert_many(
            [
                {
                    "ticker": "LPP.WA",
                    "price": 12,
                },
                {
                    "ticker": "ZAB.WA",
                    "price": 20,
                },
            ]
        )

        response = client.get("/finance/get_stocks_list")
        assert response.json == ["LPP.WA", "ZAB.WA"]
        assert response.status_code == HTTPStatus.OK


@patch("inv_app.finance_api.mongo_handler.MongoClient", new=mongomock.MongoClient)
def test_get_recent_prices(client):
    with client.application.app_context():
        handler = finance_api.db_handler
        handler.client["StockData"]["StockPrices"].insert_many([
            {
                "ticker": "BDX.PL",
                "Close": {"2024-01-10": 100, "2024-01-02": 21, "2024-01-03": 5},
            },
            {
                "ticker": "ZAB.WA",
                "Close": {"2024-01-04": 20, "2024-01-02": 2, "2024-01-05": 23},
            },
            {
                "ticker": "EUP.WA",
                "Close": {"2024-01-04": 40, "2024-01-02": 40, "2024-01-05": 40},
            },
        ])
        response = client.post("/finance/get_recent_prices", json=["BDX.PL", "ZAB.WA"])
        assert response.status_code == HTTPStatus.OK
        assert response.json == {
            "BDX.PL": {"date": "2024-01-10", "price": 100},
            "ZAB.WA": {"date": "2024-01-05", "price": 23},
        }


@patch("inv_app.finance_api.mongo_handler.MongoClient", new=mongomock.MongoClient)
def test_get_stock_prices(client):
    with client.application.app_context():
        handler = finance_api.db_handler
        handler.client["StockData"]["StockPrices"].insert_many([
            {
                "ticker": "EUP.WA",
                "Close": {"2024-01-04": 40, "2024-01-02": 40, "2024-01-05": 40},
            },
            {
                "ticker": "BDX.PL",
                "Close": {"2024-01-10": 100, "2024-01-02": 21, "2024-01-03": 5},
            },
            {
                "ticker": "ZAB.WA",
                "Close": {"2024-01-04": 20, "2024-01-02": 2, "2024-01-05": 23},
            },
        ])
        response = client.post("/finance/get_stocks_prices", json={"tickers" : ["BDX.PL", "ZAB.WA"]})
        assert response.status_code == HTTPStatus.OK
        assert response.json == [
            {"prices" : {"2024-01-10": 100, "2024-01-02": 21, "2024-01-03": 5}, "ticker" : "BDX.PL"},
            {"prices" : {"2024-01-04": 20, "2024-01-02": 2, "2024-01-05": 23}, "ticker" : "ZAB.WA"}
        ]