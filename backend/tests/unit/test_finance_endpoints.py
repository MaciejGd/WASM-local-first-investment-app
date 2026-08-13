from http import HTTPStatus
from unittest.mock import patch


@patch("inv_app.endpoints.finance.finance_api.get_stocks_prices", return_value=True)
def test_get_stocks_prices_correct(_, client):
    response = client.post(
        "/api/finance/get_stocks_prices", json={"tickers": ["LPP.WA", "BDX.WA"]}
    )
    assert response.status_code == HTTPStatus.OK


def test_get_stocks_prices_no_tickers(client):
    response = client.post(
        "/api/finance/get_stocks_prices", json={"test": ["LPP.WA", "BDX.WA"]}
    )
    assert response.status_code == HTTPStatus.BAD_REQUEST


def test_get_stocks_prices_no_tickers_no_list(client):
    response = client.post("/api/finance/get_stocks_prices", json={"tickers": "BDX.WA"})
    assert response.status_code == HTTPStatus.BAD_REQUEST


@patch("inv_app.endpoints.finance.finance_api.get_recent_prices", return_value=True)
def test_get_recent_prices_correct(_, client):
    response = client.post("/api/finance/get_recent_prices", json=["LPP.WA", "BDX.WA"])
    assert response.status_code == HTTPStatus.OK


def test_get_recent_prices_no_input_list(client):
    response = client.post("/api/finance/get_recent_prices", json={"ticker": "BDX.WA"})
    assert response.status_code == HTTPStatus.BAD_REQUEST


@patch("inv_app.endpoints.finance.finance_api.get_tickers_list", return_value=True)
def test_get_tickers_list(_, client):
    response = client.get("/api/finance/get_stocks_list")
    assert response.status_code == HTTPStatus.OK
