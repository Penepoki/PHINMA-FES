import React, { useState } from "react";
import DashboardHeader from "../../../Components/Dashboard Components/Dashboard Header";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import YearCard from "../../../Components/Dashboard Components/Dean Components/Year Card";
import Clock from "../../../Components/Dashboard Components/Dean Components/Clock";

const PieChart = () => {
	const data = {
		labels: ["Red", "Blue", "Yellow"],
		datasets: [
			{
				label: "My First Dataset",
				data: [33, 33, 33],
				backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
				hoverBackgroundColor: ["#FF4365", "#2593D1", "#FFC130"],
			},
		],
	};

	const options = {
		responsive: true,
		maintainAspectRatio: false, // Important for flex containers!
	};

	return (
		<div className="flex h-full w-full flex-col items-center justify-center text-center">
			<h3 className="mb-2 text-lg sm:text-xl">Student Doing</h3>
			<div className="relative h-full w-full">
				<Pie data={data} options={options} />
			</div>
		</div>
	);
};

// Register chart components
ChartJS.register(ArcElement, Tooltip, Legend);

interface HomeProps {
	activeView: string;
	setActiveView: (view: string) => void;
}

const Home: React.FC<HomeProps> = ({ activeView, setActiveView }) => {
	console.log("Active View:", activeView); // Debugging line

	const yearData = [
		{
			year: "1st",
			ratio: "16/32",
		},
		{
			year: "2nd",
			ratio: "34/72",
		},
		{
			year: "3rd",
			ratio: "52/52",
		},
		{
			year: "4th",
			ratio: "11/12",
		},
	];

	const [currentIndex, setCurrentIndex] = useState(0);

	const prevCard = () => {
		setCurrentIndex((prev) =>
			prev === 0 ? yearData.length - 1 : prev - 1,
		);
	};

	const nextCard = () => {
		setCurrentIndex((prev) =>
			prev === yearData.length - 1 ? 0 : prev + 1,
		);
	};

	return (
		<div className="home-page z-10 flex h-full w-full flex-col items-center justify-center">
			<DashboardHeader />

			<p className="mt-18 mb-2 text-lg text-gray-300 sm:text-xl md:mb-6">
				Recently Evaluated Faculty:
			</p>

			<div
				onClick={() => setActiveView("evaluation")}
				className="flex h-1/3 w-full flex-row items-center justify-center shadow-2xl hover:scale-101 sm:h-[30vh]"
			>
				<div
					id="box1"
					className="flex h-full w-1/3 flex-col items-center justify-center rounded-l-xl p-5 backdrop-blur-lg backdrop-hue-rotate-100"
				>
					<div className="flex flex-col items-center">
						{" "}
						{/* Ensure vertical stacking */}
						<div className="avatar">
							<div className="w-24 rounded-full">
								<img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
							</div>
						</div>
						<div className="text-center md:mt-4">
							{" "}
							{/* Add spacing & center text */}
							<span className="text-3xl font-bold text-white">
								Dylan Smalls
							</span>
						</div>
					</div>
				</div>

				<div
					id="box2"
					className="h-full w-1/3 p-5 text-white backdrop-blur-lg backdrop-hue-rotate-300"
				>
					<PieChart />
				</div>
				<div
					id="box3"
					className="h-full w-1/3 rounded-r-xl p-5 text-white backdrop-blur-lg backdrop-hue-rotate-400"
				>
					<PieChart />
				</div>
			</div>

			<div className="mt-5 text-center">
				<Clock />
				{/* Desktop View (Grid) */}
				<div className="hidden flex-row items-center justify-center gap-6 md:flex">
					{yearData.map(({ year, ratio }) => (
						<YearCard
							key={year}
							year={year}
							ratio={ratio}
							setActiveView={setActiveView}
						/>
					))}
				</div>

				{/* Mobile View (Carousel) */}
				<div className="flex items-center justify-center gap-4 md:hidden">
					<button
						onClick={prevCard}
						className="text-primary rounded-full bg-white p-2"
					>
						◀
					</button>

					<YearCard
						year={yearData[currentIndex].year}
						ratio={yearData[currentIndex].ratio}
						setActiveView={setActiveView}
					/>

					<button
						onClick={nextCard}
						className="text-primary rounded-full bg-white p-2"
					>
						▶
					</button>
				</div>
			</div>
		</div>
	);
};

export default Home;
