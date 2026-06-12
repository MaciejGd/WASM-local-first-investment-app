import Chart from "chart.js/auto";
import LineChart from "./LineChart.jsx";
import { CategoryScale } from "chart.js";
import { useState } from "react";
import "../../styling/graphs.css";
import ComboBox from "../../components/Combobox.jsx";

Chart.register(CategoryScale);

/// class for storing selected graph data
class GraphAssetData {
  constructor(ticker, indicator, color) {
    this.ticker = ticker; // assets's ticker
    this.indicator = indicator; // asset's indicator
    this.color = color; // color representing asset on graph
    this.data = []; // data points for graph asset
  }
}

// TODO remove that, as it has been added for debug only
export const Data = [
  {
    id: 1,
    year: 2016,
    userGain: 80000,
    userLost: 823,
  },
  {
    id: 2,
    year: 2017,
    userGain: 45677,
    userLost: 345,
  },
  {
    id: 3,
    year: 2018,
    userGain: 78888,
    userLost: 555,
  },
  {
    id: 4,
    year: 2019,
    userGain: 90000,
    userLost: 4555,
  },
  {
    id: 5,
    year: 2020,
    userGain: 4300,
    userLost: 234,
  },
];

function generateRandomData() {
  var data = [];
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
function GraphTickerSelector({ onChange }) {
  // TODO add valid data for combo box
  return (
    <div className="graph_ticker_selector">
      <ComboBox onChange={onChange} placeholder="Ticker..."></ComboBox>
    </div>
  );
}

/// Input field letting user to choose indicator to display on graph
function GraphIndicatorField({ onChange }) {
  const options = ["Revenue", "NetIncome", "EBIDTA", "CFO"];

  return (
    <div className="graph_indicator_field">
      <ComboBox
        options={options}
        value={""}
        onChange={onChange}
        placeholder="Indicator..."
      ></ComboBox>
    </div>
  );
}

function GraphSelector({ onAdd }) {
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

  function newSetIndicator(indicator) {
    console.log("Add indicator ", indicator);
    setIndicator(indicator);
  }

  return (
    <div className="graph_selector">
      <GraphTickerSelector onChange={setTicker}></GraphTickerSelector>
      <GraphIndicatorField onChange={newSetIndicator}></GraphIndicatorField>
      <button
        style={{ backgroundColor: "aqua", color: "black", fontWeight: "bold" }}
        onClick={() => addLegendEntry()}
      >
        +
      </button>
    </div>
  );
}

/// Chart we want to print on the page
function GraphChart({ graphData }) {
  const chartData = {
    labels: Data.map((data) => data.year), // one unified graph label (most probably time)
    datasets: graphData.map((graph) => {
      return {
        data: graph.data.map((data) => data.userGain),
        backgroundColor: graph.color,
        borderColor: graph.color,
        borderWidth: 2,
      };
    }),
  };

  return (
    <div className="graph_chart">
      <LineChart chartData={chartData}></LineChart>
    </div>
  );
}

/// Legend displaying info about graph chart, ticker, indicator and color
function GraphLegend({ graphData, onDelete }) {
  return (
    <div className="graph_legend">
      {graphData.map((data, index) => (
        <GraphLegendEntry entry={data} key={index} onDelete={onDelete} />
      ))}
    </div>
  );
}

function GraphLegendEntry({ entry, onDelete }) {
  return (
    <div className="legend_entry">
      <div className="legend_entry_description">Ticker: {entry.ticker}</div>
      <div className="legend_entry_description">
        Indicator: {entry.indicator}
      </div>
      <button
        style={{ color: "black", backgroundColor: entry.color }}
        onClick={() => onDelete(entry.indicator, entry.ticker)}
      >
        X
      </button>
    </div>
  );
}

function GraphContainer({ records, onDelete }) {
  return (
    <div className="graph_container">
      <GraphChart graphData={records}></GraphChart>
      <GraphLegend graphData={records} onDelete={onDelete}></GraphLegend>
    </div>
  );
}

export default function GraphsPage() {
  const [graphs, setGraphs] = useState(new Map());

  // we should add record to graph map
  function AddRecord(graphRecord) {
    const indicator = graphRecord.indicator;
    const graph_data = new Map(graphs);
    if (!graph_data.has(indicator)) {
      // create entry of graph if does not exist
      graph_data.set(indicator, []);
    }
    graphRecord.data = generateRandomData();
    // exit if ticker + indicator combination already on graph
    const rec = graph_data.get(indicator);
    if (rec.find((e) => e.ticker === graphRecord.ticker)) {
      return;
    }

    graph_data.get(indicator).push(graphRecord);
    setGraphs(graph_data);

    graphs.forEach((graph) => {
      console.log(graph);
    });
  }

  // function removing record from the map
  function deleteRecord(indicator, ticker) {
    const new_graphs = new Map(graphs);
    // check if in map
    if (!new_graphs.has(indicator)) {
      return;
    }
    const rec = new_graphs.get(indicator);
    if (!rec.find((e) => e.ticker === ticker)) {
      return;
    }
    // find element and remove
    for (let i = 0; i < rec.length; i++) {
      if (rec[i].ticker === ticker) {
        rec.splice(i, 1);
      }
    }
    // if after removal size of inner array is 0, then remove whole map entry
    if (rec.length === 0) {
      new_graphs.delete(indicator);
    }
    setGraphs(new_graphs);
  }

  // need to transform map to an array so it can be mapped and drawn
  const graph_array = [];
  graphs.forEach((e) => {
    graph_array.push(e);
  });

  return (
    <div className="graph_page">
      <h1>Graphs!!!</h1>
      <GraphSelector onAdd={AddRecord}></GraphSelector>
      <div>
        {graphs.size == 0 && <GraphContainer records={[]}></GraphContainer>}
        {graphs.size !== 0 &&
          graph_array.map((records, idx) => (
            <GraphContainer
              records={records}
              key={idx}
              onDelete={deleteRecord}
            ></GraphContainer>
          ))}
      </div>
    </div>
  );
}
