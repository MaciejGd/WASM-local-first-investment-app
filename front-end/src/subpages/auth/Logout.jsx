import { useState } from "react";
import { RequestPOST } from "../../Requests";

export function LogOutPopUp({ onClose, onAccept }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    async function LogOutRequest() {
        setLoading(true); // at first we want to set Loading to true, to render that to a user
        try {
            let responseJson = await RequestPOST(
                "http://127.0.0.1:5000/auth/logout"
            )
            setError(null);
            onAccept();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // TODO, make modal reusable as it is already used in multiple places
    return (
    <div className="modal_overlay">
        <div className="modal_container">
            <div className="modal_title">
                Are you sure, you wanna logout?
            </div>
            {
                (loading) && 
                <p>Loading...</p>
            }
            <div className="modal_buttons">
                <button className="modal_button" onClick={onClose}> Close </button>
                <button className="modal_button" onClick={() => LogOutRequest()}> Accept</button>
            </div>
        </div>
    </div>);
}