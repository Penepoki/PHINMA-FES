import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { LineElement, PointElement, LineController } from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
	LineElement,
	PointElement,
	LineController,
);

ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
);
interface ResourceGroupProps {
	setActiveView: (view: string) => void;
}

function LeanSixSigma({ setActiveView }: ResourceGroupProps) {
	const barData = {
		labels: ["Quality", "Efficiency", "Accuracy", "Speed", "Satisfaction"],
		datasets: [
			{
				label: "Evaluation Score",
				data: [65, 59, 80, 81, 56],
				backgroundColor: [
					"rgba(20, 83, 45)",
					"rgba(22, 101, 52)",
					"rgba(30, 64, 175)",
					"rgba(14, 116, 144)",
					"rgba(51, 65, 85)",
				],
				borderRadius: 8,
				barPercentage: 0.6,
			},
		],
	};

	const barOptions = {
		responsive: true,
		plugins: {
			legend: {
				labels: {
					color: "#fff", // white text for dark bg
				},
			},
			title: {
				display: true,
				text: "Lean Six Sigma Metrics",
				color: "#fff",
			},
		},
		scales: {
			x: {
				ticks: {
					color: "#fff",
				},
				grid: {
					color: "rgba(255,255,255,0.1)",
				},
			},
			y: {
				ticks: {
					color: "#fff",
				},
				grid: {
					color: "rgba(255,255,255,0.1)",
				},
			},
		},
	};

	const lineData = {
		labels: ["January", "February", "March", "April", "May"],
		datasets: [
			{
				label: "Performance Over Time",
				data: [60, 70, 75, 80, 90],
				fill: false,
				borderColor: "rgba(59,130,246,1)",
				backgroundColor: "rgba(59,130,246,0.5)",
				tension: 0.3,
			},
		],
	};

	const lineOptions = {
		responsive: true,
		plugins: {
			legend: {
				labels: {
					color: "#fff",
				},
			},
			title: {
				display: true,
				text: "Trend Analysis",
				color: "#fff",
			},
		},
		scales: {
			x: {
				ticks: {
					color: "#fff",
				},
				grid: {
					color: "rgba(255,255,255,0.1)",
				},
			},
			y: {
				ticks: {
					color: "#fff",
				},
				grid: {
					color: "rgba(255,255,255,0.1)",
				},
			},
		},
	};

	return (
		<div className="custom-container">
			{/* Breadcrumbs */}
			<div className="breadcrumbs">
				<ul>
					<li>
						<a onClick={() => setActiveView("home")}>Home</a>
					</li>
					<li>Resource Group</li>
				</ul>
			</div>
			<h2 className="mt-4 text-3xl font-bold text-white">
				Lean Six Sigma Statistics
			</h2>
			<div className="mt-4 flex w-full flex-row items-center justify-center gap-4 text-white">
				Filter:
				<button className="btn">College</button>
				<button className="btn">Semester</button>
				<button className="btn">School Year</button>
			</div>
			<div className="mt-6 flex h-full w-full flex-col gap-6 px-6">
				<div className="stats bg-[#1c402a]/20 shadow-2xl">
					<div className="stat">
						<div className="stat-figure text-secondary">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								className="inline-block h-8 w-8 stroke-current"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								></path>
							</svg>
						</div>
						<div className="stat-title">Downloads</div>
						<div className="stat-value">31K</div>
					</div>

					<div className="stat">
						<div className="stat-figure text-secondary">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								className="inline-block h-8 w-8 stroke-current"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
								></path>
							</svg>
						</div>
						<div className="stat-title">New Users</div>
						<div className="stat-value">4,200</div>
					</div>

					<div className="stat">
						<div className="stat-figure text-secondary">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								className="inline-block h-8 w-8 stroke-current"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
								></path>
							</svg>
						</div>
						<div className="stat-title">New Registers</div>
						<div className="stat-value">1,200</div>
					</div>
				</div>
				<div className="flex flex-row items-center justify-center gap-4 text-white">
					Observation Summary
					<button className="btn btn-primary w-auto">
						Filter All
					</button>
				</div>
				<div className="flex h-1/5 flex-row gap-6">
					<div className="flex h-full w-1/2 flex-col items-start justify-start overflow-y-auto rounded-lg p-6 shadow-2xl backdrop-blur-lg">
						<table className="mt-2 w-full text-left text-gray-400">
							<thead>
								<tr>
									<th className="px-4 py-2">Code</th>
									<th className="px-4 py-2">Count</th>
									<th className="px-4 py-2">Summary</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td className="px-4 py-2">Ind</td>
									<td className="px-4 py-2">10</td>
									<td className="px-4 py-2">
										Individual Tasks
									</td>
								</tr>
								<tr>
									<td className="px-4 py-2">Grp</td>
									<td className="px-4 py-2">42</td>
									<td className="px-4 py-2">
										Working with a group
									</td>
								</tr>
								<tr>
									<td className="px-4 py-2">AnQ</td>
									<td className="px-4 py-2">20</td>
									<td className="px-4 py-2">
										Student Answering a Question
									</td>
								</tr>
							</tbody>
						</table>
					</div>

					<div className="flex h-full w-1/2 flex-col items-start justify-start overflow-y-auto rounded-lg p-6 shadow-2xl backdrop-blur-lg">
						<table className="mt-2 w-full text-left text-gray-400">
							<thead>
								<tr>
									<th className="px-4 py-2">Code</th>
									<th className="px-4 py-2">Count</th>
									<th className="px-4 py-2">Summary</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td className="px-4 py-2">Ind</td>
									<td className="px-4 py-2">10</td>
									<td className="px-4 py-2">
										Individual Tasks
									</td>
								</tr>
								<tr>
									<td className="px-4 py-2">Grp</td>
									<td className="px-4 py-2">42</td>
									<td className="px-4 py-2">
										Working with a group
									</td>
								</tr>
								<tr>
									<td className="px-4 py-2">AnQ</td>
									<td className="px-4 py-2">20</td>
									<td className="px-4 py-2">
										Student Answering a Question
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
				<div className="flex h-full w-full flex-row items-center justify-center gap-6 rounded-lg shadow-2xl backdrop-blur-lg">
					<div className="h-full w-1/3">
						<Bar data={barData} options={barOptions} />
					</div>
					<div className="h-full w-1/3">
						<Bar data={barData} options={barOptions} />
					</div>
					<div className="h-full w-1/3">
						<Bar data={barData} options={barOptions} />
					</div>
				</div>
				{/* <div className="mt-6 flex w-full items-center justify-center rounded-lg p-4 shadow-2xl backdrop-blur-lg">
					<div className="w-full">
						<Line data={lineData} options={lineOptions} />
					</div>
				</div> */}
			</div>
		</div>
	);
}

export default LeanSixSigma;
