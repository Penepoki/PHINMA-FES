import { Pie } from "react-chartjs-2";
import {
	Chart as ChartJS,
	ArcElement,
	Tooltip,
	Legend,
	ChartOptions,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const pieData = {
	labels: ["Activity A", "Activity B", "Activity C"],
	datasets: [
		{
			label: "Teacher Activities",
			data: [12, 19, 3],
			backgroundColor: ["#36A2EB", "#FFCE56", "#FF6384"],
			borderWidth: 1,
		},
	],
};

const pieData2 = {
	labels: ["Engaged", "Distracted", "Group Work"],
	datasets: [
		{
			label: "Student Engagement",
			data: [20, 5, 10],
			backgroundColor: ["#4BC0C0", "#9966FF", "#FF9F40"],
			borderWidth: 1,
		},
	],
};

const pieOptions: ChartOptions<"pie"> = {
	responsive: true,
	plugins: {
		legend: {
			position: "bottom",
		},
	},
};

const PieChartWithTable = () => {
	return (
		<>
			<div className="flex w-full flex-col items-center gap-4 md:w-1/4">
				<h3 className="text-xl font-semibold text-white">
					Student Doing
				</h3>
				<Pie data={pieData} options={pieOptions} />
				<table className="table w-full border border-gray-600 text-center text-white">
					<thead className="bg-[#1c402a]/80 text-white">
						<tr>
							<th className="py-2">Student Actions</th>
							<th className="py-2">Tally</th>
						</tr>
					</thead>
					<tbody className="bg-black/30">
						<tr>
							<td>Listening</td>
							<td>12</td>
						</tr>
						<tr>
							<td>Group Work</td>
							<td>7</td>
						</tr>
						<tr>
							<td>Asking Questions</td>
							<td>5</td>
						</tr>
					</tbody>
				</table>
			</div>

			<div className="flex w-full flex-col items-center gap-4 md:w-1/4">
				<h3 className="text-xl font-semibold text-white">
					Teacher Doing
				</h3>
				<Pie data={pieData2} options={pieOptions} />
				<table className="table w-full border border-gray-600 text-center text-white">
					<thead className="bg-[#1c402a]/80 text-white">
						<tr>
							<th className="py-2">Teacher Actions</th>
							<th className="py-2">Tally</th>
						</tr>
					</thead>
					<tbody className="bg-black/30">
						<tr>
							<td>Lecturing</td>
							<td>15</td>
						</tr>
						<tr>
							<td>Demonstrating</td>
							<td>8</td>
						</tr>
						<tr>
							<td>Guiding</td>
							<td>10</td>
						</tr>
					</tbody>
				</table>
			</div>
		</>
	);
};

export default PieChartWithTable;
