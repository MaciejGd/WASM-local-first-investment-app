import { SimsResultsPieChart } from "../SimsResultsPieChart";

function TableHeader() {
  return (
    <thead>
      <tr>
        <th>Asset</th>
        <th>Risk participation [%]</th>
      </tr>
    </thead>
  );
}

function TableRow({ ticker, cvar }) {
  return (
    <tr>
      <th>{ticker}</th>
      <td>{cvar}</td>
    </tr>
  );
}

function TableBody({ tickers, VaR, cvars }) {
  return (
    <tbody>
      {tickers.map((el, idx) => {
        return <TableRow ticker={el} cvar={cvars[idx]} key={idx}></TableRow>;
      })}
      <tr>
        <th>{`Value at Risk at 95%: ${VaR}%`}</th>
      </tr>
    </tbody>
  );
}

export function SimRiskResultsTable({ tickers, VaR, cvars }) {
  return (
    <table className="sims_table">
      <TableHeader></TableHeader>
      <TableBody tickers={tickers} VaR={VaR} cvars={cvars}></TableBody>
    </table>
  );
}

function SimsResultsRiskDescription() {
  return (
    <div className="sims_results_section_desc">
      <span className="sims_results_desc_span">{"Risk analysis"}</span>
    </div>
  );
}

export function SimResultsRiskPane({ tickers, VaR, cvars }) {
  return (
    <>
      <SimsResultsRiskDescription></SimsResultsRiskDescription>
      <div className="sims_results_risk_container">
        <SimRiskResultsTable
          tickers={tickers}
          VaR={VaR}
          cvars={cvars}
        ></SimRiskResultsTable>
        <SimsResultsPieChart
          results={{
            tickers: tickers,
            VaR: VaR,
            cvars: cvars,
          }}
        ></SimsResultsPieChart>
      </div>
    </>
  );
}
