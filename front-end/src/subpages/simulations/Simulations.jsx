import {
  AssetButtons,
} from "../wallet/Stock";
import "../../styling/simulations.css";
import { useEffect, useState, useRef } from "react";

import SimulationsOptionsPane from "./SimsOptionsPane";
import AssetsPane from "./SimsAssetsPane";
import { SimAssetMap } from "./SimsAssetsData";
import SimsResults from "./SimsResults.jsx";
import { RequestGET, RequestPOST } from "../../Requests.js";
import ComboBox from "../../components/Combobox.jsx";
import {
  useSimulationWorker,
  useSequencialWorker,
} from "./SimulationRunners.js";
import { SimRunningPopUp } from "./SimPopUps.jsx";
import { ErrorPopUp } from "../../components/PopUp.jsx";

// what do we want in here??? we want some table which we can add tickers + set proportions / amount of
// we need to add - ticker + amount of money invested (ticker for getting the prices, money invested for weights)
function InputRow({ title, onChange, focus, options = [] }) {
  return (
    <div className="modal_input_row">
      <span>{title}</span>
      {/* <input className="modal_input" onChange={(e)=>onChange(e.target.value)} autoFocus={focus}></input> */}
      <ComboBox
        onChange={onChange}
        placeholder="Ticker..."
        focus={focus}
        options={options}
      />
    </div>
  );
}

