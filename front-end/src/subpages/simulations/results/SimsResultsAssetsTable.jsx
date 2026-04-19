import { SimsAssetsPieChart } from "../SimsAssetsPieChart.jsx";

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

/// Add assets as rows to the table
function AssetTableBody({ assets }) {
    return (
        <tbody>
            {
                assets.map(([_, data], index)=> {
                    return <AssetRow key={index} 
                                    ticker={data.ticker} 
                                    price={data.price} 
                                    percent={data.percent}
                            />
                })
            }
        </tbody>
    );
}

function AssetTable({ assets }) {
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


export default function SimsResultsAssetsPane({ assets }) {
    return (
        <div className="sims_middle_pane">
            <AssetTable assets={assets}></AssetTable>
            <SimsAssetsPieChart assets={assets}></SimsAssetsPieChart>
        </div>
    );
}