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
    }
};

// container for ticker assets
class AssetsEntry {
    // we can start from empty data
    constructor(ticker) {
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
            console.log("AssetData expected, got ", typeof(asset));
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
        var amount = 0.0; // summed amount of owned resource
        var prices_cummulated = 0.0;

        this._data.forEach((e) => {
            amount += e.quantity;
            prices_cummulated += (e.price * e.quantity)
        });
        // fill folded data with cummulated amount of stock and average price of one share
        this.folded_data[0] = new AssetData(amount, prices_cummulated / amount);
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


function AddAssetButton({onAddPress}) {
    return (<div><button className="assets_add_button" onClick={onAddPress}>Add asset</button></div>);
}


function AssetsTableHead({ onSortUp, onSortDown }) {
    return (
        <tr>
            <th >
                <div className="table_header">
                    <span>Ticker</span>
                    <AssetsTableSortButtons onSortUp={onSortUp} onSortDown={onSortDown}></AssetsTableSortButtons>
                </div>
            </th>
            <th>
                <div className="table_header">
                    <span>Quantity</span>
                    <AssetsTableSortButtons onSortUp={onSortUp} onSortDown={onSortDown}></AssetsTableSortButtons>
                </div>
            </th>
            <th>
                <div className='table_header'>
                    <span>Price</span>
                    <AssetsTableSortButtons onSortUp={onSortUp} onSortDown={onSortDown}></AssetsTableSortButtons>
                </div>
            </th>
            <th>
                <div className='table_header'>
                    <span>Curent Price</span>
                    <AssetsTableSortButtons onSortUp={onSortUp} onSortDown={onSortDown}></AssetsTableSortButtons>
                </div>
            </th>
            <th>
                <div className='table_header'>
                <span>Profit</span>
                <AssetsTableSortButtons onSortUp={onSortUp} onSortDown={onSortDown}></AssetsTableSortButtons>
                </div>
            </th>
            <th>
                <div className='table_header'>
                <span>Profit-percentage</span>
                <AssetsTableSortButtons onSortUp={onSortUp} onSortDown={onSortDown}></AssetsTableSortButtons>
                </div>
            </th>
            <th>
                <div className='table_header'>
                    <span>Show/Hide</span>
                </div>
            </th>
        </tr>
    );
}

// table sorting buttons
function AssetsTableSortButtons({ onSortUp, onSortDown }) {
    return (
        <div className="sort_buttons">
            <button onClick={onSortUp}><ArrowUpIcon/></button>
            <button onClick={onSortDown}><ArrowDownIcon/></button>
        </div>
    );
}

function AssetsTableBody({assets, onToggleVisibility}) {
    // create list of elements from a assets map
    const dummy_profit_percentage = 10;
    const dummy_profit = 5;
    var assets_array = [];
    assets.forEach((asset) => {
        const ticker = asset.ticker;
        asset.data.forEach((d, idx) => {
            const next_asset = {
                isFirst:                    idx == 0,
                ticker :                    ticker,
                quantity:                   d.quantity,
                current_price:              0,
                profit:                     dummy_profit,
                profit_percentage:          dummy_profit_percentage,
                price:                      d.price.toFixed(2), // display as string with .2 digit precision
            };
            assets_array.push(next_asset);    
        });        
    });

    return (
        <>
        {assets_array.map((asset, rowIdx) => (
            <tr key={rowIdx}>
                <td>
                    {asset.ticker}
                </td>
                <td>
                    {asset.quantity}
                </td>
                <td>
                    {asset.price}
                </td>
                <td>
                    {asset.current_price}
                </td>
                <td>
                    {asset.profit}
                </td>
                <td className="row_profit">
                    {asset.profit_percentage}
                </td>
                {asset.isFirst && (
                    <td className="visibility_change"> 
                        <button onClick={()=> onToggleVisibility(asset.ticker)}></button>
                    </td>
                )}
            </tr>
        ))}
        </>
    );
}

function AssetsTable({ assets, onToggleVisibility }) {
    return (
        <table className="assets_table">
            <thead>
                <AssetsTableHead/>
                <AssetsTableBody assets={assets} onToggleVisibility={onToggleVisibility}/>
            </thead>
        </table>
    );
}


export default function StockPage() {
    const [modal_visible, setModalVisible] = useState(false);
    const [assets, setAssets] = useState(new Map());

    function toggleModalVisibility() {
        setModalVisible(!modal_visible);
    }
    const Modal = modal_visible ? AddAssetPopUp : () => (<></>);

    /// add asset to assets list
    function addAsset(ticker, quantity, price) {
        console.log("set assets: " + ticker + " " + quantity + " " + price);

        if (ticker === "") {
            console.log("Ticker should not be empty");
            return;
        }

        // check if quantity and price is correct (number and not empty)
        const quantityNum = Number(quantity);
        if (Number.isNaN(quantityNum) || quantity == "") { // TODO fix that so it works
            console.log("Quantity value is not a number!!!");
            return;
        }
        const priceNum = Number(price);
        if (Number.isNaN(priceNum) || price === "") {
            console.log("price value should be a float!");
            return;
        }


        var assets_map = new Map(assets);
        const map_entry = assets_map.get(ticker) ?? new AssetsEntry(ticker);
        console.log(map_entry);
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
        const map_copy = new Map(assets);
        let asset = map_copy.get(ticker);
        asset.triggerVisibility();
        setAssets(map_copy);
    }

    return (
        <>
            <h1>Stock subpage!</h1>
            <AddAssetButton onAddPress={toggleModalVisibility}></AddAssetButton>
            <AssetsTable assets={assets} onToggleVisibility={toggleAssetVisibility}></AssetsTable>
            {/* Modal to be opened when proper button pressed */}
            <Modal onClose={toggleModalVisibility} onAccept={addAsset}/>
        </>
    );
}