import { SimsResultsPieChart } from "./SimsResultsPieChart.jsx";
import "./results/SimsResultsAssetsTable.jsx";
import SimsResultsAssetsPane from "./results/SimsResultsAssetsTable.jsx";
import { SimResultsTable } from "./results/SimsReturnsResultsTable.jsx";
import { SimResultsRiskPane } from "./results/SimsResultsRiskAnalysis.jsx";
import { useState } from "react";
import { IndexedDbHandler } from "../../db/DbDataTables.js"; // indexed db instance
import AddAssetPopUp from "../wallet/AddAssetPopUp.jsx";
import { useLiveQuery } from "dexie-react-hooks";
import { SimAssetMap } from "./SimsAssetsData.js";
import { SimRunningPopUp } from "./SimPopUps.jsx";
import { ErrorPopUp } from "../../components/PopUp.jsx";
/// Here should be another table showing the results of run simulations
const PERCENTILE_SIZE = 9; // we wanna show the 9th percentile at most
const PERCENTILES = 3; // we have three results showing in percentiles

function ShowSavedSimsModal({ onAccept, onClose }) {
  const db_instance = IndexedDbHandler.getInstance();
  const [selected, setSelected] = useState(0);

  const db_saved_sims = useLiveQuery(
    async () => await db_instance.getSimsHistory(),
    [],
    [],
  );

  return (
    <div className="modal_overlay">
      <div className="modal_container">
        <div className="modal_title">Add asset</div>
        <div className="modal_input_table">
          {db_saved_sims.map((el, idx) => {
            return (
              <button
                onClick={() => setSelected(el)}
                className={selected === el ? "selected" : ""}
                key={idx}
              >
                {el.name}
              </button>
            );
          })}
        </div>
        <div className="modal_buttons">
          <button className="modal_button" onClick={onClose}>
            {" "}
            Close{" "}
          </button>
          <button className="modal_button" onClick={() => onAccept(selected)}>
            {" "}
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}

function SaveSimModal({ onAccept, onClose }) {
  const [sim_name, setSimName] = useState("");

  return (
    <div className="modal_overlay">
      <div className="modal_container">
        <div className="modal_title">Input simulation name:</div>
        <div className="modal_input_table">
          <input
            className="modal_input"
            onChange={(e) => setSimName(e.target.value)}
            autoFocus={true}
          ></input>
        </div>
        <div className="modal_buttons">
          <button className="modal_button" onClick={onClose}>
            {" "}
            Close{" "}
          </button>
          <button className="modal_button" onClick={() => onAccept(sim_name)}>
            {" "}
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}

function SimsResultsButtons({ saveSim, showSaved }) {
  return (
    <div className="sims_results_buttons">
      <button className="sims_results_button" onClick={saveSim}>
        Save Sim
      </button>
      <button className="sims_results_button" onClick={showSaved}>
        Restore from saved
      </button>
    </div>
  );
}

function SimsResultsDescription({ header }) {
  return (
    <div className="sims_results_section_desc">
      <span className="sims_results_desc_span">{"Simulated returns"}</span>
    </div>
  );
}

function SimsResultsAssetsDescription({ sims, timepoints, date }) {
  return (
    <div className="sims_results_section_desc">
      <span className="sims_results_desc_span">{"Simulation details"}</span>
      <span className="sims_results_desc_span">{`Date of simulation: ${date.toDateString()}`}</span>
      <span className="sims_results_desc_span">{`Number of simulations run: ${sims}`}</span>
      <span className="sims_results_desc_span">{`Number of timepoints simulated: ${timepoints}`}</span>
    </div>
  );
}

function SimsResultsRiskDescription() {
  return (
    <div className="sims_results_section_desc">
      <span className="sims_results_desc_span">{"Risk analysis"}</span>
    </div>
  );
}

export default function SimsResults({
  restoreSimsResults,
  results,
  assets,
  date,
  sims,
  timepoints,
}) {
  const [save_modal_vis, setSaveModalVis] = useState(false);
  const [show_saved_modal_vis, setShowSavedModalVis] = useState(false);
  const [sim_results_error, setSimsResultsError] = useState(""); // error on asset passed to pop-up

  const db_instance = IndexedDbHandler.getInstance();
  if (!results || results.length === 0) {
    return <></>;
  }

  // get tickers array
  const tickers_state = SimAssetMap.getTickersArray(assets);
  // sims asset map to array
  const assets_state = SimAssetMap.toArray(assets);

  async function AddToHistory(sim_name) {
    try {
      var res = await db_instance.addSimsHistory({
        name: sim_name,
        results: results,
        assets: assets,
        date: date,
        sims: sims,
        timepoints: timepoints,
      });
    } catch (error) {
      console.error(error);
    } finally {
      // close modal on save
      if (res != true) {
        setSimsResultsError(`Name "${sim_name}" already used.`);
      } else {
        setSaveModalVis(false);
      }
    }
  }

  // get all values from the specified index. These would be the CVaRs
  const cvarsArr = results.slice(PERCENTILES * PERCENTILE_SIZE + 1);
  const VaR = (results[PERCENTILES * PERCENTILE_SIZE] * 100).toFixed(2); // Value at risk in percentages

  // count percentage usage of cvars in overall risk
  const cvars_sum = cvarsArr.reduce((a, b) => {
    return a + b;
  }, 0);
  // throw divide by zero exception
  if (cvars_sum === 0) {
    throw new Error("Sum of the array should not be equal to 0!!!");
  }
  const cvars = cvarsArr.map((el) => {
    return ((el / cvars_sum) * 100).toFixed(2);
  });

  const SaveSimsModal = save_modal_vis ? SaveSimModal : () => <></>;
  const ShowSavedModal = show_saved_modal_vis
    ? ShowSavedSimsModal
    : () => <></>;

  return (
    <>
      <h1>Simulation Results</h1>
      <div className="sims_results_pane">
        <SimsResultsButtons
          saveSim={() => setSaveModalVis(true)}
          showSaved={() => setShowSavedModalVis(true)}
        ></SimsResultsButtons>
        <SimsResultsAssetsDescription
          date={date}
          sims={sims}
          timepoints={timepoints}
        ></SimsResultsAssetsDescription>
        <SimsResultsAssetsPane assets={assets_state}></SimsResultsAssetsPane>
        <SimsResultsDescription></SimsResultsDescription>
        <SimResultsTable results={results} />
        <SimResultsRiskPane tickers={tickers_state} VaR={VaR} cvars={cvars}></SimResultsRiskPane>
      </div>
      <SaveSimsModal
        onClose={() => setSaveModalVis(false)}
        onAccept={AddToHistory}
      ></SaveSimsModal>
      <ShowSavedModal
        onClose={() => setShowSavedModalVis(false)}
        onAccept={(el) => {
          restoreSimsResults(el);
          setShowSavedModalVis(false);
        }}
      ></ShowSavedModal>
      {sim_results_error !== "" && (
        <ErrorPopUp
          content={sim_results_error}
          onClose={() => setSimsResultsError("")}
        ></ErrorPopUp>
      )}
    </>
    // we do not want to plot all simulations run in here to the end-user
  );
}
