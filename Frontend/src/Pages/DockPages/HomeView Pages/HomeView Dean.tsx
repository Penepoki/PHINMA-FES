import React, { useState } from "react";
import DashboardHeader from "../../../Components/Dashboard Components/Dashboard Header";
import YearCard from "../../../Components/Dashboard Components/Dean Components/Year Card";
import Clock from "../../../Components/Dashboard Components/Dean Components/Clock";
import RecentlyEvaluatedFaculty from "../../../Components/Dashboard Components/Dean Components/Recently Evaluated";

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

			{/*Recently Evaluated*/}

			<RecentlyEvaluatedFaculty setActiveView={setActiveView} />

			<div className="mt-5 text-center">
				<Clock />
				{/* Desktop View (Grid) */}
				<div className="float-breathe hidden flex-row items-center justify-center gap-6 md:flex">
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
