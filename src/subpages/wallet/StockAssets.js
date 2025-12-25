// Represents data about asset passed to the system by the user
export class AssetData {
    constructor(quantity, price) {
        this.quantity = quantity;
        this.price = price;
        this.cost = this.price * this.quantity;
        this.selected = false;
    }

    // get profit in percentages, relative to current price
    getProfitPercentage(current_price) {
        return (((current_price * this.quantity) - this.cost) / this.cost) * 100;
    }
    // get profit relative to current price
    getProfit(current_price) {
        return (current_price - this.price) * this.quantity;
    }
    // count current value of all shares relative to its current price
    getCurrentValue(current_price) {
        return (current_price * this.quantity);
    }
};

// container for ticker assets
export class AssetsEntry {
    // we can start from empty data
    constructor(ticker) {
        this.current_price = 10;
        this.ticker = ticker;
        this._data = [];
        this.folded = false;
        this.folded_data = [new AssetData()]; // list with one element combining averages for data
    }

    get average_data() {
        return this.folded_data[0];
    }

    get accumulated_cost() {
        return this.average_data.cost;
    }

    get current_value() {
        return this.average_data.getCurrentValue(this.current_price);
    }

    // get profit from all transactions of shares
    get profit() {
        return this.folded_data[0].getProfit(this.current_price);
    }
    // get percentage profit from all transactions of shares
    get profit_percentage() {
        return this.folded_data[0].getProfitPercentage(this.current_price);
    }

    get data() {
        if (this.folded) {
            return this.folded_data; // for now return empty list
        }
        else {
            return this._data;
        }
    }

    // add new AssetData object
    addAsset(asset) {
        if (asset instanceof AssetData) {
            this._data.push(asset);
        }
        else {
            console.err("AssetData expected, got ", typeof(asset));
        }
    }
    // show average values for all shares of the company
    triggerVisibility() {
        this.folded ^= true;
    }

    insert(quantity, price) {
        if (!Number.isNaN(quantity) && !Number.isNaN(price)) {
            this._data.push(new AssetData(quantity, price));
        }
        else {
            throw new Error("Either quantity or price is not a number, failed to update asset entry");
        }

        // update averages
        let amount = 0.0; // summed amount of owned resource
        let prices_cummulated = 0.0;
        let selected = true;

        this._data.forEach((e) => {
            amount += e.quantity;
            prices_cummulated += (e.price * e.quantity)
        });
        // fill folded data with cummulated amount of stock and average price of one share
        this.folded_data[0] = new AssetData(amount, prices_cummulated / amount);
    }
    // select data idx(int, index of data, to be selected), select(boolean, select or unselect)
    selectData(idx, select) {
        if (!this.folded) {
            this._data[idx].selected = select;
            if (select == false) {
                // it means not all are selected so uncheck averages
                this.average_data.selected = false;
            }
            return;
        }
        this._data.forEach((e) => { e.selected = select; } );
        this.average_data.selected = select;
    }
};

// data prepared for table to be rendered
export class AssetsTableData {
    constructor(selected, ticker, isFolded, isFirst, quantity, 
                current_price, current_value, profit, profit_percentage, 
                price, cost, idx) {
        this.selected = selected;
        this.ticker = ticker;
        this.isFolded = isFolded;
        this.isFirst = isFirst;
        this.quantity = quantity; 
        this.current_price = current_price;
        this.current_value = current_value;
        this.profit = profit;
        this.profit_percentage = profit_percentage;
        this.cost = cost,
        this.price = price;
        this.idx = idx;
    }
};

/// Map consisting assets
export class AssetsMap {
    constructor(other) {
        if (other instanceof AssetsMap) {
            this.asset_map = new Map(other.asset_map);
            this.summary = other.summary;
        }
        else {
            this.asset_map = new Map();
        }
    }
    // function for setting checkbox for table data row, ticker (string, ticker to be searched), 
    // idx(int, index of data in AssetsEntry container), select(boolean, should we select or unselect)
    selectData(ticker, idx, select) {
        let entry = this.asset_map.get(ticker);
        entry.selectData(idx, select);
    }

    // return array of AssetsTableData produced based on personal assets
    produceTableData() {
        let output_array = []
        this.asset_map.forEach((asset) => {
            asset.data.forEach((data, idx) => {
                output_array.push(
                    new AssetsTableData(
                        data.selected,
                        asset.ticker, 
                        asset.folded, 
                        idx === 0,
                        data.quantity,
                        asset.current_price,
                        asset.current_value,
                        data.getProfit(asset.current_price).toFixed(2),
                        data.getProfitPercentage(asset.current_price).toFixed(2),
                        data.price.toFixed(2),
                        data.cost,
                        idx,
                    )
                );
            })
        });
        return output_array;
    }
    // set resource for given ticker
    set(ticker, map_entry) {
        this.asset_map.set(ticker, map_entry);
        this.countAssetsSummary(); // we should re-count asset's summary after updating the map
    }
    // get resource associated to ticker from map
    get(ticker) {
        return this.asset_map.get(ticker);
    }
    // check if ticker exists in map
    has(ticker) {
        return this.asset_map.has(ticker);
    }
    // prepare summary of all assets in map
    countAssetsSummary() {
        let summary = new AssetsTableData();
        let isFirst = false;
        let isFolded = false;
        let ticker = "Summary";
        let quantity = 0;
        let cost = 0;
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
        summary.current_value = current_value;
        summary.profit_percentage = (100 + (profit / cost) * 100).toFixed(2);
        summary.price = "-";
        summary.cost = cost;

        this.summary = summary;
    }
    // sort map entries by column specified as input arg
    sort(columnName, inc) {
        let sortDec;
        let sortInc;
        switch(columnName) {
            case "ticker":
                sortInc = (a, b) => { return a[0].localeCompare(b[0]); };
                sortDec = (a, b) => { return b[0].localeCompare(a[0]); };
                break;
            case "quantity":
                sortInc = (a, b) => { return a[1].average_data.quantity - b[1].average_data.quantity; };
                sortDec = (a, b) => { return b[1].average_data.quantity - a[1].average_data.quantity; };
                break;
            case "price":
                sortInc = (a, b) => { return a[1].average_data.price - b[1].average_data.price; };
                sortDec = (a, b) => { return b[1].average_data.price - a[1].average_data.price; };
                break;
            case "current_price":
                sortInc = (a, b) => { return a[1].current_price - b[1].current_price; };
                sortDec = (a, b) => { return b[1].current_price - a[1].current_price; };
                break;
            case "current_value":
                sortInc = (a, b) => { return a[1].current_value - b[1].current_value; };
                sortDec = (a, b) => { return b[1].current_value - a[1].current_value; };
                break;
            case "profit":
                sortInc = (a, b) => { return a[1].profit - b[1].profit; };
                sortDec = (a, b) => { return b[1].profit - a[1].profit; };
                break;
            case "cost":
                sortInc = (a, b) => { return a[1].average_data.cost - b[1].average_data.cost; }
                sortDec = (a, b) => { return b[1].average_data.cost - a[1].average_data.cost; }
                break;
            case "profit_percentage":
                sortInc = (a, b) => { return a[1].profit_percentage - b[1].profit_percentage; };
                sortDec = (a, b) => { return b[1].profit_percentage - a[1].profit_percentage; };
                break;
            default:
                console.log("Default column name");
                return;
        }
        const new_map = (inc) ? new Map([...this.asset_map].sort(sortInc)) : new Map([...this.asset_map].sort(sortDec));
        this.asset_map = new_map;
    }
};