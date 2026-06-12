import { useState } from "react";
/** Pop-up component for adding asset to Portfolio */

function InputRow({ title, value, onChange }) {
  return (
    <div className="modal_input_row">
      <span>{title}</span>
      <input
        className="modal_input"
        onChange={(e) => onChange(e.target.value)}
      ></input>
    </div>
  );
}

/// Module showing pup up with some code content + two buttons, Accept and Close
export default function AcceptClosePopUp({ content, onClose, onAccept }) {
  return (
    <div className="modal_overlay">
      <div className="modal_container">
        <div className="modal_title">Add asset</div>
        {/* <Content></Content> */}
        {content}
        <div className="modal_buttons">
          <button className="modal_button" onClick={onClose}>
            {" "}
            Close{" "}
          </button>
          <button
            className="modal_button"
            onClick={() => onAccept(ticker, quantity, price)}
          >
            {" "}
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
