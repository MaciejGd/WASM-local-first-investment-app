import { SimsResultsPieChart } from "./SimsResultsPieChart.jsx";
import "./results/SimsResultsAssetsTable.jsx";
import SimsResultsAssetsPane from "./results/SimsResultsAssetsTable.jsx";
import { SimResultsTable } from "./results/SimsReturnsResultsTable.jsx";
import { SimRiskResultsTable } from "./results/SimsRiskResultsTable.jsx";
import { useState } from "react";
import { IndexedDbHandler } from "../../db/DbDataTables.js"; // indexed db instance 
/// Here should be another table showing the results of run simulations
const PERCENTILE_SIZE = 9; // we wanna show the 9th percentile at most
const PERCENTILES = 3; // we have three results showing in percentiles


function SimsResultsButtons({ saveSim }) {
    return (
        <div className="sims_results_buttons">
            <button className="sims_results_button" onClick={saveSim}>Save Sim</button>
            <button className="sims_results_button">Restore from saved</button>
        </div>
    );
}

function SimsResultsDescription({ header }) {
    return (
        <div className="sims_results_section_desc">
            <span className="sims_results_desc_span">{"Simulated returns"}</span>
        </div>
    );
}

function SimsResultsAssetsDescription({ sims, timepoints, date }) {
    return (
        <div className="sims_results_section_desc">
            <span className="sims_results_desc_span">{"Simulation details"}</span>
            <span className="sims_results_desc_span">{`Date of simulation: ${date.toDateString()}`}</span>
            <span className="sims_results_desc_span">{`Number of simulations run: ${sims}`}</span>
            <span className="sims_results_desc_span">{`Number of timepoints simulated: ${timepoints}`}</span>
        </div>
    );
}

function SimsResultsRiskDescription() {
    return (
        <div className="sims_results_section_desc">
            <span className="sims_results_desc_span">{"Risk analysis"}</span>
        </div>
    )
}

export default function SimsResults({ results, tickers, assets, date, sims, timepoints }) {
    const [db_instance, setDbInstance] = useState(new IndexedDbHandler());

    if (!results || results.length === 0) {
        return (<></>);
    }

    async function AddToHistory() {
        try {
            await db_instance.addSimsHistory({
                results: results,
                tickers: tickers,
                assets: assets,
                date: date,
                sims: sims,
                timepoints: timepoints
            });
        }
        catch (error) {
            console.error(error);
        }
    }

    // get all values from the specified index. These would be the CVaRs
    const cvarsArr = results.slice(PERCENTILES * PERCENTILE_SIZE + 1);
    const VaR = (results[PERCENTILES * PERCENTILE_SIZE] * 100).toFixed(2); // Value at risk in percentages

    // count percentage usage of cvars in overall risk
    const cvars_sum = cvarsArr.reduce((a, b) => { return a + b; }, 0);
    // throw divide by zero exception
    if (cvars_sum === 0) {
        throw new Error("Sum of the array should not be equal to 0!!!");
    }
    const cvars = cvarsArr.map((el) => { return ((el / cvars_sum) * 100).toFixed(2); });

    return (
        <>
        <h2>Simulation Results</h2>
        <div className="sims_results_pane">
            <SimsResultsButtons saveSim={AddToHistory}></SimsResultsButtons>
            <SimsResultsAssetsDescription
                date={date}
                sims={sims}
                timepoints={timepoints}>
            </SimsResultsAssetsDescription>
            <SimsResultsAssetsPane assets={assets}></SimsResultsAssetsPane>
            <SimsResultsDescription></SimsResultsDescription>
            <SimResultsTable results={results}/>
            <SimsResultsRiskDescription></SimsResultsRiskDescription>
            <div className="sims_results_risk_container">
                <SimRiskResultsTable tickers={tickers} VaR={VaR} cvars={cvars}></SimRiskResultsTable>
                <SimsResultsPieChart results={
                    {
                        tickers : tickers,
                        VaR: VaR,
                        cvars: cvars,
                    }
                }></SimsResultsPieChart>
            </div>
        </div>
        </>
        // we do not want to plot all simulations run in here to the end-user
    );
}