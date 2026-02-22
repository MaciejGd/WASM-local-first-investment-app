export class SimAssetMap {
    constructor(other) {
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

        var el = this.asset_map.get(ticker);
        // if already exists        
        if (el !== undefined) {
            this.asset_map.set(ticker, el += Number(price));
        }
        else {
            this.asset_map.set(ticker, Number(price));
        }

        return true;
    }
    // turn map into array and append percentage sum
    toArray() {
        var sum = 0.0;
        this.asset_map.forEach((value) => {
            sum += value;
        });
        var array = Array.from(this.asset_map);
        for (var i = 0; i < array.length; i++) {            
            // append percentage value of each asset
            let percent = (array[i][1] / sum) * 100;
            array[i].push(percent.toFixed(2));
        }
        return array;
    }

}