import { useState } from "react";

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

function AssetTableBody() {
    return (
        <tbody>
            <AssetRow ticker={"Test"} price="3.1" percent="100%"></AssetRow>
            <AssetRow ticker={"LPP.WA"} price="213.2" percent="10%"></AssetRow>
        </tbody>
    );
}

function AssetTable() {
    return (
        <table className="modern-table">
            <AssetTableHeader/>
            <AssetTableBody/>
        </table>
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


export default function AssetsPane() {
    return (
        <div className="sims_middle_pane">
            <AssetTable></AssetTable>
        </div>
    );
}