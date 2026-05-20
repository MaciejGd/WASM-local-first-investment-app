import '../../styling/pop_up.css';
import '../../styling/wallet.css';
import { useState, useEffect } from 'react';
import AddAssetPopUp from './AddAssetPopUp';
import { ArrowDownIcon  } from '../../IconLoader';
import { ArrowUpIcon  } from '../../IconLoader';
import { AssetsEntry, AssetsMap } from './StockAssets.js';
import { AssetsTable } from './AssetsTable.jsx'
import { IndexedDbHandler } from "../../db/DbDataTables.js"; // indexed db instance 



export function AssetButtons({ onAddAsset, onDeleteSelectedCb }) {
    return (
        <div className="assets_table_buttons_container">
            <AddAssetButton onAddAsset={onAddAsset}></AddAssetButton>
            <DeleteSelectedButton onDeleteSelectedCb={onDeleteSelectedCb}></DeleteSelectedButton>
        </div>
    );
}

export function AddAssetButton({onAddAsset}) {
    return (<div><button className="assets_add_button" onClick={onAddAsset}>Add asset</button></div>);
}

export function DeleteSelectedButton({ onDeleteSelectedCb }) {
    return (<button onClick={()=>onDeleteSelectedCb()}>Delete Selected</button>)
}

export default function StockPage() {
    const [modal_visible, setModalVisible] = useState(false);
    const [assets, setAssets] = useState(new AssetsMap());    
    const [assets_init, setAssetsInit] = useState([]);
    const [db_instance, setDbInstance] = useState(new IndexedDbHandler());
    // we wanna fetch data from db on page render
    useEffect(()=>{
        const loadData = async () => {
            const db_array = await db_instance.getWalletAssets(); // obtain ref to singleton obj
            const new_map = AssetsMap.createFromDB(db_array);
            setAssets(new_map);
        }
        loadData();
        
    },[]);

    function toggleModalVisibility() {
        setModalVisible(!modal_visible);
    }
    const Modal = modal_visible ? AddAssetPopUp : () => (<></>);

    /// add asset to assets list
    async function addAsset(ticker, quantity, price) {
        if (ticker === "") {
            console.err("Ticker should not be empty");
            return;
        }

        // check if quantity and price is correct (number and not empty)
        const quantityNum = Number(quantity);
        if (Number.isNaN(quantityNum) || quantity == "") { // TODO fix that so it works
            console.error("Quantity value is not a number!!!");
            return;
        }
        const priceNum = Number(price);
        if (Number.isNaN(priceNum) || price === "") {
            console.error("price value should be a float!");
            return;
        }
        // add new asset to the db
        var id = -1;
        try {
            id = await db_instance.addWalletAsset({                
                ticker: ticker, 
                quantity: quantity, 
                price: price
            });
        }
        catch (error) {
            console.log("Failed adding into the db");
            return;
        }

        var assets_map = new AssetsMap(assets);
        const map_entry = assets_map.get(ticker) ?? new AssetsEntry(ticker);
        map_entry.insert(id, quantityNum, priceNum);
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

    // async function deleteSelected() {
    async function deleteSelected() {
        console.log("Delete selected callback");
        // remove selected elements from indexed db
        const selected_ids = assets.getSelectedIds();
        await db_instance.deleteWalletAssets(selected_ids);
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