import "./App.css";
import StockPage from "./subpages/wallet/Stock.jsx";
import SimulationsPage from "./subpages/simulations/Simulations.jsx";
import GraphsPage from "./subpages/graphs/Graphs.jsx";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import { useState } from "react";
import {
  WalletIcon,
  LeftArrowIcon,
  RightArrowIcon,
  CryptoIcon,
  GraphsIcon,
  ObligationsIcon,
  SimulationsIcon,
  SettingsIcon,
  LogOutIcon,
} from "./IconLoader.jsx";
import { LogInPopUp } from "./subpages/auth/Login.jsx";
import { LogOutPopUp } from "./subpages/auth/Logout.jsx";
import { DBEncryptor } from "./db/db_encryptor.js";

// TODO remove after testing
import { sync_worker } from "./sync/syncWorkerWrapper.js";

function NavigationBar({ onLogOut }) {
  const [visible, setVisible] = useState(true);

  function clickButton() {
    setVisible(!visible);
  }

  return (
    <NavBar
      onHideButtonClick={clickButton}
      onLogOut={onLogOut}
      visible={visible}
    ></NavBar>
  );
}

// Left-oriented nav bar of the application
function NavBar({ onHideButtonClick, onLogOut, visible }) {
  return (
    <nav className="sidebar">
      <button className="navigationButton" onClick={onHideButtonClick}>
        {" "}
        {visible ? <LeftArrowIcon /> : <RightArrowIcon />}
        <span>{visible ? " Hide navbar " : ""}</span>
      </button>
      <NavLink className="navigationButton" to="/stock">
        <WalletIcon />
        {visible ? " Stock " : ""}{" "}
      </NavLink>
      <NavLink className="navigationButton" to="/simulations">
        <SimulationsIcon />
        {visible ? " Simulations " : ""}
      </NavLink>
      <NavLink className="navigationButton" to="/graphs">
        <GraphsIcon />
        {visible ? " Graphs " : ""}
      </NavLink>
      <button className="navigationButton" onClick={onLogOut}>
        <LogOutIcon />
        {visible ? " Logout " : ""}
      </button>
    </nav>
  );
}

// main application component
export default function App() {
  // somewhere here we should check if we are logged in and if so, render different parts of the application
  const [logged, setLogged] = useState(false); // TODO - to be changed to false after changes
  const [show_logout, setShowLogout] = useState(false);

  async function setLoggedIn(passwd, salt) {
    setLogged(true);
    const salt_mod = new Uint8Array(
      salt.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)),
    );
    // generate encryption key, based on password provided
    DBEncryptor.generateKey(passwd, salt_mod);
    sync_worker.InitCrypto(passwd, salt_mod);
  }

  function acceptLogginOut() {
    setShowLogout(false);
    setLogged(false);
  }

  function rejectLoggingOut() {
    setShowLogout(false);
  }

  function showLogOut() {
    setShowLogout(true);
  }

  return (
    <>
      {!logged && <LogInPopUp onSuccess={setLoggedIn}></LogInPopUp>}
      {logged && (
        <BrowserRouter>
          <div className="layout">
            <NavigationBar onLogOut={showLogOut}></NavigationBar>
            <main className="content">
              <Routes>
                <Route path="/" element={<StockPage />}></Route>
                <Route path="/stock" element={<StockPage />}></Route>
                <Route
                  path="/simulations"
                  element={<SimulationsPage />}
                ></Route>
                <Route path="/graphs" element={<GraphsPage />}></Route>
              </Routes>
              {show_logout && (
                <LogOutPopUp
                  onClose={rejectLoggingOut}
                  onAccept={acceptLogginOut}
                />
              )}
            </main>
          </div>
        </BrowserRouter>
      )}
    </>
  );
}
