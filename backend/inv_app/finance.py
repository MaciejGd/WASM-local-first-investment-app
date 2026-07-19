"""
File with enpoints for receiving finance data
"""

from .finance_api import finance_api

from http import HTTPStatus
from flask import Blueprint, jsonify, request

bp = Blueprint("finance", __name__, url_prefix="/api/finance")


# post request for getting data of multiple tickers at once
@bp.route("/get_stocks_prices", methods=("POST",))
def get_stocks_prices():
    post_json = request.get_json()

    tickers = post_json.get("tickers")

    if tickers is None or not isinstance(tickers, list):
        return jsonify({"return": "Bad post JSON"}), HTTPStatus.BAD_REQUEST
    # TODO, check that and refactor so that it answers as get_recent_prices
    data = finance_api.get_stocks_prices(tickers)
    return jsonify(data)


@bp.route("/get_recent_prices", methods=("POST",))
def get_recent_prices():
    tickers = request.get_json()

    if not isinstance(tickers, list):
        return jsonify(
            {"return": "not list passed as a json object"}
        ), HTTPStatus.BAD_REQUEST

    data = finance_api.get_recent_prices(tickers)
    return jsonify(data)


@bp.route("/get_stocks_list", methods=("GET",))
def get_tickers_list():
    tickers = finance_api.get_tickers_list()
    return jsonify(tickers)
