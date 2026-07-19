import { useState } from "react";
import { RequestPOST } from "../../Requests";
import RegisterPopUp from "./Register";
import { ErrorPopUp } from "../../components/PopUp";

export function InputRow({ title, onChange }) {
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

export function InputRowPassword({ title, onChange }) {
  return (
    <div className="modal_input_row">
      <span>{title}</span>
      <input
        className="modal_input"
        type="password"
        onChange={(e) => onChange(e.target.value)}
      ></input>
    </div>
  );
}

export function LogInPopUp({ onClose, onSuccess }) {
  const [username, setUsername] = useState(null);
  const [password, setPassword] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [register_modal_vis, setRegisterModalVis] = useState(false);
  // try logging in with the credentials passed by user

  async function LogInRequest() {
    setLoading(true); // at first we want to set Loading to true, to render that to a user
    try {
      let response = await RequestPOST("/api/auth/login", {
        username: username,
        password: password,
      });
      let responseJson = await response.json();
      if (responseJson.error) {
        setError(responseJson.error);
      } else {
        setError(null);
        onSuccess(password, responseJson.salt);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function closeRegistering() {
    setRegisterModalVis(false);
  }

  return (
    <>
      <div className="modal_overlay">
        <div className="modal_container">
          <div className="modal_title">Login</div>
          <div className="modal_input_table">
            <InputRow
              title="Username"
              value={username}
              onChange={setUsername}
            ></InputRow>
            <InputRowPassword
              title="Password"
              value={password}
              onChange={setPassword}
            ></InputRowPassword>
          </div>
          {/* {error != null && <p>{error}</p>} */}
          {loading && <p>Loading...</p>}
          <div className="modal_buttons">
            <button
              className="modal_button"
              onClick={() => setRegisterModalVis(true)}
            >
              Register
            </button>
            <button className="modal_button" onClick={onClose}>
              {" "}
              Close{" "}
            </button>
            <button
              className="modal_button"
              onClick={async () => await LogInRequest()}
            >
              {" "}
              Accept
            </button>
          </div>
        </div>
      </div>
      {error && (
        <ErrorPopUp content={error} onClose={() => setError(null)}></ErrorPopUp>
      )}
      {register_modal_vis && (
        <RegisterPopUp
          onClose={closeRegistering}
          onRegistered={() => setRegisterModalVis(false)}
        ></RegisterPopUp>
      )}
    </>
  );
}
