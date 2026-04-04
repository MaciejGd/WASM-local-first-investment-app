

/// Here should be another table showing the results of run simulations


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
    for (var i = 0; i < 27; i++) {
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

function SimResultsTable({ results }) {
    if (!results || results.length === 0) {
        return (<></>);
    }
    return (
        <table>
            <SimResultsTableHeader/>
            <SimResultsTableBody results={results}/>
        </table>
    );
}


export default function SimsResults({ results }) {
    return (
        <SimResultsTable results={results}/>
        // we do not want to plot all simulations run in here to the end-user
    );
}