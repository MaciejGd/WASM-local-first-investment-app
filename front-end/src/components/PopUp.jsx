import { useState } from "react";
/** Pop-up component for adding asset to Portfolio */


/// Module showing pup up with some code content + two buttons, Accept and Close
export default function PopUpComponent({ title, content, buttons }) {

    return (
    <div className="modal_overlay">
        <div className="modal_container">
            <div className="modal_title">
                {title}
            </div>
            <div>
                {content}
            </div>            
            <div className="modal_buttons">
                {buttons}
            </div>
        </div>
    </div>
    );
}