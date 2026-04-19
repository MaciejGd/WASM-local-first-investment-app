import { Pie } from 'react-chartjs-2';

const OPTIONS = {
    plugins: {
        legend : {
            display: true,
            position: "right",
        }
    }

};

/**
 * 
 * @param {object} payload object with stocks: list of stocks names, cvars: component vars of each stock, VAR value
 * @returns DATA ready for supply to the Pie object from chart-js2 lib
 */
function transformResultsToPieData(payload) {
    // set tickers
    const labels = payload.tickers;
    // set percentage of CVARs
    const arr_sum = payload.cvars.reduce((a, b) => { return a + b; }, 0);
    // throw divide by zero exception
    if (arr_sum === 0) {
        throw new Error("Sum of the array should not be equal to 0!!!");
    }
    const vcars = payload.cvars.map((el) => { return (el / arr_sum) * 100; }); 

    return {
        labels: labels,
        datasets: [
        {
            label: 'Percentage share in risk:',
            data: vcars,
            backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(255, 159, 64, 0.2)',
            ],
            borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
            ],
            borderWidth: 1,
        },
        ],
    }
}

export function SimsResultsPieChart({ results }) {
    console.log("test");
    var data = transformResultsToPieData(results);
    return (
        <div className="sims_results_pie_chart">
            <Pie data={data} options={OPTIONS}/>
        </div>
    )
}

