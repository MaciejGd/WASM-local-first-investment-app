import { AssetButtons } from "../wallet/Stock";
import { useState } from "react";

function Slider({ min_value, max_value, val, label, onChangeCb }) {
    return (
        <div>
            <p>{label}</p>
            <input onChange={ (e) => onChangeCb(e.target.value) } value={val}></input>
            <input onChange={ (e) => onChangeCb(e.target.value) } type="range" min={min_value} max={max_value} value={val}></input>
        </div>
    );
}

function RunSimButton({ onRunSim, times, sims }) {
    return (
    <button className="sims_run_button" onClick={() => onRunSim(times, sims)}>
        Run Simulation
    </button>);
}

export default function SimulationsOptionsPane({ addAsset, deleteSelectedCb, onRunSim }) {    
    const [times, setTimes] = useState(50);
    const [sims, setSims] = useState(50);
    // TODO - reject too big values for vars

    return (
        <div className="sims_options_pane">
            <AssetButtons onAddAsset={addAsset}  onDeleteSelectedCb={deleteSelectedCb}/>
            <Slider min_value={10} max_value={100} default_value={55} val={times} label={"Timepoints"} onChangeCb={setTimes}></Slider>
            <Slider min_value={10} max_value={100000} default_value={55} val={sims} label={"Simulations"} onChangeCb={setSims}></Slider>
            <RunSimButton onRunSim={onRunSim} times={times} sims={sims}></RunSimButton>
        </div>
    );
}