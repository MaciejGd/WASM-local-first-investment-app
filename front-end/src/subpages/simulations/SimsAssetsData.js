/**
 * Simple entity data of stock hold by SimAssetMap
 */
export class SimsData {
  constructor(ticker, price, percent, selected) {
    if (isNaN(Number(price))) {
      throw new Error("Price should be a number");
    }
    if (isNaN(Number(percent))) {
      throw new Error("Percent should be a number");
    }
    this.ticker = ticker;
    this.price = Number(price);
    this.percent = Number(percent);
    this.selected = selected;
  }
}

/**
 * Map of assets for the purpose of Simulations pane
 * Covers basic functionalities needed for the
 * Simulations purpose.
 */
export class SimAssetMap {
  constructor(other) {
    // we want to map ticker to its data
    if (other instanceof SimAssetMap) {
      this.asset_map = new Map(other.asset_map);
    } else {
      this.asset_map = new Map();
    }
  }

  /**
   * Add rectord to underlying map
   * @param {string} ticker ticker to be added to the list
   * @param {number} price price of ticker to be added as value
   * @returns true on success, false otherwise
   */
  addRecord(ticker, price) {
    // at first check if price can be turned into a number
    if (isNaN(Number(price))) {
      console.log("Price is not a number!!!");
      return false;
    }
    // append ticker with price to the map
    this.asset_map.set(ticker, new SimsData(ticker, price, 0.0, false));

    return true;
  }

  /**
   * Turn map to array and append percentage sum
   * @returns array of pairs: ticker:percent
   */
  toArray() {
    var sum = 0.0;
    this.asset_map.forEach((value) => {
      sum += value.price;
    });
    var array = Array.from(this.asset_map);
    for (var i = 0; i < array.length; i++) {
      // append percentage value of each asset
      let percent = (array[i][1].price / sum) * 100;
      array[i][1].percent = percent.toFixed(2);
    }
    return array;
  }

  getTickersArray() {
    var array = Array.from(this.asset_map);
    // get key of the map's entry, which is a ticker
    return array.map((el) => {
      return el[0];
    });
  }

  /**
   * Set selected for requested ticker
   * @param {string} ticker ticker to be selected
   * @param {boolean} value True on selection, False otherwise
   * @returns null
   */
  setSelected(ticker, value) {
    console.log(`Running setSelected on ticker:value => ${ticker}:${value}`);
    let el = this.asset_map.get(ticker);
    if (el == undefined) {
      return;
    }
    el.selected = value;
    this.asset_map.set(ticker, el);
  }

  /**
   * Delete from map, tickers that has been selected
   */
  deleteSelected() {
    const selected = [];
    // find which tickers have been selected
    this.asset_map.forEach((value, key) => {
      if (!value.selected) return;
      selected.push(key);
    });
    // delete selected tickers
    selected.forEach((key) => {
      this.asset_map.delete(key);
    });
  }
  //

  /**
   * Return tickers from inner map
   * @returns object in form {"tickers":[array of tickers]}
   */
  getTickers() {
    const tickers = [];
    this.asset_map.forEach((value, key) => tickers.push(key));
    return { tickers: tickers };
  }

  /**
   * Get money meant for particular asset
   */
  getWeights() {
    const weights = [];
    this.asset_map.forEach((value, key) => {
      weights.push(value.price);
    });
    return weights;
  }
}
