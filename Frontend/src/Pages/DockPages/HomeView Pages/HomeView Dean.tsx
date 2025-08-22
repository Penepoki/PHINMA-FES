import React, {useState, useEffect} from "react";
import {useLocation} from "react-router-dom";
import DashboardHeader from "../../../Components/Dashboard Components/Dashboard Header";
import YearCard from "../../../Components/Dashboard Components/Dean Components/Year Card";
import Clock from "../../../Components/Dashboard Components/Dean Components/Clock";
import RecentlyEvaluatedFaculty from "../../../Components/Dashboard Components/Dean Components/Recently Evaluated";

interface HomeProps {
	activeView: string;
	setActiveView: (view: string) => void;
}

const Home: React.FC<HomeProps> = ({ activeView, setActiveView }) => {
    const location = useLocation();
    const [facultyId, setFacultyId] = useState<number | null>(null);
    const [collegeName, setCollegeName] = useState<string | null>(null);
    const [isTempDean, setIsTempDean] = useState(false);

    useEffect(() => {
        const isTemp = localStorage.getItem('isTempFaculty') === 'true';
        const storedFacultyId = localStorage.getItem('facultyId');
        setIsTempDean(isTemp);
        if (isTemp && storedFacultyId) {
            setFacultyId(Number(storedFacultyId));
        }
        // If navigated with state, prefer that
        if (location.state && (location.state as any).facultyId) {
            setFacultyId((location.state as any).facultyId);
        }
        if (location.state && (location.state as any).collegeName) {
            setCollegeName((location.state as any).collegeName);
        }
    }, [location.state]);

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

            {/* HR as Dean Banner */}
            {isTempDean && (
                <div className="mb-2 w-full bg-yellow-200 py-2 text-center text-sm font-bold text-yellow-900">
                    Viewing as Dean{collegeName ? ` of ${collegeName}` : facultyId ? ` (Faculty ID: ${facultyId})` : ''}
                </div>
            )}

			{/*Recently Evaluated*/}
            <RecentlyEvaluatedFaculty setActiveView={setActiveView} facultyId={facultyId}/>

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
