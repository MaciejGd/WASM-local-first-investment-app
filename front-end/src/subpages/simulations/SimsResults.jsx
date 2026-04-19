import { SimsResultsPieChart } from "./SimsResultsPieChart.jsx";
import "./results/SimsResultsAssetsTable.jsx";
import SimsResultsAssetsPane from "./results/SimsResultsAssetsTable.jsx";
/// Here should be another table showing the results of run simulations
const PERCENTILE_SIZE = 9; // we wanna show the 9th percentile at most
const PERCENTILES = 3; // we have three results showing in percentiles


function SimResultsTableHeader() {
    return (
    <thead>
        <tr>
            <th>Category</th>
            <th>10th Percentile</th>
            <th>20th Percentile</th>
            <th>30th Percentile</th>
            <th>40th Percentile</th>
            <th>50th Percentile</th>
            <th>60th Percentile</th>
            <th>70th Percentile</th>
            <th>80th Percentile</th>
            <th>90th Percentile</th>
        </tr>
    </thead>
    );
}

function SimResultsTableBody({ results }) {
    if (!results) {
        return (<></>);
    }
    // const
    // what should be a data??? we probably needs some kind of object to be passed
    const category = [
        "Returns",
        "Max-Drawdowns",
        "Max-Upsides",
    ];
    const result_row_size = 9;
    const percentiles = [
        [], // Returns
        [], // Max-Drawdowns
        []  // Max-Upsides
    ];
    console.log(results);
    for (var i = 0; i < result_row_size * percentiles.length; i++) {
        if (i >= results.length) break;
        percentiles[Math.floor(i/9)].push(results[i]);
    }

    return (
    <tbody>
        {category.map((val, idx) => {
            return (
            <tr>
                <th>{val}</th>
                {
                    // show in precents of income
                    percentiles[idx].map((dat, i) => {
                        return (<td>{(dat*100).toFixed(2)}</td>);
                    })
                }
            </tr>
            );

        })}
    </tbody>
    );
}

function SimsResultsButtons({  }) {
    return (
        <div className="sims_results_buttons">
            <button>Save Sim</button>
            <button>Restore from saved</button>
        </div>
    );
}

function SimResultsTable({ results }) {
    return (
        <table>
            <SimResultsTableHeader/>
            <SimResultsTableBody results={results}/>
        </table>
    );
}


export default function SimsResults({ results, tickers, assets }) {
    if (!results || results.length === 0) {
        return (<></>);
    }
    // get all values from the specified index. These would be the CVaRs
    const cvars = results.slice(PERCENTILES * PERCENTILE_SIZE + 1);

    return (
        <>
        <h1>Simulation Results</h1>
        <div className="sims_results_pane">
            <SimsResultsButtons></SimsResultsButtons>
            <SimsResultsAssetsPane assets={assets}></SimsResultsAssetsPane>
            <SimResultsTable results={results}/>
            <div className="sims_results_container">                            
                <SimsResultsPieChart results={
                    {
                        tickers : tickers,
                        var: results[PERCENTILES * PERCENTILE_SIZE],
                        cvars: cvars,
                    }
                }></SimsResultsPieChart>
            </div>
        </div>
        </>
        // we do not want to plot all simulations run in here to the end-user
    );
}