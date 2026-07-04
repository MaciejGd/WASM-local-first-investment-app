import { useState } from "react";
import { SimsAssetsPieChart } from "./SimsAssetsPieChart.jsx";

// Should show table with: Ticker -> Total investment cost -> percent of investment
// and cricle graph chart at the right with percentages of each investments

function AssetTableHeader() {
  return (
    <thead>
      <tr>
        <th>
          <div className="table_header">
            <span>Ticker</span>
            {/* <AssetsTableSortButtons onSortUp={onSortUp} onSortDown={onSortDown} columnName={"ticker"} /> */}
          </div>
        </th>
        <th>
          <div className="table_header">
            <span>Price</span>
            {/* <AssetsTableSortButtons onSortUp={onSortUp} onSortDown={onSortDown} columnName={"quantity"}/> */}
          </div>
        </th>
        <th>
          <div className="table_header">
            <span>Percentage</span>
            {/* <AssetsTableSortButtons onSortUp={onSortUp} onSortDown={onSortDown} columnName={"price"}/> */}
          </div>
        </th>
      </tr>
    </thead>
  );
}

/// Add assets as rows to the table
function AssetTableBody({ assets, onSelectCb }) {
  return (
    <tbody>
      {assets.map(([_, data], index) => {
        return (
          <AssetRow
            key={index}
            ticker={data.ticker}
            price={data.price}
            percent={data.percent}
            selected={data.selected}
            onSelectCb={onSelectCb}
          />
        );
      })}
    </tbody>
  );
}

function AssetTable({ assets, onSelectCb }) {
  return (
    <div className="sims_table_container">
      <table className="sims_table">
        <AssetTableHeader />
        <AssetTableBody assets={assets} onSelectCb={onSelectCb} />
      </table>
    </div>
  );
}

function AssetRow({ ticker, price, percent, selected, onSelectCb }) {
  return (
    <tr className="sims_asset_row">
      <td>
        <div>
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => onSelectCb(ticker, e.target.checked)}
          ></input>
          <span>{ticker}</span>
        </div>
      </td>
      {/* <td>{ticker}</td> */}
      <td>{price}</td>
      <td>{percent}</td>
    </tr>
  );
}

export default function AssetsPane({ assets, onSelectCb }) {
  return (
    <div className="sims_middle_pane">
      <AssetTable assets={assets} onSelectCb={onSelectCb}></AssetTable>
      <SimsAssetsPieChart assets={assets}></SimsAssetsPieChart>
    </div>
  );
}
