import { useState } from "react";
import { InputRow, InputRowPassword } from "./Login";
import { RequestPOST } from "../../Requests";
import { ErrorPopUp, InfoPopUp } from "../../components/PopUp";

const register_url = "/api/auth/register";

export default function RegisterPopUp({ onClose, onRegistered }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  async function registerUser() {
    setError("");
    try {
      if (passwordRepeat !== password) {
        setError("Passwords do not match.");
        return;
      }
      setLoading(true);
      let response = await RequestPOST(register_url, {
        username: username,
        password: password,
      });
      let responseJson = await response.json();
      if (responseJson.error) {
        setError(responseJson.error);
      } else {
        setRegistered(true);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="modal_overlay">
        <div className="modal_container">
          <div className="modal_title">Register</div>
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
            <InputRowPassword
              title="Repeat password"
              value={passwordRepeat}
              onChange={setPasswordRepeat}
            ></InputRowPassword>
          </div>
          {loading && <p>Loading...</p>}
          <div className="modal_buttons">
            <button className="modal_button" onClick={onClose}>
              {" "}
              Close{" "}
            </button>
            <button
              className="modal_button"
              onClick={async () => await registerUser()}
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
      {registered && (
        <InfoPopUp
          content={"Succeed to register user account"}
          onClose={onRegistered}
        ></InfoPopUp>
      )}
    </>
  );
}
