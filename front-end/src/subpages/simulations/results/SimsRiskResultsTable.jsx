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
    <table>
      <TableHeader></TableHeader>
      <TableBody tickers={tickers} VaR={VaR} cvars={cvars}></TableBody>
    </table>
  );
}
