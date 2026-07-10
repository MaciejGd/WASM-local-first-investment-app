import { GetRecentPrices } from "../finance_api/FinanceApi";

/**
 * Class representing data from investment wallet
 */
export class AssetData {
  /**
   * @param {number} id number identifying the data entry
   * @param {number} quantity amount of stocks bought
   * @param {number} price money worth of one stock at the time of buy
   */
  constructor(id, quantity, price) {
    this.quantity = quantity;
    this.price = price;
    this.cost = this.price * this.quantity;
    this.selected = false;
    this.id = id; // number which lets us identify the asset
  }

  /**
   * Get profit in percentages, relative to current price
   * @param {number} current_price current price of the asset
   * @returns profit in percentages
   */
  getProfitPercentage(current_price) {
    return ((current_price * this.quantity - this.cost) / this.cost) * 100;
  }

  /**
   * Get profit relative to current price
   * @param {number} current_price Current price of the asset
   * @returns current profit
   */
  getProfit(current_price) {
    return (current_price - this.price) * this.quantity;
  }

  /**
   * Count current value of all shares relative to its current price
   * @param {number} current_price Current price of the stock
   * @returns current value
   */
  getCurrentValue(current_price) {
    return current_price * this.quantity;
  }
}

/**
 * Map entry of ticker. Consists of AssetData objects
 * as well as ticker's assets summary
 */
export class AssetsEntry {
  /**
   * Accepts ticker name
   * @param {string} ticker
   */
  constructor(ticker) {
    this.current_price = 10;
    this.ticker = ticker;
    this._data = [];
    this.folded = false;
    this.folded_data = [new AssetData()]; // list with one element combining averages for data
  }

  /**
   * Getter for average data of all investments of stock
   */
  get average_data() {
    return this.folded_data[0];
  }

  /**
   * Getter for accumulated cost of all investments of stock
   */
  get accumulated_cost() {
    return this.average_data.cost;
  }

  /**
   * Getter for current price of the stock
   */
  get current_value() {
    return this.average_data.getCurrentValue(this.current_price);
  }

  /**
   * Getter profit from all transactions of shares
   */
  get profit() {
    return this.folded_data[0].getProfit(this.current_price);
  }

  /**
   * Getter for percentage profit from all transactions of shares
   */
  get profit_percentage() {
    return this.folded_data[0].getProfitPercentage(this.current_price);
  }

  /**
   * Getter for getting displayed data of ticker
   */
  get data() {
    if (this.folded) {
      return this.folded_data; // for now return empty list
    } else {
      return this._data;
    }
  }

  /**
   * Get selected positions of ticker
   */
  get selected() {
    // if folded and selected, return all data added
    if (this.folded && this.folded_data[0].selected) {
      return this._data;
    }
    // iterate over data and check which elements are selected
    var selected_data = [];
    var cont = this.data;
    cont.forEach((el) => {
      if (el.selected) selected_data.push(el);
    });
    return selected_data;
  }

  /**
   * Adds asset to the ticker's entry
   * @param {AssetData} asset
   */
  addAsset(asset) {
    if (asset instanceof AssetData) {
      this._data.push(asset);
    } else {
      console.err("AssetData expected, got ", typeof asset);
    }
  }

  /**
   * Trigger visibility change of ticker's assets
   */
  triggerVisibility() {
    this.folded ^= true;
  }

  /**
   * Update summary data of the ticker's assets
   */
  udpateAverageData() {
    // update averages
    let id_placeholder = -1;
    let amount = 0.0; // summed amount of owned resource
    let prices_cummulated = 0.0;
    this._data.forEach((e) => {
      amount += e.quantity;
      prices_cummulated += e.price * e.quantity;
    });
    // fill folded data with cummulated amount of stock and average price of one share
    this.folded_data[0] = new AssetData(
      id_placeholder,
      amount,
      prices_cummulated / amount,
    );
  }

