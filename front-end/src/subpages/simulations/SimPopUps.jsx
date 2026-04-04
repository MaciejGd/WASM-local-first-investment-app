import "../../components/PopUp";
import PopUpComponent from "../../components/PopUp";

function PopUpContent({ txt }) {
    return (
        <p>{txt}</p>
    )
}

function PopUpButtons({ content, onClose }) {
    return (
        <>
            <button onClick={onClose}>{content}</button>
        </>
    )
}

export function SimErrorPopUp({content, onClose}) {
    return (
        <PopUpComponent title="Error" 
            content={<PopUpContent txt={content}></PopUpContent>} 
            buttons={<PopUpButtons onClose={onClose} content={"Close"}></PopUpButtons>}>
        </PopUpComponent>
    )
} 

export function SimRunningPopUp({ onClose }) {
    return (
        <PopUpComponent title="Simulation running"
            buttons={<PopUpButtons onClose={onClose} content={"Abort"}></PopUpButtons>}>            
        </PopUpComponent>
    )
}