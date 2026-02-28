import { AssetButtons } from "../wallet/Stock";
import { useState } from "react";

function Slider({ min_value, max_value, default_value }) {
    const [val, setVal] = useState(default_value);

    return (
        <div>
            <input onChange={ (e) => setVal(e.target.value) } value={val}></input>
            <input onChange={ (e) => setVal(e.target.value) } type="range" min={min_value} max={max_value} value={val}></input>
        </div>
    );
}

function RunSimButton({ onRunSim }) {
    return (
    <button className="sims_run_button" onClick={onRunSim}>
        Run Simulation
    </button>);
}

export default function SimulationsOptionsPane({ addAsset, deleteSelectedCb, onRunSim }) {
    return (
        <div className="sims_options_pane">
            <AssetButtons onAddAsset={addAsset}  onDeleteSelectedCb={deleteSelectedCb}/>
            <Slider min_value={10} max_value={100} default_value={55}></Slider>
            <Slider min_value={10} max_value={100} default_value={55}></Slider>
            <RunSimButton onRunSim={onRunSim}></RunSimButton>
        </div>
    );
}