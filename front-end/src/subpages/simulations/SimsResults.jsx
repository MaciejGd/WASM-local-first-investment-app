

/// Here should be another table showing the results of run simulations


function SimResultsTableHeader() {
    return (
    <thead>
        <tr>
            <th>Category</th>
            <th>10th Percentile</th>
            <th>25th Percentile</th>
            <th>50th Percentile</th>
            <th>75th Percentile</th>
            <th>90th Percentile</th>
        </tr>
    </thead>
    );
}

function SimResultsTableBody() {
    // const
    const data = [
        [10.9, 124.1, 43.5, 23, 76],
        [1.9, 81.9, 85, 121, 234],
        [2, 1.24, 43.5, 23, 11],
        [10.9, 124.1, 43.5, 23, 101],
    ];
    const category = [
        "Annual return",
        "Test return",
        "What next sim",
        "Weekly changes"
    ];

    return (
    <tbody>
        {category.map((val, idx) => {
            return (
            <tr>
                <th>{val}</th>
                {
                    data[idx].map((dat, idx) => {
                        return (<td>{dat}</td>);
                    })
                }
            </tr>
            );
            
        })}
    </tbody>
    );
}

function SimResultsTable() {
    return (
        <table>
            <SimResultsTableHeader/>
            <SimResultsTableBody/>
        </table>
    );
}


export default function SimsResults() {
    return (
        <SimResultsTable/>
    );
}