  /**
   *
   * @param {string} id identification number of the asset
   * @param {string} quantity amount of stock owned
   * @param {string} price price of the stock bought
   */
  insert(id, quantity, price) {
    this._data.push(new AssetData(id, Number(quantity), Number(price)));
    this.udpateAverageData();
  }

  /**
   * Update assets entry
   * @param {string} id identification of the asset
   * @param {number} quantity amount of stock owned
   * @param {nunber} price price of the stock bought
   * @returns
   */
  update(id, quantity, price) {
    // if already in the _data, skip further execution
    if (this._data.includes(id)) {
      return;
    }
    this._data.push(new AssetData(id, Number(quantity), Number(price)));
    this.udpateAverageData();
  }

  removeNotMatchingAssets(assets) {
    const removeIds = new Set(assets.map((a) => a.id));
    this._data = this._data.filter((item) => removeIds.has(item.id));
  }

  /**
   * Select asset at specified index
   * @param {number} idx index od data to be selected
   * @param {boolean} select True is selected, False otherwise
   * @returns
   */
  selectData(idx, select) {
    if (!this.folded) {
      this._data[idx].selected = select;
      // if all selected, then average should be selected, if even one not selected then avg not selected
      let sel_amount = 0;
      this._data.forEach((e) => {
        sel_amount += e.selected ? 1 : 0;
      });
      this.average_data.selected =
        sel_amount === this._data.length ? true : false;
      return;
    }
    this._data.forEach((e) => {
      e.selected = select;
    });
    this.average_data.selected = select;
  }

  /**
   * Delete selected data from the assets container
   * @returns True if container is empty after deletion, False otherwise
   */
  deleteData() {
    // if folded, analyze all records as one
    if (this.folded) {
      if (this.average_data.selected) {
        this._data = []; // clear data
        this.folded_data = [];
      }
    } else {
      for (var i = this._data.length - 1; i >= 0; i--) {
        if (this._data[i].selected === true) {
          this._data.splice(i, 1); // remove element if it is selected
        }
      }
    }
    this.udpateAverageData();
    // if data empty after removal, delete whole asset entry
    return this._data.length === 0 ? true : false;
  }
}

/**
 * Data prepared for table to be rendered
 */
export class AssetsTableData {
  /**
   * @param {boolean} selected is asset selected
   * @param {string} ticker ticker of the asset
   * @param {boolean} isFolded is asset folded
   * @param {boolean} isFirst is asset first on the list
   * @param {number} quantity amount of stock hold
   * @param {number} current_price current price of the stock
   * @param {number} current_value current value of the stock
   * @param {number} profit profit from the asset purchase
   * @param {number} profit_percentage percentage of the profit
   * @param {number} price price of the asset at buy time
   * @param {number} cost total cost of the asset
   * @param {number} idx index of the asset
   */
  constructor(
    selected,
    ticker,
    isFolded,
    isFirst,
    quantity,
    current_price,
    current_value,
    profit,
    profit_percentage,
    price,
    cost,
    idx,
  ) {
    this.selected = selected;
    this.ticker = ticker;
    this.isFolded = isFolded;
    this.isFirst = isFirst;
    this.quantity = quantity;
    this.current_price = current_price;
    this.current_value = current_value;
    this.profit = profit;
    this.profit_percentage = profit_percentage;
    ((this.cost = cost), (this.price = price));
    this.idx = idx;
  }
}

/**
 * Map of ticker : AssetEntry objects
 */
export class AssetsMap {
  /**
   * @param {AssetsMap} other accepts AssetsMap to perform copy constructing
   */
  constructor(other) {
    if (other instanceof AssetsMap) {
      this.asset_map = new Map(other.asset_map);
      this.summary = other.summary;
    } else {
      this.asset_map = new Map();
      this.countAssetsSummary();
    }
  }

