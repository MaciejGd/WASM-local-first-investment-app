from http import HTTPStatus
from unittest.mock import patch

import mongomock

from inv_app.finance_api import finance_api, indicators


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

        response = client.get("/api/finance/get_stocks_list")
        assert response.json == ["LPP.WA", "ZAB.WA"]
        assert response.status_code == HTTPStatus.OK


@patch("inv_app.finance_api.mongo_handler.MongoClient", new=mongomock.MongoClient)
def test_get_recent_prices(client):
    with client.application.app_context():
        handler = finance_api.db_handler
        handler.client["StockData"]["StockPrices"].insert_many(
            [
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
            ]
        )
        response = client.post(
            "/api/finance/get_recent_prices", json=["BDX.PL", "ZAB.WA"]
        )
        assert response.status_code == HTTPStatus.OK
        assert response.json == {
            "BDX.PL": {"date": "2024-01-10", "price": 100},
            "ZAB.WA": {"date": "2024-01-05", "price": 23},
        }


@patch("inv_app.finance_api.mongo_handler.MongoClient", new=mongomock.MongoClient)
def test_get_stock_prices(client):
    with client.application.app_context():
        handler = finance_api.db_handler
        handler.client["StockData"]["StockPrices"].insert_many(
            [
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
            ]
        )
        response = client.post(
            "/api/finance/get_stocks_prices", json={"tickers": ["BDX.PL", "ZAB.WA"]}
        )
        assert response.status_code == HTTPStatus.OK
        assert response.json == [
            {
                "prices": {"2024-01-10": 100, "2024-01-02": 21, "2024-01-03": 5},
                "ticker": "BDX.PL",
            },
            {
                "prices": {"2024-01-04": 20, "2024-01-02": 2, "2024-01-05": 23},
                "ticker": "ZAB.WA",
            },
        ]

@patch("inv_app.finance_api.mongo_handler.MongoClient", new=mongomock.MongoClient)
def test_get_indicators(client):
    with client.application.app_context():
        handler = finance_api.db_handler
        handler.client["StockData"]["StockMarkers"].insert_many(
            [
                {
                    "ticker": "EUP.WA",
                    "2024-01-10": {"close": 40, "open": 40, "test": 40},
                    "2024-01-20": {"close": 39, "open": 41, "test": 10},
                },
                {
                    "ticker": "BDX.PL",
                    "2024-01-10": {"close": 100, "open": 21, "test": 5},
                    "2024-01-20": {"close": 101, "open": 22, "test": 6},
                },
                {
                    "ticker": "ZAB.WA",
                    "2024-01-10": {"close": 20, "open": 2, "test": 23},
                    "2024-01-20": {"close": 26, "open": 4, "test": 13},
                },
            ]
        )
        response = client.get(
            "/api/finance/get_indicator/ZAB.WA/open"
        )
        assert response.status_code == HTTPStatus.OK
        assert response.json == {
            "2024-01-10" : 2,
            "2024-01-20" : 4,
        }


@patch("inv_app.finance_api.mongo_handler.MongoClient", new=mongomock.MongoClient)
def test_get_indicators_list(client):
    with client.application.app_context():
        response = client.get(
            "/api/finance/get_indicators_list"
        )
        assert response.status_code == HTTPStatus.OK
        assert response.json == indicators.INDICATORS