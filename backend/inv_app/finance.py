"""
    File with enpoints for receiving finance data
"""

from .finance_api import finance_api

from flask import (
    Blueprint, jsonify, request
)

bp = Blueprint('finance', __name__, url_prefix='/finance')

# Get request for getting price of single stock
@bp.route('/get_stock_prices/<ticker>', methods=('GET', ))
def get_stock_prices(ticker):
    data = finance_api.get_stock_prices(ticker)
    return jsonify(data)

# post request for getting data of multiple tickers at once
@bp.route('/get_stocks_prices', methods=('POST',))
def get_stocks_prices():
    post_json = request.get_json()

    tickers = post_json.get("tickers")
    data = finance_api.get_stocks_prices(tickers)
    return jsonify(data)

@bp.route('/get_stocks_list', methods=('GET',))
def get_tickers_list():
    tickers = finance_api.get_tickers_list()
    return jsonify(tickers)
