import { Pie } from "react-chartjs-2";

const options = {
  plugins: {
    legend: {
      display: false,
    },
  },
};

function transformAssetsToPieData(assets) {
  const labels = assets.map(([ticker]) => {
    return ticker;
  });
  const prices = assets.map(([, data]) => {
    return data.price;
  });
  const offsets = assets.map(([, data]) => {
    return 50 - data.percent;
  });
  console.log(offsets);
  if (labels.length == 0) {
    return {
      labels: ["No data"],
      datasets: [
        {
          data: [1],
          backgroundColor: ["rgba(255, 99, 132, 0.2)"],
          borderColor: ["rgba(255, 99, 132, 1)"],
          borderWidth: 1,
        },
      ],
    };
  }

  return {
    labels: labels,
    datasets: [
      {
        label: "Invested amount",
        data: prices,
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
        offset: offsets,
        borderWidth: 1,
      },
    ],
  };
}

export function SimsAssetsPieChart({ assets }) {
  var data = transformAssetsToPieData(assets);
  return (
    <div className="sims_pie_chart">
      <Pie data={data} options={options} />
    </div>
  );
}