  /**
   * Factory static method creating AssetMap from list of objects
   * @param {Array} assets array of objects retrieved from db.
   * Object structure: ticker, price, quantity
   * @returns AssetMap object
   */
  static createFromDB(assets) {
    const mp = new AssetsMap();
    if (assets === undefined || assets.length === 0) {
      return mp;
    }
    assets.forEach((el) => {
      if (mp.get(el.ticker) === undefined) {
        // if map entry does not exist, create brand new
        mp.set(el.ticker, new AssetsEntry(el.ticker));
      }
      mp.get(el.ticker).insert(el.ulid, el.price, el.quantity);
    });
    mp.countAssetsSummary(); // count assets summary after addition is done
    return mp;
  }

  async fetchAssetsPrice() {
    // ticker -> asset entry
    const tickers = Array.from(this.asset_map.keys());
    const prices = await GetRecentPrices(tickers);
    this.asset_map.forEach((el, ticker) => {
      el.current_price = prices[ticker].price;
      this.asset_map.set(ticker, el);
    });
  }

  /**
   * Update current map with values from remote
   * @param {Array} assets array of assets to be added to map
   * @returns
   */
  updateFromDB(assets) {
    const mp = new AssetsMap(this);
    if (!assets) {
      return mp;
    }

    // remove old values that are not in the new assets to be set
    if (!mp.asset_map) {
      return AssetsMap.createFromDB(assets);
    }

    mp.asset_map.forEach((value, key) => {
      value.removeNotMatchingAssets(assets);
      // remove ticker entry if all records are gone
      if (value._data.length === 0) {
        mp.asset_map.delete(key);
      }
    });
    // update new values
    assets.forEach((el) => {
      if (mp.get(el.ticker) === undefined) {
        mp.set(el.ticker, new AssetsEntry(el.ticker));
      }
      mp.get(el.ticker).update(el.ulid, el.price, el.quantity);
    });

    mp.countAssetsSummary();
    return mp;
  }

  /**
   * Function for setting checkbox for table data row
   * @param {string} ticker ticker to be selected
   * @param {int} idx index of data in AssetsEntry container
   * @param {boolean} select True if should be selected, False otherwise
   */
  selectData(ticker, idx, select) {
    let entry = this.asset_map.get(ticker);
    entry.selectData(idx, select);
  }

  /**
   * Produce AssetsTableData based on user investments
   * @returns Array of AssetsTableData produced based on personal assets
   */
  produceTableData() {
    let output_array = [];
    this.asset_map.forEach((asset) => {
      asset.data.forEach((data, idx) => {
        output_array.push(
          new AssetsTableData(
            data.selected,
            asset.ticker,
            asset.folded,
            idx === 0,
            data.quantity,
            asset.current_price.toFixed(2),
            data.getCurrentValue(asset.current_price).toFixed(2),
            data.getProfit(asset.current_price).toFixed(2),
            data.getProfitPercentage(asset.current_price).toFixed(2),
            data.price.toFixed(2),
            data.cost,
            idx,
          ),
        );
      });
    });
    return output_array;
  }

  /**
   * Set resource for given ticker
   * @param {string} ticker ticker to be set
   * @param {AssetsEntry} map_entry AssetsEntry object
   */
  set(ticker, map_entry) {
    this.asset_map.set(ticker, map_entry);
    this.countAssetsSummary(); // we should re-count asset's summary after updating the map
  }

  /**
   * Get resource associated to ticker provided
   * @param {string} ticker ticker we want to retrieve data of
   * @returns resource associated with ticker provided
   */
  get(ticker) {
    return this.asset_map.get(ticker);
  }

  /**
   * Check if ticker entry exists in the map
   * @param {string} ticker ticker we want to check
   * @returns True if exists, False otherwise
   */
  has(ticker) {
    return this.asset_map.has(ticker);
  }

