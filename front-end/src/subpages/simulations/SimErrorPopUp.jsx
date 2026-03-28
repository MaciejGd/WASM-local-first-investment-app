import "../../components/PopUp";
import PopUpComponent from "../../components/PopUp";

function PopUpContent({ txt }) {
    return (
        <p>{txt}</p>
    )
}

function PopUpButtons({ onClose }) {
    return (
        <>
            <button onClick={onClose}>Close</button>
        </>
    )
}

export default function SimErrorPopUp({content, onClose}) {
    return (
        <PopUpComponent title="Error" 
            content={<PopUpContent txt={content}></PopUpContent>} 
            buttons={<PopUpButtons onClose={onClose}></PopUpButtons>}>
        </PopUpComponent>
    )
} 