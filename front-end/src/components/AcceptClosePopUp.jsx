/** Pop-up component for adding asset to Portfolio */

/// Module showing pop up with some code content + two buttons, Accept and Close
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
          <button className="modal_button" onClick={() => onAccept()}>
            {" "}
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
