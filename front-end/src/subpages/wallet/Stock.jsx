import '../../styling/pop_up.css';
import '../../styling/wallet.css';
import { useState } from 'react';
import AddAssetPopUp from './AddAssetPopUp';
import { ArrowDownIcon  } from '../../IconLoader';
import { ArrowUpIcon  } from '../../IconLoader';
import { AssetsEntry, AssetsMap } from './StockAssets.js';
import { AssetsTable } from './AssetsTable.jsx'



function AssetButtons({ onAddAsset, onDeleteSelectedCb }) {
    return (
        <div className="assets_table_buttons_container">
            <AddAssetButton onAddAsset={onAddAsset}></AddAssetButton>
            <DeleteSelectedButton onDeleteSelectedCb={onDeleteSelectedCb}></DeleteSelectedButton>
        </div>
    );
}

function AddAssetButton({onAddAsset}) {
    return (<div><button className="assets_add_button" onClick={onAddAsset}>Add asset</button></div>);
}

function DeleteSelectedButton({ onDeleteSelectedCb }) {
    return (<button onClick={()=>onDeleteSelectedCb()}>Delete Selected</button>)
}

export default function StockPage() {
    /// EXAMPLE STARTING DATA 
    let a = new AssetsEntry("a");
    a.insert(1, 12);
    a.insert(2, 32);
    a.insert(0.5, 43);
    a.insert(0.5, 43);
    a.insert(0.5, 43);
    a.insert(0.5, 43);
    a.insert(0.5, 43);
    a.insert(0.5, 43);
    a.insert(0.5, 43);
    a.insert(0.5, 43);
    a.insert(0.5, 43);
    a.insert(0.5, 2);
    a.current_price = 11;
    let k = new AssetsEntry("k");
    k.insert(6, 10);
    k.insert(0.5, 2);
    k.insert(0.5, 2);
    k.insert(0.5, 2);
    k.insert(0.5, 2);
    k.insert(0.5, 2);
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

    function selectRow(ticker, idx, select) {
        console.log("Select row callback");
        const new_map = new AssetsMap(assets);
        new_map.selectData(ticker, idx, select);
        setAssets(new_map);
    }

    function deleteSelected() {
        console.log("Delete selected callback");
        const new_map = new AssetsMap(assets);
        new_map.deleteSelected();
        setAssets(new_map);
    }

    return (
        <>
            <h1>Stock subpage!</h1>
            <div className="assets_page">
                <AssetButtons onAddAsset={toggleModalVisibility} onDeleteSelectedCb={deleteSelected}></AssetButtons>
                <AssetsTable assets={assets} 
                            onToggleVisibility={toggleAssetVisibility} 
                            onSortUp={sortUp} 
                            onSortDown={sortDown}
                            onSelectRow={selectRow}></AssetsTable>
            </div>
            {/* Modal to be opened when proper button pressed */}
            <Modal onClose={toggleModalVisibility} onAccept={addAsset}/>
        </>
    );
}