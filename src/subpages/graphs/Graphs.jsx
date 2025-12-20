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
      <div className="graph_chart">        
          <LineChart chartData={chartData}></LineChart>
      </div>
  );
}

function GraphLegend({graphData}) {
  return (
    <div className="graph_legend">
      {graphData.map((data, index)=>(
        <GraphLegendEntry entry={data} key={index}/>
      ))}
    </div>
  );
}

function GraphLegendEntry({entry}) {
  return (
    <div className="legend_entry">
      <div className="legend_entry_description" >
        Ticker: {entry.ticker}
      </div>
      <div className="legend_entry_description">
        Indicator: {entry.indicator}
      </div>
      <button style={{color: "black", backgroundColor: entry.color}}>
        X
      </button>
    </div>
  );
}


// Graph container would consist of Ticker field, param field, and graph itself 
// (also something like setting time of graph would be nice)
function GraphContainer() {
  const [graphRecords, setGraphRecords] = useState([]);

  // const graph_records = [
  //   new GraphAssetData("MSI", "Net income", "white"),
  //   new GraphAssetData("API", "Revenue", "aqua"),
  //   new GraphAssetData("TCO", "EBIDTA", "red"),
  // ];
  function AddGraphRecord(graphRecord) {
    // do not add if already there
    const already_added = graphRecords.some((record) => {  
      graphRecord.ticker === record.ticker && graphRecord.indicator === record.indicator;
    });
    if (already_added) return;
    
    // add graph record to graph record list
    setGraphRecords([...graphRecords, graphRecord]);
  }

  return (
    <div className="graph_container">
      <GraphSelector onAdd={AddGraphRecord}></GraphSelector>
      <GraphChart data_label="test" data={Data}></GraphChart>
      <GraphLegend graphData={graphRecords}></GraphLegend>
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