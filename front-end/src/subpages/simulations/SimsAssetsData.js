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
};

export class SimAssetMap {
    constructor(other) {
        // we want to map ticker to its data
        if (other instanceof SimAssetMap) {
            this.asset_map = new Map(other.asset_map);
        }
        else {
            this.asset_map = new Map();
        }   
    }

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

    // turn map into array and append percentage sum
    toArray() {
        var sum = 0.0;
        this.asset_map.forEach((value) => {
            sum += value.price;
        });
        console.log(sum);
        var array = Array.from(this.asset_map);
        for (var i = 0; i < array.length; i++) {            
            // append percentage value of each asset
            let percent = (array[i][1].price / sum) * 100;
            array[i][1].percent = percent.toFixed(2);
        }
        return array;
    }

    setSelected(ticker, value) {
        console.log(`Running setSelected on ticker:value => ${ticker}:${value}`);
        let el = this.asset_map.get(ticker);
        if (el == undefined) {
            return;
        }
        el.selected = value;
        this.asset_map.set(ticker, el);
    }

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

}