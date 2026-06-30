import { RequestGET } from "../../Requests";

export async function FetchStocksList() {
  const api_url = "http://127.0.0.1:5000/finance/get_stocks_list";
  const tickers_array = await RequestGET(api_url);
  return tickers_array;
}

// Fetch prices of the stock from remote server
export async function FetchStockPrices() {
  const tickers = SimAssetMap.getTickers(assets);
  const api_url = "http://127.0.0.1:5000/finance/get_stocks_prices";
  let response = await RequestPOST(api_url, tickers);
  if (!response.ok) {
    throw new Error("Failed to fetch data from remote.");
  }
  let responseJson = await response.json();
  return responseJson;
}
