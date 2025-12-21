import Chart from "chart.js/auto"
import LineChart from "./LineChart.jsx";
import { CategoryScale } from "chart.js";
import { useState } from 'react';
import "../../styling/graphs.css";
import ComboBox from "../../components/Combobox.jsx";

Chart.register(CategoryScale);

/// class for storing selected graph data
class GraphAssetData {
  constructor(ticker, indicator, color) {
    this.ticker = ticker;       // assets's ticker
    this.indicator = indicator; // asset's indicator
    this.color = color;         // color representing asset on graph
    this.data = [];             // data points for graph asset
  }

};

// TODO remove that, as it has been added for debug only
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

function generateRandomData() {
  var data=[];
  for (var i = 1; i <= 5; i++) {
    var new_val = {
      id: i,
      year: 2016 + i,
      userGain: Math.floor(Math.random() * 80000) + 3000,
      userLost: 1,
    };
    data.push(new_val);
  }
  return data;
}

// input field to select stock ticker
function GraphTickerSelector({onChange}) {
  // TODO add valid data for combo box
  return (
    <div className="graph_ticker_selector">
      <ComboBox onChange={onChange}></ComboBox>
    </div>
  );
}

/// Input field letting user to choose indicator to display on graph
function GraphIndicatorField({onChange}) {
  const options = [
    "Revenue",
    "NetIncome",
    "EBIDTA",
    "CFO"
  ];

  return (
    <div className="graph_indicator_field">
      <ComboBox options={options} value={""} onChange={onChange}></ComboBox>
    </div>
  );
}

function GraphSelector({onAdd}) {
  const [ticker, setTicker] = useState("");
  const [indicator, setIndicator] = useState("");

  function randomHexColor() {
    return `#${Math.floor(Math.random() * 0xffffff)
      .toString(16)
      .padStart(6, "0")}`;
  }

  function addLegendEntry() {
    onAdd(new GraphAssetData(ticker, indicator, randomHexColor()));
  }

  return (
  <div className="graph_selector">
    <GraphTickerSelector onChange={setTicker}></GraphTickerSelector>
    <GraphIndicatorField onChange={setIndicator}></GraphIndicatorField>
    <button style={{backgroundColor: "aqua", color: "black", fontWeight: "bold"}} onClick={()=>addLegendEntry()}>
      +
    </button>
  </div>
  );
}


/// Chart we want to print on the page
function GraphChart({graphs_data}) {
  const chartData = {
    labels: Data.map((data) => data.year), // one unified graph label (most probably time)
    datasets: graphs_data.map((graph)=>{
      return {
        data: graph.data.map((data) => data.userGain),
        backgroundColor: graph.color,
        borderColor: graph.color,
        borderWidth: 2
      }
    }),
  };

  return (
      <div className="graph_chart">        
          <LineChart chartData={chartData}></LineChart>
      </div>
  );
}

/// Legend displaying info about graph chart, ticker, indicator and color
function GraphLegend({graphData, onDelete}) {
  return (
    <div className="graph_legend">
      {graphData.map((data, index)=>(
        <GraphLegendEntry entry={data} key={index} index={index} onDelete={onDelete}/>
      ))}
    </div>
  );
}

function GraphLegendEntry({entry, onDelete, key, index}) {
  return (
    <div className="legend_entry">
      <div className="legend_entry_description" >
        Ticker: {entry.ticker}
      </div>
      <div className="legend_entry_description">
        Indicator: {entry.indicator}
      </div>
      <button style={{color: "black", backgroundColor: entry.color}} onClick={()=> onDelete(index)}>
        X
      </button>
    </div>
  );
}


// Graph container would consist of Ticker field, param field, and graph itself 
// (also something like setting time of graph would be nice)
function GraphContainer() {
  const [graphRecords, setGraphRecords] = useState([]);

  function AddGraphRecord(graphRecord) {
    // do not add if already there
    const already_added = graphRecords.some((record) => {  
      return graphRecord.ticker == record.ticker && graphRecord.indicator == record.indicator;
    });
    if (already_added) return;
    
    // TODO validate incoming ticker and 

    // fetch data for ticker and indicator
    graphRecord.data = generateRandomData();
    // add graph record to graph record list
    setGraphRecords([...graphRecords, graphRecord]);
  }
  // delete graph from the view
  function DeleteRecord(index) {
    var new_arr = [...graphRecords];
    new_arr.splice(index, 1);
    setGraphRecords(new_arr);
  }

  return (
    <div className="graph_container">
      <GraphSelector onAdd={AddGraphRecord}></GraphSelector>
      <GraphChart data_label="test" graphs_data={graphRecords}></GraphChart>
      <GraphLegend graphData={graphRecords} onDelete={DeleteRecord}></GraphLegend>
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