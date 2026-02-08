import { useState } from "react";
/** Pop-up component for adding asset to Portfolio */

function InputRow({title, value, onChange}) {
    return (
    <div className="modal_input_row">
        <span>{title}</span>
        <input className="modal_input" onChange={(e)=>onChange(e.target.value)}></input>
    </div>);
}

export default function AddAssetPopUp({ onClose, onAccept }) {
    const [ticker, setTicker] = useState("");
    const [quantity, setQuantity] = useState("");
    const [price, setPrice] = useState("");

    return (
    <div className="modal_overlay">
        <div className="modal_container">
            <div className="modal_title">
                Add asset
            </div>
            <div className="modal_input_table">
                <InputRow title="Ticker"    value={ticker}      onChange={setTicker}></InputRow>
                <InputRow title="Quantity"  value={quantity}    onChange={setQuantity}></InputRow>
                <InputRow title="Price"     value={price}       onChange={setPrice}></InputRow>
            </div>
            <div className="modal_buttons">
                <button className="modal_button" onClick={onClose}> Close </button>
                <button className="modal_button" onClick={() => onAccept(ticker, quantity, price)}> Accept</button>
            </div>
        </div>
    </div>
    );
}