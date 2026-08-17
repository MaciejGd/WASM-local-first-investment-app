/**
 * Map of assets for the purpose of Simulations pane
 * Covers basic functionalities needed for the
 * Simulations purpose.
 */
export class SimAssetMap {
  /**
   * Add rectord to underlying map
   * @param {Object} asset_map JS object of ticker : stock info
   * @param {string} ticker ticker to be added to the list
   * @param {number} price price of ticker to be added as value
   * @returns true on success, false otherwise
   */
  static addRecord(asset_map, ticker, price) {
    // at first check if price can be turned into a number
    if (isNaN(Number(price))) {
      console.log("Price is not a number!!!");
      return false;
    }

    // append ticker with price to the map
    asset_map[ticker] = {
      ticker: ticker,
      price: Number(price),
      percent: 0.0,
      selected: false,
    };

    return true;
  }

  /**
   * Turn map to array and append percentage sum
   * @returns array of pairs: ticker:percent
   */
  static toArray(asset_map) {
    var sum = 0.0;
    for (let el in asset_map) {
      sum += Number(asset_map[el].price);
    }
    var array = Object.entries(asset_map);
    for (var i = 0; i < array.length; i++) {
      // append percentage value of each asset
      let percent = (array[i][1].price / sum) * 100;
      array[i][1].percent = percent.toFixed(2);
    }
    return array;
  }

  static getTickersArray(asset_map) {
    var array = Object.values(asset_map);
    // get key of the map's entry, which is a ticker
    return array.map((el) => {
      return el.ticker;
    });
  }

  /**
   * Set selected for requested ticker
   * @param {string} ticker ticker to be selected
   * @param {boolean} value True on selection, False otherwise
   * @returns null
   */
  static setSelected(asset_map, ticker, value) {
    let el = asset_map[ticker];
    if (el == undefined) {
      return;
    }
    el.selected = value;
    asset_map[ticker] = el;
  }

  /**
   * Delete from map, tickers that has been selected
   */
  static deleteSelected(asset_map) {
    const selected = [];
    var assets = Object.values(asset_map);
    // find which tickers have been selected
    assets.forEach((value) => {
      if (!value.selected) return;
      selected.push(value.ticker);
    });
    // delete selected tickers
    selected.forEach((key) => {
      delete asset_map[key];
    });
  }
  //

  /**
   * Return tickers from inner map
   * @returns object in form {"tickers":[array of tickers]}
   */
  static getTickers(asset_map) {
    const tickers = [];
    var assets = Object.values(asset_map);
    assets.forEach((value) => tickers.push(value.ticker));
    return tickers;
  }

  /**
   * Get price for particular assets in form of array
   */
  static getPrices(asset_map) {
    const prices = [];
    var assets = Object.values(asset_map);
    assets.forEach((value) => {
      prices.push(value.price);
    });
    return prices;
  }
}
