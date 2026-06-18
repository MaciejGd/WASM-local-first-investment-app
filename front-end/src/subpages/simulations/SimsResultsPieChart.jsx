import { Pie } from "react-chartjs-2";

const OPTIONS = {
  plugins: {
    legend: {
      display: true,
      position: "right",
    },
  },
};

/**
 *
 * @param {object} payload object with stocks: list of stocks names, cvars: component vars of each stock, VAR value
 * @returns DATA ready for supply to the Pie object from chart-js2 lib
 */
function transformResultsToPieData(payload) {
  // set tickers
  const labels = payload.tickers;
  const cvars = payload.cvars;

  return {
    labels: labels,
    datasets: [
      {
        label: "Percentage share in risk:",
        data: cvars,
        backgroundColor: [
          "rgba(255, 99, 132, 0.2)",
          "rgba(54, 162, 235, 0.2)",
          "rgba(255, 206, 86, 0.2)",
          "rgba(75, 192, 192, 0.2)",
          "rgba(153, 102, 255, 0.2)",
          "rgba(255, 159, 64, 0.2)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };
}

export function SimsResultsPieChart({ results }) {
  var data = transformResultsToPieData(results);
  return (
    <div className="sims_results_pie_chart">
      <Pie data={data} options={OPTIONS} />
    </div>
  );
}
