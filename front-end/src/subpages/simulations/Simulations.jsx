import { AssetButtons, AddAssetButton, DeleteSelectedButton } from "../wallet/Stock"
import "../../styling/simulations.css"
import { useState } from "react" 

import SimulationsOptionsPane from "./SimsOptionsPane";
import AssetsPane from "./SimsAssetsPane"
import { SimAssetMap } from "./SimsAssetsData";
import SimsResults from "./SimsResults.jsx";
// what do we want in here??? we want some table which we can add tickers + set proportions / amount of 
// we need to add - ticker + amount of money invested (ticker for getting the prices, money invested for weights)
function InputRow({title, onChange, focus}) {
    return (
    <div className="modal_input_row">
        <span>{title}</span>
        <input className="modal_input" onChange={(e)=>onChange(e.target.value)} autoFocus={focus}></input>
    </div>);
}

function AddAssetPopUp({ onClose, onAccept }) {
    const [ticker, setTicker] = useState("");
    const [price, setPrice] = useState("");

    return (
    <div className="modal_overlay">
        <div className="modal_container">
            <div className="modal_title">
                Add asset
            </div>
            <div className="modal_input_table">
                <InputRow title="Ticker"          onChange={setTicker} focus={true}></InputRow>
                <InputRow title="Planned cost"           onChange={setPrice}></InputRow>
            </div>
            <div className="modal_buttons">
                <button className="modal_button" onClick={onClose}> Close </button>
                <button className="modal_button" onClick={() => onAccept(ticker, price)}> Accept</button>
            </div>
        </div>
    </div>
    );
}


export default function SimulationsPage() {
    const [modal_visible, setModalVisible] = useState(false);
    const [assets, setAssets] = useState(new SimAssetMap()); // map of ticker to its price

    function toggleModalVisibility(vis) {
        setModalVisible(!modal_visible);
    }

    function onModalAccept(ticker, price) {
        // create new asset map
        var asset_map = new SimAssetMap(assets);
        asset_map.addRecord(ticker, price);
        setAssets(asset_map);
        toggleModalVisibility();
    }

    function selectAsset(ticker, value) {
        var asset_map = new SimAssetMap(assets);
        asset_map.setSelected(ticker, value);
        setAssets(asset_map);
    }

    function deleteSelected() {
        var asset_map = new SimAssetMap(assets);
        asset_map.deleteSelected();
        setAssets(asset_map);
    }

    return (
        <>
            <h1>Simulations!!!</h1>
            <div className="page">
                {/* <AssetButtons onAddAsset={toggleModalVisibility}
                                onDeleteSelectedCb={()=>{}}
                ></AssetButtons> */}
                <SimulationsOptionsPane addAsset={toggleModalVisibility} deleteSelectedCb={deleteSelected}/>
                <AssetsPane assets={assets.toArray()} onSelectCb={selectAsset}/>
                <SimsResults/>
            </div>
            {modal_visible && 
                <AddAssetPopUp onClose={toggleModalVisibility} onAccept={onModalAccept} />
            }
        </>
    )
}