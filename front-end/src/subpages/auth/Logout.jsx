import { useState } from "react";
import { RequestGET } from "../../Requests";

export function LogOutPopUp({ onClose, onAccept }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function LogOutRequest() {
    setLoading(true); // at first we want to set Loading to true, to render that to a user
    try {
      let responseJson = await RequestGET("/api/auth/logout");
      if (responseJson.error) {
        setError(responseJson.error);
      } else {
        setError(null);
        onAccept();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // TODO, make modal reusable as it is already used in multiple places
  return (
    <div className="modal_overlay">
      <div className="modal_container">
        <div className="modal_title">Are you sure, you wanna logout?</div>
        {loading && <p>Loading...</p>}
        {error && <p>Failed to logout: {error}</p>}
        <div className="modal_buttons">
          <button className="modal_button" onClick={onClose}>
            {" "}
            Close{" "}
          </button>
          <button className="modal_button" onClick={() => LogOutRequest()}>
            {" "}
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
