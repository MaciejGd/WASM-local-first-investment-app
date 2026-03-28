import { AssetButtons, AddAssetButton, DeleteSelectedButton } from "../wallet/Stock"
import "../../styling/simulations.css"
import { useEffect, useState } from "react"

import SimulationsOptionsPane from "./SimsOptionsPane";
import AssetsPane from "./SimsAssetsPane"
import { SimAssetMap } from "./SimsAssetsData";
import SimsResults from "./SimsResults.jsx";
import { RequestGET, RequestPOST } from "../../Requests.js";
import ComboBox from "../../components/Combobox.jsx";

// DEBUG
import "./wasm/SimulationAPI.js";
import { SimulationAPI } from "./wasm/SimulationAPI.js";
// what do we want in here??? we want some table which we can add tickers + set proportions / amount of
// we need to add - ticker + amount of money invested (ticker for getting the prices, money invested for weights)
function InputRow({ title, onChange, focus, options=[] }) {
    return (
    <div className="modal_input_row">
        <span>{title}</span>
        {/* <input className="modal_input" onChange={(e)=>onChange(e.target.value)} autoFocus={focus}></input> */}
        <ComboBox onChange={onChange} placeholder="Ticker..." focus={focus} options={options} />
    </div>);
}

function AddAssetPopUp({ onClose, onAccept, tickersList }) {
    const [ticker, setTicker] = useState("");
    const [price, setPrice] = useState("");

    return (
    <div className="modal_overlay">
        <div className="modal_container">
            <div className="modal_title">
                Add asset
            </div>
            <div className="modal_input_table">
                <InputRow title="Ticker" onChange={setTicker} focus={true} options={tickersList} ></InputRow>
                <InputRow title="Planned cost" onChange={setPrice}></InputRow>
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
    const [tickers_list, setTickersList] = useState([]);
    const [simulationAPI, setSimulationAPI] = useState(null);

    useEffect(() => {
        SimulationAPI.create().then((module) => {
            if (module) {
                setSimulationAPI(module);
            }
        });
    }, []);

    function toggleModalVisibility(vis) {
        setModalVisible(!modal_visible);
    }

    function onModalAccept(ticker, price) {
        // create new asset map
        var asset_map = new SimAssetMap(assets);
        asset_map.addRecord(ticker, price);
        setAssets(asset_map);
        toggleModalVisibility();
        console.log("New assets list: ", asset_map);
    }

    function selectAsset(ticker, value) {
        var asset_map = new SimAssetMap(assets);
        asset_map.setSelected(ticker, value);
        console.log("Asset_map: ", asset_map);
        setAssets(asset_map);
    }

    function deleteSelected() {
        var asset_map = new SimAssetMap(assets);
        asset_map.deleteSelected();
        setAssets(asset_map);
    }

    // should be done once on page loading
    async function FetchStocksList() {
        const api_url = "http://127.0.0.1:5000/finance/get_stocks_list";
        const tickers_array = await RequestGET(api_url);
        return tickers_array;
    }

    // Fetch prices of the stock from remote server
    async function FetchStockPrices() {
        const tickers = assets.getTickers();
        const api_url = "http://127.0.0.1:5000/finance/get_stocks_prices";
        let responseJson = await RequestPOST(api_url, tickers);
        return responseJson;
    }

    async function RunFinanceSimulations() {
        const responseJson = await FetchStockPrices();
        
        // get amount of money invested in each asset
        const weights = assets.getWeights();
        const test_res = simulationAPI.testSimulation(responseJson, weights, 5, 20);
    }

    // fetch list of possible tickers upon page load
    useEffect(() => {  
        const load_tickers = async () => {
            var tickers_array = await FetchStocksList();
            setTickersList(tickers_array)
        }; 
        load_tickers();
    }, []);

    return (
        <>
            <h1>Simulations!!!</h1>
            <div className="page">
                {/* <AssetButtons onAddAsset={toggleModalVisibility}
                                onDeleteSelectedCb={()=>{}}
                ></AssetButtons> */}
                <SimulationsOptionsPane addAsset={toggleModalVisibility} deleteSelectedCb={deleteSelected} onRunSim={RunFinanceSimulations}/>
                <AssetsPane assets={assets.toArray()} onSelectCb={selectAsset}/>
                <SimsResults/>
            </div>
            {modal_visible &&
                <AddAssetPopUp onClose={toggleModalVisibility} onAccept={onModalAccept} tickersList={tickers_list} />
            }
        </>
    )
}