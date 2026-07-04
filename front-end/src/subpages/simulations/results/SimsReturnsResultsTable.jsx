function SimResultsTableHeader() {
  return (
    <thead>
      <tr>
        <th><div className="table_header"><span>Category</span></div></th>
        <th><div className="table_header"><span>10th Percentile</span></div></th>
        <th><div className="table_header"><span>20th Percentile</span></div></th>
        <th><div className="table_header"><span>30th Percentile</span></div></th>
        <th><div className="table_header"><span>40th Percentile</span></div></th>
        <th><div className="table_header"><span>50th Percentile</span></div></th>
        <th><div className="table_header"><span>60th Percentile</span></div></th>
        <th><div className="table_header"><span>70th Percentile</span></div></th>
        <th><div className="table_header"><span>80th Percentile</span></div></th>
        <th><div className="table_header"><span>90th Percentile</span></div></th>
      </tr>
    </thead>
  );
}

function SimResultsTableBody({ results }) {
  if (!results) {
    return <></>;
  }
  // const
  // what should be a data??? we probably needs some kind of object to be passed
  const category = ["Returns", "Max-Drawdowns", "Max-Upsides"];
  const result_row_size = 9;
  const percentiles = [
    [], // Returns
    [], // Max-Drawdowns
    [], // Max-Upsides
  ];

  for (var i = 0; i < result_row_size * percentiles.length; i++) {
    if (i >= results.length) break;
    percentiles[Math.floor(i / 9)].push(results[i]);
  }

  return (
    <tbody>
      {category.map((val, idx) => {
        return (
          <tr key={idx}>
            <th>{val}</th>
            {
              // show in precents of income
              percentiles[idx].map((dat, i) => {
                return <td key={i}>{(dat * 100).toFixed(2)}</td>;
              })
            }
          </tr>
        );
      })}
    </tbody>
  );
}

export function SimResultsTable({ results }) {
  return (
      <table className="sims_table">
        <SimResultsTableHeader />
        <SimResultsTableBody results={results} />
      </table>
  );
}
