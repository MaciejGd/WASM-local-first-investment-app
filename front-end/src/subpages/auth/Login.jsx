import { useEffect, useState } from "react";
import { RequestPOST } from "../../Requests";

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

function InputRowPassword({ title, value, onChange }) {
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

export function LogInPopUp({ onClose, onAccept, onSuccess }) {
  const [username, setUsername] = useState(null);
  const [password, setPassword] = useState(null);
  const [login_status, setLoginStatus] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  // try logging in with the credentials passed by user

  async function LogInRequest() {
    setLoading(true); // at first we want to set Loading to true, to render that to a user
    try {
      let responseJson = await RequestPOST("http://127.0.0.1:5000/auth/login", {
        username: username,
        password: password,
      });
      setLoginStatus(responseJson);
      setError(null);
      onSuccess(password);
    } catch (err) {
      setError(err.message);
      setLoginStatus(null);
    } finally {
      setLoading(false);
    }
  }

  return (
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
        {error != null && <p>{error}</p>}
        {loading && <p>Loading...</p>}
        <div className="modal_buttons">
          <button className="modal_button" onClick={onClose}>
            {" "}
            Close{" "}
          </button>
          <button className="modal_button" onClick={() => LogInRequest()}>
            {" "}
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
