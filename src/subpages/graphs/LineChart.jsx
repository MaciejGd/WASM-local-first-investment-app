import { Line } from "react-chartjs-2";
import "../../styling/graphs.css"

export default function LineChart({chartData}) {
    return (
    <div className="graph_line_chart">
        <Line
            data={chartData}
            options={{
                responsive: true,
                plugins: {
                    legend: {
                        display: true,
                        position: "left",
                        align: "start",
                    }
                },
                scales: {
                    y: {
                        position: "right",
                        ticks: {
                            beginAtZero: true,
                        }
                    }
                }
            }}
        />
    </div>);
}