function AddAssetPopUp({ onClose, onAccept, tickersList }) {
  const [ticker, setTicker] = useState("");
  const [price, setPrice] = useState("");

  return (
    <div className="modal_overlay">
      <div className="modal_container">
        <div className="modal_title">Add asset</div>
        <div className="modal_input_table">
          <InputRow
            title="Ticker"
            onChange={setTicker}
            focus={true}
            options={tickersList}
          ></InputRow>
          <InputRow title="Planned cost" onChange={setPrice}></InputRow>
        </div>
        <div className="modal_buttons">
          <button className="modal_button" onClick={onClose}>
            {" "}
            Close{" "}
          </button>
          <button
            className="modal_button"
            onClick={() => onAccept(ticker, price)}
          >
            {" "}
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SimulationsPage() {
  const [modal_visible, setModalVisible] = useState(false);
  const [asset_error, setAssetError] = useState(""); // error on asset passed to pop-up
  const [assets, setAssets] = useState({}); // map of ticker to its price
  const [resultsAssets, setResultsAssets] = useState({}); // assets to be passed to
  const [simsAmount, setSimsAmount] = useState(0);
  const [simsAmountResults, setSimsAmountResults] = useState(0);
  const [simsTimepoints, setSimsTimepoints] = useState(0);
  const [simsTimepointsResults, setSimsTimepointsResults] = useState(0);
  const [simsResultsDate, setSimsResultsDate] = useState(null);
  const [tickers_list, setTickersList] = useState([]);
  const [simsResults, setSimsResults] = useState([]);
  const [simRunning, setSimRunning] = useState(false);
  const assetsRef = useRef(assets);
  const simsAmountRef = useRef(simsAmount);
  const simsTimepointsRef = useRef(simsTimepoints);

  const { simRun, simTerminate } = useSimulationWorker((e) => {
    setSimRunning(false);
    setSimsResults(e);
    setResultsAssets({...assetsRef.current});
    setSimsTimepointsResults(simsTimepointsRef.current);
    setSimsAmountResults(simsAmountRef.current);
    setSimsResultsDate(new Date());
  });

  useEffect(() => {
    assetsRef.current = assets;
  }, [assets]);

  useEffect(() => {
    simsTimepointsRef.current = simsTimepoints;
  }, [simsTimepoints]);

  useEffect(() => {
    simsAmountRef.current = simsAmount;
  }, [simsAmount]);

  function toggleModalVisibility(vis) {
    setModalVisible(!modal_visible);
  }

  function restoreFromSaved(obj) {
    var res = obj.results;
    if (!(obj.results instanceof Array)) {
      res = Object.values(obj.results);
    }
    setSimsResults(res);
    // need to wrap in SimAssetMap
    setResultsAssets(obj.assets);
    var date = obj.date;
    if (!(date instanceof Date)) {
      date = new Date(date);
    }
    setSimsResultsDate(date);
    setSimsAmountResults(obj.sims);
    setSimsTimepointsResults(obj.timepoints);
  }

  function onModalAccept(ticker, price) {
    // create new asset map
    var asset_map = {...assets};
    // check if ticker is valid
    if (!tickers_list.includes(ticker)) {
      setAssetError("No such asset with this tickers in database!");
      return;
    }
    const rec_add = SimAssetMap.addRecord(asset_map, ticker, price);
    // check if number passed as argument
    if (rec_add === false) {
      setAssetError("Failed to add asset, price should be a number!");
      return;
    }
    setAssets(asset_map);
    toggleModalVisibility();
    console.log("New assets list: ", asset_map);
  }

  function selectAsset(ticker, value) {
    var asset_map = {...assets};
    SimAssetMap.setSelected(asset_map, ticker, value);
    console.log("Asset_map: ", asset_map);
    setAssets(asset_map);
  }

  function deleteSelected() {
    var asset_map = {...assets};
    SimAssetMap.deleteSelected(asset_map);
    setAssets(asset_map);
  }

  /**
   * Stop running simulation
   */
  function stopSimulation() {
    simTerminate();
    setSimRunning(false);
  }

  // should be done once on page loading
  async function FetchStocksList() {
    const api_url = "http://127.0.0.1:5000/finance/get_stocks_list";
    const tickers_array = await RequestGET(api_url);
    return tickers_array;
  }

  // Fetch prices of the stock from remote server
  async function FetchStockPrices() {
    const tickers = SimAssetMap.getTickers(assets);
    const api_url = "http://127.0.0.1:5000/finance/get_stocks_prices";
    let responseJson = await RequestPOST(api_url, tickers);
    return responseJson;
  }

  async function RunFinanceSimulations(times, sims) {
    // fetch stock prices
    const responseJson = await FetchStockPrices();
    // get amount of money invested in each asset
    setSimRunning(true); // set running as simulation status
    const weights = SimAssetMap.getWeights(assets);
    simRun({
      stockData: responseJson,
      weights: weights,
      times: times,
      sims: sims,
    });
    setSimsAmount(sims);
    setSimsTimepoints(times);
  }

  // fetch list of possible tickers upon page load
  useEffect(() => {
    const load_tickers = async () => {
      var tickers_array = await FetchStocksList();
      setTickersList(tickers_array);
    };
    load_tickers();
  }, []);

  return (
    <>
      <div className="page">
        <div className="sims_settings_container">
          <SimulationsOptionsPane
            addAsset={toggleModalVisibility}
            deleteSelectedCb={deleteSelected}
            onRunSim={RunFinanceSimulations}
          />
          <AssetsPane assets={SimAssetMap.toArray(assets)} onSelectCb={selectAsset} />
        </div>
        <SimsResults
          restoreSimsResults={restoreFromSaved}
          results={simsResults}
          assets={resultsAssets}
          sims={simsAmountResults}
          timepoints={simsTimepointsResults}
          date={simsResultsDate}
        />
      </div>
      {modal_visible && (
        <AddAssetPopUp
          onClose={toggleModalVisibility}
          onAccept={onModalAccept}
          tickersList={tickers_list}
        />
      )}
      {asset_error !== "" && (
        <ErrorPopUp
          content={asset_error}
          onClose={() => setAssetError("")}
        ></ErrorPopUp>
      )}
      {simRunning && (
        <SimRunningPopUp onClose={stopSimulation}></SimRunningPopUp>
      )}
    </>
  );
}
