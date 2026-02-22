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

export default function SimulationsOptionsPane() {
    return (
        <div className="sims_options_pane">
            <AssetButtons onAddAsset={()=>{}}  onDeleteSelectedCb={()=>{}}/>
            <Slider min_value={10} max_value={100} default_value={55}></Slider>
            <Slider min_value={10} max_value={100} default_value={55}></Slider>
        </div>
    );
}