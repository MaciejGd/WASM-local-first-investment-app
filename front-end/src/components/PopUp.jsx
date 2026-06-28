import { useState } from "react";
/** Pop-up component for adding asset to Portfolio */

/// Module showing pup up with some code content + two buttons, Accept and Close
export function PopUpComponent({ title, content, buttons }) {
  return (
    <div className="modal_overlay">
      <div className="modal_container">
        <div className="modal_title">{title}</div>
        <div>{content}</div>
        <div className="modal_buttons">{buttons}</div>
      </div>
    </div>
  );
}

export function PopUpContent({ txt }) {
  return <p>{txt}</p>;
}

export function PopUpButtons({ content, onClose }) {
  return (
    <>
      <button onClick={onClose}>{content}</button>
    </>
  );
}

/**
 * Classic ErrorPopUp to be used on error thrown by the application
 * @param {*} param0 
 * @returns 
 */
export function ErrorPopUp({ content, onClose }) {
  return (
    <PopUpComponent
      title="Error"
      content={<PopUpContent txt={content}></PopUpContent>}
      buttons={
        <PopUpButtons onClose={onClose} content={"Close"}></PopUpButtons>
      }
    ></PopUpComponent>
  );
}

export function InfoPopUp({ content, onClose }) {
  return (
    <PopUpComponent
      title="Info"
      content={<PopUpContent txt={content}></PopUpContent>}
      buttons={
        <PopUpButtons onClose={onClose} content={"Close"}></PopUpButtons>
      }
    ></PopUpComponent>
  );
}