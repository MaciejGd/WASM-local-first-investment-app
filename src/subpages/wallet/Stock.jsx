import '../../styling/pop_up.css';
import '../../styling/wallet.css';
import { useState } from 'react';
import AddAssetPopUp from './AddAssetPopUp';

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
        if (this.folded) {
            var amount = 0.0; // summed amount of owned resource
            var prices_cummulated = 0.0;

            this._data.forEach((e) => {
                amount += e.quantity;
                prices_cummulated += (e.price * e.quantity)
            });
            // fill folded data with cummulated amount of stock and average price of one share
            this.folded_data[0] = new AssetData(amount, prices_cummulated / amount);
        }
    }

    insert(quantity, price) {
        if (!Number.isNaN(quantity) && !Number.isNaN(price)) {
            this._data.push(new AssetData(quantity, price));
        }
        else {
            throw new Error("Either quantity or price is not a number, failed to update asset entry");
        }
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

function AssetPanel({assets}) {
    return (
    <>
        <AssetsTable assets={assets}/>
    </>
    );
}

function AssetsTableHead() {
    return (
        <tr>
            <th>Ticker</th>
            <th>Quantity</th>
            <th>Price</th>
        </tr>
    );
}

function AssetsTableBody({assets}) {
    // create list of elements from a assets map
    var assets_array = [];
    assets.forEach((asset) => {
        const ticker = asset.ticker;
        asset.data.forEach((d) => {
            const next_asset = {
                ticker :    ticker,
                quantity:   d.quantity,
                price:      d.price.toFixed(2), // display as string with .2 digit precision
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
            </tr>
        ))}
        </>
    );
}

function AssetsTable({ assets }) {
    return (
        <table className="assets_table">
            <thead>
                <AssetsTableHead/>
                <AssetsTableBody assets={assets}/>
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

    return (
        <>
            <h1>Stock subpage!</h1>
            <AddAssetButton onAddPress={toggleModalVisibility}></AddAssetButton>
            <AssetPanel assets={assets}></AssetPanel>
            {/* Modal to be opened when proper button pressed */}
            <Modal onClose={toggleModalVisibility} onAccept={addAsset}/>
        </>
    );
}