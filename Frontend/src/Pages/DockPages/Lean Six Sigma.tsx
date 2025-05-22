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
			<div className="mt-6 flex h-full w-full flex-col gap-6 px-6">
				<div className="flex h-full w-full flex-col rounded-lg shadow-2xl">
					<div className="stats border-b border-b-gray-600 bg-[#1c402a]/20">
						<div className="stat">
							<div className="stat-figure">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									className="inline-block h-12 w-12 stroke-current text-white"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
									></path>
								</svg>
							</div>
							<div className="stat-title text-white">
								Interactions
							</div>
							<div className="stat-value">7</div>
						</div>

						<div className="stat">
							<div className="stat-figure">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									className="inline-block h-12 w-12 stroke-current text-white"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
									></path>
								</svg>
							</div>
							<div className="stat-title text-white">
								Low Effort
							</div>
							<div className="stat-value">0 of 10</div>
						</div>

						<div className="stat">
							<div className="stat-figure">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									className="inline-block h-12 w-12 stroke-current text-white"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
									></path>
								</svg>
							</div>
							<div className="stat-title text-white">
								Resolution
							</div>
							<div className="stat-value">0%</div>
						</div>

						<div className="stat">
							<div className="stat-figure">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									className="inline-block h-12 w-12 stroke-current text-white"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
									></path>
								</svg>
							</div>
							<div className="stat-title text-white">
								Fatal Accuracy
							</div>
							<div className="stat-value">100%</div>
						</div>
					</div>
					<div className="stats bg-[#1b2e3e]/20">
						<div className="stat">
							<div className="stat-figure">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									className="inline-block h-12 w-12 stroke-current text-white"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
									></path>
								</svg>
							</div>
							<div className="stat-title text-white">
								Sentiment
							</div>
							<div className="stat-value">-0.7</div>
						</div>

						<div className="stat">
							<div className="stat-figure">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									className="inline-block h-12 w-12 stroke-current text-white"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
									></path>
								</svg>
							</div>
							<div className="stat-title text-white">
								Brand Love
							</div>
							<div className="stat-value">1 of 10</div>
						</div>

						<div className="stat">
							<div className="stat-figure">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									className="inline-block h-12 w-12 stroke-current text-white"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
									></path>
								</svg>
							</div>
							<div className="stat-title text-white">
								Agent Love
							</div>
							<div className="stat-value">9 of 10</div>
						</div>

						<div className="stat">
							<div className="stat-figure">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									className="inline-block h-12 w-12 stroke-current text-white"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
									></path>
								</svg>
							</div>
							<div className="stat-title text-white">
								QA Score
							</div>
							<div className="stat-value">55.00%</div>
						</div>
					</div>
				</div>

				<div className="flex h-1/2 flex-row gap-6">
					<div className="flex w-1/2 flex-col items-start justify-start rounded-lg p-6 shadow-2xl backdrop-blur-lg">
						<span className="text-xl font-bold text-white">
							Intent:
						</span>
						<span className="text-lg text-gray-400">
							Lorem ipsum dolor sit amet, consectetur adipiscing
							elit, sed do eiusmod tempor incididunt ut labore et
							dolore magna aliqua.
						</span>
					</div>
					<div className="flex w-1/2 flex-col items-start justify-start rounded-lg p-6 shadow-2xl backdrop-blur-lg">
						<span className="text-xl font-bold text-white">
							Action:
						</span>
						<span className="text-lg text-gray-400">
							Lorem ipsum dolor sit amet, consectetur adipiscing
							elit, sed do eiusmod tempor incididunt ut labore et
							dolore magna aliqua.
						</span>
					</div>
				</div>
				<div className="flex h-1/2 w-full items-center justify-center rounded-lg p-4 shadow-2xl backdrop-blur-lg">
					<Bar data={barData} options={barOptions} />
				</div>
			</div>
		</div>
	);
}

export default LeanSixSigma;
