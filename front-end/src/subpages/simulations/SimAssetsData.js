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
            return false; 
        }
        var el = this.asset_map.get(ticker);
        // if already exists        
        if (el != undefined) {
            this.asset_map.set(ticker, Number(price));
        }
        else {
            this.asset_map.set(ticker, el += Number(price));
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
            // second element of array would be price
            let el = array[i][1];
            // append percentage value of each asset
            array[i].push(Number(el) / sum);
        }
        return array;
    }

}