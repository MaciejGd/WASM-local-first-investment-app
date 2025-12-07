import './App.css';
import StockPage from './subpages/wallet/Stock.jsx';
import SettingsPage from './subpages/Settings.jsx';
import CryptoPage from './subpages/Crypto.jsx';
import ObligationsPage from './subpages/Obligations.jsx';
import SimulationsPage from './subpages/Simulations.jsx';
import GraphsPage from './subpages/Graphs.jsx';
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import { useState } from 'react';
import { WalletIcon, LeftArrowIcon, RightArrowIcon, CryptoIcon, GraphsIcon, ObligationsIcon, SimulationsIcon, SettingsIcon } from './IconLoader.jsx';


function NavigationBar() {
  const [visible, setVisible] = useState(true);

  function clickButton() {
    console.log("Hide button pressed!");
    setVisible(!visible);
  }

  return visible ? <NavBar onHideButtonClick={clickButton}></NavBar> : <HiddenNavBar onHideButtonClick={clickButton}></HiddenNavBar>;
}

function HiddenNavBar({onHideButtonClick}) {
  return (
    <nav className="sidebar">
      <button className="navigationButton" onClick={onHideButtonClick}><RightArrowIcon /></button>
      <NavLink className="navigationButton" to="/stock"><WalletIcon /> </NavLink>
      <NavLink className="navigationButton" to="/crypto"><CryptoIcon/></NavLink>
      <NavLink className="navigationButton" to="/obligations"><ObligationsIcon/></NavLink>
      <NavLink className="navigationButton" to="/simulations"><SimulationsIcon/></NavLink>
      <NavLink className="navigationButton" to="/graphs"><GraphsIcon/></NavLink>
      <NavLink className="navigationButton" to="/settings"><SettingsIcon/></NavLink>
    </nav>
  );
}

function NavBar({onHideButtonClick}) {
  return (
    <nav className="sidebar">
      <button className="navigationButton" onClick={onHideButtonClick}><LeftArrowIcon /><span>Hide navbar</span></button>
      <NavLink className="navigationButton" to="/stock"><WalletIcon />Stock </NavLink>
      <NavLink className="navigationButton" to="/crypto"><CryptoIcon/>Crypto</NavLink>
      <NavLink className="navigationButton" to="/obligations"><ObligationsIcon/>Obligations</NavLink>
      <NavLink className="navigationButton" to="/simulations"><SimulationsIcon/>Simulations</NavLink>
      <NavLink className="navigationButton" to="/graphs"><GraphsIcon/>Graphs</NavLink>
      <NavLink className="navigationButton" to="/settings"><SettingsIcon/>Settings</NavLink>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="layout">
        <NavigationBar></NavigationBar>
        <main className="content">
          <Routes>
            <Route path="/" element={<StockPage/>}></Route>
            <Route path="/stock" element={<StockPage/>}></Route>
            <Route path="/crypto" element={<CryptoPage/>}></Route>
            <Route path="/obligations" element={<ObligationsPage/>}></Route>
            <Route path="/simulations" element={<SimulationsPage/>}></Route>
            <Route path="/graphs" element={<GraphsPage/>}></Route>
            <Route path="/settings" element={<SettingsPage/>}></Route>
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

