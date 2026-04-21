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
            <tr key={idx}>
                <th>{val}</th>
                {
                    // show in precents of income
                    percentiles[idx].map((dat, i) => {
                        return (<td key={i}>{(dat*100).toFixed(2)}</td>);
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
        <div className="sims_results_table">
            <table style={{ background: "white", width: "80%", paddingLeft: "2rem" }}>
                <SimResultsTableHeader/>
                <SimResultsTableBody results={results}/>
            </table>
        </div>
    );
}