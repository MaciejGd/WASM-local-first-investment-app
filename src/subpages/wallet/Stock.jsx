import '../../styling/pop_up.css';
import '../../styling/wallet.css';
import { useState } from 'react';
import AddAssetPopUp from './AddAssetPopUp';

/// Represents data of a single stock asset (ex. quantity, price of purchase etc.)
class AssetData {
    constructor(ticker, quantity, price) {
        this.ticker = ticker;
        this.quantity = quantity;
        this.price = price;
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
    console.log("Input map ", assets);
    assets.forEach((value) => {
        console.log("Map iteration ", value);
        assets_array.push(...value);
    });
    console.log("Concated array: ", assets_array);

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
    const [modal_visible, setModalVisible] = useState(new Map());
    const [assets, setAssets] = useState([]);

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

        // var index = assets.length; // index we want to place our new share into
        // // we want to set asset at specific place (all shares of same stock should be one after another)
        // for (var i = assets.length - 1; i >= 0; i--) {
        //     if (assets[i].ticker == ticker) {
        //         // append share after the last one found
        //         index = i;
        //         break;
        //     }
        // }
        // // append at the end
        // if (index == assets.length || index == assets.length - 1) {
        //     setAssets([...assets, new AssetData(ticker, quantityNum, priceNum)]);
        // }
        // else {
        //     // append item in the table
        //     const new_arr = [...assets];
        //     const sliced = new_arr.splice(index+1, assets.length - 1);
        //     setAssets([...new_arr, new AssetData(ticker, quantityNum, priceNum), ...sliced]);
        // }

        var assets_map = new Map(assets);
        const existing = assets_map.get(ticker) ?? [];
        assets_map.set(ticker, 
            [
                ...existing,
                new AssetData(ticker, quantityNum, priceNum)
            ]
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