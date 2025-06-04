import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useState, useEffect } from "react";

interface RecentlyEvaluatedProps {
	setActiveView?: (view: string) => void;
}

interface FacultyData {
	name: string;
	image: string;
	studentData: number[];
	teacherData: number[];
}

const FacultyPieChart = ({
	data,
	title,
}: {
	data: number[];
	title: string;
}) => {
	const chartData = {
		labels: ["Positive", "Neutral", "Negative"],
		datasets: [
			{
				label: title,
				data: data,
				backgroundColor: ["#4ade80", "#60a5fa", "#f87171"],
				hoverBackgroundColor: ["#22c55e", "#3b82f6", "#ef4444"],
			},
		],
	};

	const options = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				position: "top" as const,
			},
			title: {
				display: true,
				text: title,
				font: {
					size: 14,
				},
			},
		},
	};

	return (
		<div className="relative h-full w-full">
			<Pie data={chartData} options={options} />
		</div>
	);
};

ChartJS.register(ArcElement, Tooltip, Legend);

const RecentlyEvaluatedFaculty: React.FC<RecentlyEvaluatedProps> = ({
	setActiveView,
}) => {
	const [currentIndex, setCurrentIndex] = useState(0);

	const facultyData: FacultyData[] = [
		{
			name: "Dylan Smalls",
			image: "https://randomuser.me/api/portraits/men/1.jpg",
			studentData: [45, 30, 25],
			teacherData: [60, 20, 20],
		},
		{
			name: "Alex Johnson",
			image: "https://randomuser.me/api/portraits/women/44.jpg",
			studentData: [50, 25, 25],
			teacherData: [70, 15, 15],
		},
		{
			name: "Sam Wilson",
			image: "https://randomuser.me/api/portraits/men/32.jpg",
			studentData: [40, 35, 25],
			teacherData: [65, 20, 15],
		},
	];

	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentIndex((prev) => (prev + 1) % facultyData.length);
		}, 5000);

		return () => clearInterval(interval);
	}, []);

	const currentFaculty = facultyData[currentIndex];

	return (
		<>
			<p className="mt-35 mb-2 text-lg text-gray-300 sm:text-xl md:mb-6">
				Recently Evaluated Faculty:
			</p>
			<div
				className="tooltip tooltip-top flex w-full flex-col items-center justify-center"
				data-tip="Click to view evaluation page"
			>
				<div
					onClick={() => setActiveView && setActiveView("evaluation")}
					className="float-breathe flex h-1/3 w-full flex-row items-center justify-center shadow-2xl hover:scale-101 sm:h-[30vh]"
				>
					{/* Box 1 - Faculty Info */}
					<div className="flex h-full w-1/3 flex-col items-center justify-center rounded-l-xl p-5 backdrop-blur-lg backdrop-hue-rotate-100">
						<div className="flex h-full w-full flex-col items-center justify-center">
							<div className="avatar">
								<div className="w-24 rounded-full">
									<img
										src={currentFaculty.image}
										alt={currentFaculty.name}
									/>
								</div>
							</div>
							<div className="text-center md:mt-4">
								<span className="text-3xl font-bold text-white">
									{currentFaculty.name}
								</span>
							</div>
						</div>
					</div>

					{/* Box 2 - Student Feedback */}
					<div className="h-full w-1/3 p-5 text-white backdrop-blur-lg backdrop-hue-rotate-300">
						<FacultyPieChart
							data={currentFaculty.studentData}
							title="Student Feedback"
						/>
					</div>

					{/* Box 3 - Teacher Feedback */}
					<div className="h-full w-1/3 rounded-r-xl p-5 text-white backdrop-blur-lg backdrop-hue-rotate-400">
						<FacultyPieChart
							data={currentFaculty.teacherData}
							title="Teacher Feedback"
						/>
					</div>
				</div>
			</div>
		</>
	);
};

export default RecentlyEvaluatedFaculty;
