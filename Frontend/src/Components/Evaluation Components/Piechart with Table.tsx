import { Pie } from "react-chartjs-2";
import {
	Chart as ChartJS,
	ArcElement,
	Tooltip,
	Legend,
	ChartOptions,
} from "chart.js";
import { ActivityData } from "./Copus Matrix";

ChartJS.register(ArcElement, Tooltip, Legend);

interface PieChartProps {
	studentTallies: Record<string, ActivityData>;
	teacherTallies: Record<string, ActivityData>;
}

const PieChartWithTable = ({
	studentTallies,
	teacherTallies,
}: PieChartProps) => {
	// Transform student data for chart
	const studentPieData = {
		labels: Object.keys(studentTallies),
		datasets: [
			{
				label: "Student Activities",
				data: Object.values(studentTallies).map((item) => item.count),
				backgroundColor: [
					"#36A2EB",
					"#FFCE56",
					"#FF6384",
					"#4BC0C0",
					"#9966FF",
					"#FF9F40",
					"#8AC249",
					"#EA5545",
					"#F46A9B",
					"#EF9B20",
				],
				borderWidth: 1,
			},
		],
	};

	// Transform teacher data for chart
	const teacherPieData = {
		labels: Object.keys(teacherTallies),
		datasets: [
			{
				label: "Teacher Activities",
				data: Object.values(teacherTallies).map((item) => item.count),
				backgroundColor: [
					"#B3EFFF",
					"#00C6FF",
					"#0072FF",
					"#D4FF00",
					"#A3FF00",
					"#73FF00",
					"#FFD300",
					"#FF9500",
					"#FF6200",
					"#FF2D00",
					"#FF006A",
				],
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

	return (
		<div className="flex flex-col justify-center gap-8 md:flex-row">
			<div className="flex w-full flex-col items-center gap-4 md:w-1/2">
				<h3 className="text-xl font-semibold text-white">
					Student Doing
				</h3>
				<div className="w-full max-w-xs">
					<Pie data={studentPieData} options={pieOptions} />
				</div>
				<table className="table w-full max-w-md border border-gray-600 text-center text-white">
					<thead className="bg-[#1c402a]/80 text-white">
						<tr>
							<th className="py-2">Student Actions</th>
							<th className="py-2">Count</th>
							<th className="py-2">Percentage</th>
						</tr>
					</thead>
					<tbody className="bg-black/30">
						{Object.entries(studentTallies).map(
							([activity, data]) => (
								<tr key={activity}>
									<td className="py-1">{activity}</td>
									<td className="py-1">{data.count}</td>
									<td className="py-1">
										{data.percentage.toFixed(1)}%
									</td>
								</tr>
							),
						)}
					</tbody>
				</table>
			</div>

			<div className="flex w-full flex-col items-center gap-4 md:w-1/2">
				<h3 className="text-xl font-semibold text-white">
					Teacher Doing
				</h3>
				<div className="w-full max-w-xs">
					<Pie data={teacherPieData} options={pieOptions} />
				</div>
				<table className="table w-full max-w-md border border-gray-600 text-center text-white">
					<thead className="bg-[#1c402a]/80 text-white">
						<tr>
							<th className="py-2">Teacher Actions</th>
							<th className="py-2">Count</th>
							<th className="py-2">Percentage</th>
						</tr>
					</thead>
					<tbody className="bg-black/30">
						{Object.entries(teacherTallies).map(
							([activity, data]) => (
								<tr key={activity}>
									<td className="py-1">{activity}</td>
									<td className="py-1">{data.count}</td>
									<td className="py-1">
										{data.percentage.toFixed(1)}%
									</td>
								</tr>
							),
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default PieChartWithTable;
