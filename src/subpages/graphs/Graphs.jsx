import Chart from "chart.js/auto"
import LineChart from "./LineChart.jsx";
import { CategoryScale } from "chart.js";
import { useState } from 'react';
import "../../styling/graphs.css";
import ComboBox from "../../components/Dropdown.jsx";

Chart.register(CategoryScale);

export const Data = [
  {
    id: 1,
    year: 2016,
    userGain: 80000,
    userLost: 823
  },
  {
    id: 2,
    year: 2017,
    userGain: 45677,
    userLost: 345
  },
  {
    id: 3,
    year: 2018,
    userGain: 78888,
    userLost: 555
  },
  {
    id: 4,
    year: 2019,
    userGain: 90000,
    userLost: 4555
  },
  {
    id: 5,
    year: 2020,
    userGain: 4300,
    userLost: 234
  }
];


function TickerSearch() {
  return (
  <div>
    <input></input>

  </div>);
}

// input field to select stock ticker
function GraphTickerSelector() {
  return (
    <div className="graphTickerSelector">
      <input></input>
      <button></button>
    </div>
  );
}

/// Input field letting user to choose indicator to display on graph
function GraphIndicatorField() {
  const options = [
    "Revenue",
    "NetIncome",
    "EBIDTA",
    "CFO"
  ];

  return (
    <div className="graphIndicatorField">
      {/* <input list="fruit-options" id="fruits" name="fruits" placeholder="test..."></input>
      <datalist id="fruit-options">
        <option value="revenue"></option>
        <option value="net income"></option>
        <option value="ebidta"></option>
        <option value="CFO"></option>
      </datalist> */}
      <ComboBox options={options} value={""} onChange={()=>{}}></ComboBox>
    </div>
  );
}

/// Chart we want to print on the page
function GraphChart({data_label, data}) {
  const [chartData, setChartData] = useState({
    labels: Data.map((data) => data.year), 
    datasets: [
      {
        data: Data.map((data) => data.userGain),
        backgroundColor: "rgba(75,192,192,1)",
        borderColor: "black",
        borderWidth: 2
      }
    ]
  });


  return (
      <div className="graphChart">        
          <LineChart chartData={chartData}></LineChart>
      </div>
  );
}

// Graph container would consist of Ticker field, param field, and graph itself 
// (also something like setting time of graph would be nice)
function GraphContainer() {
  return (
    <div className="graphContainer">
      <GraphTickerSelector></GraphTickerSelector>
      <GraphIndicatorField></GraphIndicatorField>
      <GraphChart data_label="test" data={Data}></GraphChart>
    </div>
  );
}

export default function GraphsPage() {
  return (
      <div className="graph_page">
          <h1>Graphs!!!</h1>
          <GraphContainer></GraphContainer>
      </div>
  );
}