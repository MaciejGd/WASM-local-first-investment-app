import { useState } from "react";
import { PieChart } from "./PieAssetChart.jsx";

// Should show table with: Ticker -> Total investment cost -> percent of investment
// and cricle graph chart at the right with percentages of each investments

function AssetTableHeader() {
    return (
        <thead>
        <tr>
            <th >
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
                <div className='table_header'>
                    <span>Percentage</span>
                    {/* <AssetsTableSortButtons onSortUp={onSortUp} onSortDown={onSortDown} columnName={"price"}/> */}
                </div>
            </th>
        </tr>
        </thead>
    );
}

function AssetTableBody({ assets }) {
    console.log(assets);
    return (
        <tbody>
            {
                assets.map(([ticker, price, percent], index)=> {
                    return <AssetRow key={index} ticker={ticker} price={price} percent={percent}/>
                })
            
            }
            {/* <AssetRow ticker={"Test"} price="3.1" percent="100%"></AssetRow>
            <AssetRow ticker={"LPP.WA"} price="213.2" percent="10%"></AssetRow>
            <AssetRow ticker={"Test"} price="3.1" percent="100%"></AssetRow>
            <AssetRow ticker={"LPP.WA"} price="213.2" percent="10%"></AssetRow>
            <AssetRow ticker={"Test"} price="3.1" percent="100%"></AssetRow>
            <AssetRow ticker={"LPP.WA"} price="213.2" percent="10%"></AssetRow>
            <AssetRow ticker={"Test"} price="3.1" percent="100%"></AssetRow>
            <AssetRow ticker={"LPP.WA"} price="213.2" percent="10%"></AssetRow>
            <AssetRow ticker={"Test"} price="3.1" percent="100%"></AssetRow>
            <AssetRow ticker={"LPP.WA"} price="213.2" percent="10%"></AssetRow>
            <AssetRow ticker={"Test"} price="3.1" percent="100%"></AssetRow>
            <AssetRow ticker={"LPP.WA"} price="213.2" percent="10%"></AssetRow>
            <AssetRow ticker={"Test"} price="3.1" percent="100%"></AssetRow>
            <AssetRow ticker={"LPP.WA"} price="213.2" percent="10%"></AssetRow>
            <AssetRow ticker={"Test"} price="3.1" percent="100%"></AssetRow>
            <AssetRow ticker={"LPP.WA"} price="213.2" percent="10%"></AssetRow> */}
        </tbody>
    );
}

function AssetTable({assets}) {
    return (
        <div className="sims_table_container">
            <table className="sims_asset_table">
                <AssetTableHeader/>
                <AssetTableBody assets={assets}/>
            </table>
        </div>
    );
}

function AssetRow({ ticker, price, percent }) {
    return (
        <tr className="sims_asset_row">
            <td>{ticker}</td>
            <td>{price}</td>
            <td>{percent}</td>
        </tr>
    );
}


export default function AssetsPane({ assets }) {
    return (
        <div className="sims_middle_pane">
            <AssetTable assets={assets}></AssetTable>
            <PieChart></PieChart>
        </div>
    );
}