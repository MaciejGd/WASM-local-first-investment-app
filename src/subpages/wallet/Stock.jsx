import '../../styling/pop_up.css';
import '../../styling/wallet.css';
import { useState } from 'react';
import AddAssetPopUp from './AddAssetPopUp';
import { ArrowDownIcon  } from '../../IconLoader';
import { ArrowUpIcon  } from '../../IconLoader';

/// Represents data of a single stock asset (ex. quantity, price of purchase etc.)
class AssetData {
    constructor(quantity, price) {
        this.quantity = quantity;
        this.price = price;
        this.cost = this.price * this.quantity;
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
class AssetsEntry {
    // we can start from empty data
    constructor(ticker) {
        this.current_price = 10;
        this.ticker = ticker;
        this._data = [];
        this.folded = false;
        this.folded_data = [new AssetData()]; // list with one element combining averages for data
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

        this._data.forEach((e) => {
            amount += e.quantity;
            prices_cummulated += (e.price * e.quantity)
        });
        // fill folded data with cummulated amount of stock and average price of one share
        this.folded_data[0] = new AssetData(amount, prices_cummulated / amount);
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
};

// data prepared for table to be rendered
class AssetsTableData {
    /// folded (bool), ticker(string), idx (int, idx of data), data(AssetData)
    constructor(ticker, isFolded, isFirst, quantity, current_price, current_value, profit, profit_percentage, price, cost) {
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
    }
};

/// Map consisting assets
class AssetsMap {
    constructor(other) {
        if (other instanceof AssetsMap) {
            this.asset_map = new Map(other.asset_map);
            this.summary = other.summary;
        }
        else {
            this.asset_map = new Map();
        }
    }
    // return array of AssetsTableData produced based on personal assets
    produceTableData() {
        let output_array = []
        this.asset_map.forEach((asset) => {
            asset.data.forEach((data, idx) => {
                output_array.push(
                    new AssetsTableData(
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
        summary.profit = profit;
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
                sortInc = (a, b) => { return a[1].current_price - b[1].current_price; };
                sortDec = (a, b) => { return b[1].current_price - a[1].current_price; };
                break;
            case "profit":
                sortInc = (a, b) => { return a[1].profit - b[1].profit; };
                sortDec = (a, b) => { return b[1].profit - a[1].profit; };
                break;
            case "cost":
                sortInc = (a, b) => { return a[1].current_value - b[1].current_value; }
                sortDec = (a, b) => { return b[1].current_value - a[1].current_value; }
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

function AddAssetButton({onAddPress}) {
    return (<div><button className="assets_add_button" onClick={onAddPress}>Add asset</button></div>);
}

function AssetsTableHead({ onSortUp, onSortDown }) {
    return (
        <tr>
            <th >
                <div className="table_header">
                    <span>Ticker</span>
                    <AssetsTableSortButtons onSortUp={onSortUp} onSortDown={onSortDown} columnName={"ticker"} />
                </div>
            </th>
            <th>
                <div className="table_header">
                    <span>Quantity</span>
                    <AssetsTableSortButtons onSortUp={onSortUp} onSortDown={onSortDown} columnName={"quantity"}/>
                </div>
            </th>
            <th>
                <div className='table_header'>
                    <span>Price</span>
                    <AssetsTableSortButtons onSortUp={onSortUp} onSortDown={onSortDown} columnName={"price"}/>
                </div>
            </th>
            <th>
                <div className='table_header'>
                    <span>Cost</span>
                    <AssetsTableSortButtons onSortUp={onSortUp} onSortDown={onSortDown} columnName={"cost"}/>
                </div>
            </th>
            <th>
                <div className='table_header'>
                    <span>Current Price</span>
                    <AssetsTableSortButtons onSortUp={onSortUp} onSortDown={onSortDown} columnName={"current_price"}/>
                </div>
            </th>
            <th>
                <div className='table_header'>
                    <span>Current Value</span>
                    <AssetsTableSortButtons onSortUp={onSortUp} onSortDown={onSortDown} columnName={"current_value"}/>
                </div>
            </th>
            <th>
                <div className='table_header'>
                <span>Profit</span>
                <AssetsTableSortButtons onSortUp={onSortUp} onSortDown={onSortDown} columnName={"profit"}/>
                </div>
            </th>
            <th>
                <div className='table_header'>
                <span>Profit-percentage</span>
                <AssetsTableSortButtons onSortUp={onSortUp} onSortDown={onSortDown} columnName={"profit_percentage"}/>
                </div>
            </th>
        </tr>
    );
}

// table sorting buttons
function AssetsTableSortButtons({ onSortUp, onSortDown, columnName }) {
    return (
        <div className="sort_buttons">
            <button onClick={() => onSortUp(columnName)}><ArrowUpIcon/></button>
            <button onClick={() => onSortDown(columnName)}><ArrowDownIcon/></button>
        </div>
    );
}

function AssetsTableBody({assets, onToggleVisibility}) {
    // prepare data for rendering table
    const assets_array = assets.produceTableData();
    const assets_summary = assets.summary;
    return (
        <>
        {/* render regular rows */}
        {assets_array.map((asset, rowIdx) => (
            <AssetRow asset={asset} key={rowIdx} rowClassName={""} onToggleVisibility={onToggleVisibility}/>
        ))}
        {/* render summary row */}
        <AssetRow asset={assets_summary} rowClassName={"assets_summary"} onToggleVisibility={onToggleVisibility}/>
        </> 
    );
}

function AssetRow({ asset, rowIdx, rowClassName, onToggleVisibility }) {
    return (
        <tr className={rowClassName}>
            <td>
                <div className="row_ticker">
                    <span style={{fontWeight: 'bold'}}>{asset.ticker}</span>
                    {asset.isFirst && (
                        <button onClick={()=> onToggleVisibility(asset.ticker)}>
                            {asset.isFolded ? (<ArrowDownIcon/>) : (<ArrowUpIcon/>)}
                        </button>
                    )}
                </div>
            </td>
            <td>
                {asset.quantity}
            </td>
            <td>
                {asset.price}
            </td>
            <td>
                {asset.cost}
            </td>
            <td>
                {asset.current_price}
            </td>
            <td>
                {asset.current_value}
            </td>
            <td>
                {asset.profit}
            </td>
            <td className="row_profit">
                {asset.profit_percentage}
            </td>
        </tr>
    );
}

function AssetsTable({ assets, onToggleVisibility, onSortUp, onSortDown }) {
    return (
        <table className="assets_table">
            <thead>
                <AssetsTableHead onSortDown={onSortDown} onSortUp={onSortUp}/>
                <AssetsTableBody assets={assets} onToggleVisibility={onToggleVisibility}/>
            </thead>
        </table>
    );
}


export default function StockPage() {
    /// EXAMPLE STARTING DATA 
    let a = new AssetsEntry("a");
    a.insert(1, 12);
    a.current_price = 11;
    let k = new AssetsEntry("k");
    k.insert(6, 10);
    k.current_price = 30;
    let t = new AssetsEntry("t");
    t.insert(3, 7);
    t.current_price = 4;

    let example_assets = new AssetsMap();
    example_assets.set("a", a);
    example_assets.set("k", k);
    example_assets.set("t", t);
    /// EXAMPLE STARTING DATA

    const [modal_visible, setModalVisible] = useState(false);
    const [assets, setAssets] = useState(example_assets);

    function toggleModalVisibility() {
        setModalVisible(!modal_visible);
    }
    const Modal = modal_visible ? AddAssetPopUp : () => (<></>);

    /// add asset to assets list
    function addAsset(ticker, quantity, price) {
        if (ticker === "") {
            console.err("Ticker should not be empty");
            return;
        }

        // check if quantity and price is correct (number and not empty)
        const quantityNum = Number(quantity);
        if (Number.isNaN(quantityNum) || quantity == "") { // TODO fix that so it works
            console.err("Quantity value is not a number!!!");
            return;
        }
        const priceNum = Number(price);
        if (Number.isNaN(priceNum) || price === "") {
            console.err("price value should be a float!");
            return;
        }


        var assets_map = new AssetsMap(assets);
        const map_entry = assets_map.get(ticker) ?? new AssetsEntry(ticker);
        map_entry.insert(quantityNum, priceNum);
        assets_map.set(ticker, 
            map_entry
        );
        setAssets(assets_map);
        // hide modal on accept as well
        toggleModalVisibility();
    }

    function toggleAssetVisibility(ticker) {
        if (!assets.has(ticker)) {
            console.err(`There is no such ticker as ${ticker} in map.`);
            return;
        }
        // trigger visibility on resource
        const map_copy = new AssetsMap(assets);
        let asset = map_copy.get(ticker);
        asset.triggerVisibility();
        setAssets(map_copy);
    }

    function sortUp(columnName) {
        const new_map = new AssetsMap(assets);
        new_map.sort(columnName, false);
        setAssets(new_map);
    }

    function sortDown(columnName) {
        const new_map = new AssetsMap(assets);
        new_map.sort(columnName, true);
        setAssets(new_map);
    }

    return (
        <>
            <h1>Stock subpage!</h1>
            <AddAssetButton onAddPress={toggleModalVisibility}></AddAssetButton>
            <AssetsTable assets={assets} onToggleVisibility={toggleAssetVisibility} onSortUp={sortUp} onSortDown={sortDown}></AssetsTable>
            {/* Modal to be opened when proper button pressed */}
            <Modal onClose={toggleModalVisibility} onAccept={addAsset}/>
        </>
    );
}