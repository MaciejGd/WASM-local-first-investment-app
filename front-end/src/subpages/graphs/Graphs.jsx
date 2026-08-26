import Chart from "chart.js/auto";
import LineChart from "./LineChart.jsx";
import { CategoryScale } from "chart.js";
import { useState, useEffect } from "react";
import "../../styling/graphs.css";
import ComboBox from "../../components/Combobox.jsx";
import { ErrorPopUp } from "../../components/PopUp.jsx";
import {
  FetchStocksList,
  FetchIndicatorsList,
  GetIndicatorValues,
} from "../finance_api/FinanceApi.jsx";

Chart.register(CategoryScale);

class GraphAssetData {
  constructor(ticker, indicator, color) {
    this.ticker = ticker; // assets's ticker
    this.indicator = indicator; // asset's indicator
    this.color = color; // color representing asset on graph
    this.data = []; // data points for graph asset
  }
}


function GraphSelector({ onAdd, tickersList, indicatorsList }) {
  const [ticker, setTicker] = useState("");
  const [indicator, setIndicator] = useState("");

  function randomHexColor() {
    return `#${Math.floor(Math.random() * 0xffffff)
      .toString(16)
      .padStart(6, "0")}`;
  }

  function addLegendEntry() {
    onAdd(ticker, indicator, randomHexColor());
  }

  function newSetIndicator(indicator) {
    setIndicator(indicator);
  }

  return (
    <div className="graph_selector">
      <div className="graph_ticker_selector">
        <ComboBox
          options={tickersList}
          onChange={setTicker}
          placeholder="Ticker..."
        ></ComboBox>
      </div>
      <div className="graph_indicator_field">
        <ComboBox
          options={indicatorsList}
          value={""}
          onChange={newSetIndicator}
          placeholder="Indicator..."
        ></ComboBox>
      </div>
      <button
        style={{
          backgroundColor: "#4a7cff",
          color: "white",
          fontWeight: "bold",
        }}
        onClick={() => addLegendEntry()}
      >
        +
      </button>
    </div>
  );
}

/// Chart we want to print on the page
function GraphChart({ graphData }) {
  if (!graphData || graphData.length == 0) {
    return <></>;
  }
  // get all dates and make it a labels
  const all_dates = [
    ...new Set(graphData.flatMap((item) => Object.keys(item.data))),
  ];

  const chartData = {
    labels: all_dates, // one unified graph label (most probably time)
    datasets: graphData.map((graph) => {
      return {
        data: Object.values(graph.data),
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
  const [tickers_list, setTickersList] = useState([]);
  const [indicators_list, setIndicatorsList] = useState([]);
  const [error, setError] = useState("");

  /// Load list of accessible tickers from the remote server
  useEffect(() => {
    const load_tickers = async () => {
      var tickers_list = await FetchStocksList();
      setTickersList(tickers_list);
    };
    const load_indicators = async () => {
      var indicator_list = await FetchIndicatorsList();
      setIndicatorsList(indicator_list);
    };
    load_tickers();
    load_indicators();
  }, []);

  // we should add record to graph map
  async function AddRecord(ticker, indicator, color) {
    if (!tickers_list.includes(ticker)) {
      setError("Please choose ticker from list of available tickers.");
      return;
    }

    if (!indicators_list.includes(indicator)) {
      setError(
        "Please choose indicator from the list of available indicators.",
      );
      return;
    }

    const graph_data = new Map(graphs);
    if (!graph_data.has(indicator)) {
      // create entry of graph if does not exist
      graph_data.set(indicator, []);
    }

    var graphRecord = new GraphAssetData(ticker, indicator, color);
    // fetch values of indicator for the ticker specified
    graphRecord.data = await GetIndicatorValues(ticker, indicator);
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
      <h1>Graphs</h1>
      <GraphSelector
        onAdd={AddRecord}
        tickersList={tickers_list}
        indicatorsList={indicators_list}
      ></GraphSelector>
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
      {error !== "" && (
        <ErrorPopUp content={error} onClose={() => setError("")}></ErrorPopUp>
      )}
    </div>
  );
}
