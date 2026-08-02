import { RequestGET, RequestPOST } from "../../Requests";

export async function FetchStocksList() {
  const api_url = "/api/finance/get_stocks_list";
  const tickers_array = await RequestGET(api_url);
  return tickers_array;
}

export async function FetchIndicatorsList() {
  const api_url = "/api/finance/get_indicators_list";
  const indicators_list = await RequestGET(api_url);
  return indicators_list;
}

// Fetch prices of the stock from remote server
export async function FetchStockPrices(tickers) {
  const api_url = "/api/finance/get_stocks_prices";
  let response = await RequestPOST(api_url, tickers);
  if (!response.ok) {
    throw new Error("Failed to fetch data from remote.");
  }
  let responseJson = await response.json();
  return responseJson;
}

export async function GetRecentPrices(tickers) {
  const api_url = `/api/finance/get_recent_prices`;
  let response = await RequestPOST(api_url, tickers);

  if (!response.ok) {
    throw new Error("Failed to fetch stock prices from remote");
  }
  let responseJson = await response.json();
  return responseJson;
}

export async function GetIndicatorValues(ticker, indicator) {
  const api_url = `/api/finance/get_indicator/${ticker}/${indicator}`;
  return await RequestGET(api_url);
}