  /**
   * Prepare summary of all assets in a map
   */
  countAssetsSummary() {
    let summary = new AssetsTableData();
    let isFirst = false;
    let isFolded = false;
    let ticker = "Summary";
    let quantity = 0;
    let cost = 0.0;
    let profit = 0.0;
    let current_value = 0.0;
    this.asset_map.forEach((entry) => {
      const e = entry.average_data;
      // price += e.price;
      quantity += e.quantity;
      cost += e.cost;
      profit += entry.profit;
      current_value += entry.current_value;
    });

    summary.ticker = ticker;
    summary.isFolded = isFolded;
    summary.isFirst = isFirst;
    summary.quantity = quantity;
    summary.current_price = "-";
    summary.profit = profit.toFixed(2);
    summary.current_value = current_value.toFixed(2);
    // we divide so if cost === 0, just return 0 :))
    summary.profit_percentage =
      cost != 0 ? ((profit / cost) * 100).toFixed(2) : 0;
    summary.price = "-";
    summary.cost = cost.toFixed(2);

    this.summary = summary;
  }

  /**
   * Sort map entries by column specified as input arg
   * @param {string} columnName name of the column we want sort with
   * @param {boolean} inc True if sorting incrementally, False otherwise
   * @returns
   */
  sort(columnName, inc) {
    let sortDec;
    let sortInc;
    switch (columnName) {
      case "ticker":
        sortInc = (a, b) => {
          return a[0].localeCompare(b[0]);
        };
        sortDec = (a, b) => {
          return b[0].localeCompare(a[0]);
        };
        break;
      case "quantity":
        sortInc = (a, b) => {
          return a[1].average_data.quantity - b[1].average_data.quantity;
        };
        sortDec = (a, b) => {
          return b[1].average_data.quantity - a[1].average_data.quantity;
        };
        break;
      case "price":
        sortInc = (a, b) => {
          return a[1].average_data.price - b[1].average_data.price;
        };
        sortDec = (a, b) => {
          return b[1].average_data.price - a[1].average_data.price;
        };
        break;
      case "current_price":
        sortInc = (a, b) => {
          return a[1].current_price - b[1].current_price;
        };
        sortDec = (a, b) => {
          return b[1].current_price - a[1].current_price;
        };
        break;
      case "current_value":
        sortInc = (a, b) => {
          return a[1].current_value - b[1].current_value;
        };
        sortDec = (a, b) => {
          return b[1].current_value - a[1].current_value;
        };
        break;
      case "profit":
        sortInc = (a, b) => {
          return a[1].profit - b[1].profit;
        };
        sortDec = (a, b) => {
          return b[1].profit - a[1].profit;
        };
        break;
      case "cost":
        sortInc = (a, b) => {
          return a[1].average_data.cost - b[1].average_data.cost;
        };
        sortDec = (a, b) => {
          return b[1].average_data.cost - a[1].average_data.cost;
        };
        break;
      case "profit_percentage":
        sortInc = (a, b) => {
          return a[1].profit_percentage - b[1].profit_percentage;
        };
        sortDec = (a, b) => {
          return b[1].profit_percentage - a[1].profit_percentage;
        };
        break;
      default:
        console.log("Default column name");
        return;
    }
    const new_map = inc
      ? new Map([...this.asset_map].sort(sortInc))
      : new Map([...this.asset_map].sort(sortDec));
    this.asset_map = new_map;
  }

  /**
   * Return ids of all selected assets as an array
   */
  getSelectedIds() {
    var selected = [];
    this.asset_map.forEach((el) => {
      // map all AssetData objects to get only ids
      selected = selected.concat(el.selected.map((item) => item.id));
    });

    return selected;
  }

  /**
   * Delete selected assets
   */
  deleteSelected() {
    this.asset_map.forEach((el, idx, assets) => {
      if (el.deleteData()) {
        assets.delete(el.ticker);
      }
    });
    this.countAssetsSummary(); // recalculate summary
  }
}
