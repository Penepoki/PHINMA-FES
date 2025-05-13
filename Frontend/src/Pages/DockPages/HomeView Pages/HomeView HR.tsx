import CollegeCards from "../../../Components/Dashboard Components/HR Components/College Cards";
import DashboardHeader from "../../../Components/Dashboard Components/Dashboard Header";

const subjects = [
	{ name: "CITE", image: null },
	{ name: "CAHS", image: null },
	{ name: "CMA", image: null },
	{ name: "CCJE", image: null },
	{ name: "COED", image: null },
	{ name: "SHS", image: null },
	{ name: "etc", image: null },
	{ name: "etc", image: null },
	{ name: "etc", image: null },
	{ name: "etc", image: null },
	// ...more subjects
];

function Home() {
	return (
		<div className="home-page z-10 flex h-full w-full flex-col items-center justify-center gap-y-6">
			<DashboardHeader />

			<div className="mt-35 mb-20 flex h-auto w-auto flex-col items-center justify-start overflow-x-auto">
				<p className="mt-0 text-lg text-gray-300">Subject List:</p>
				<CollegeCards subjects={subjects} />
			</div>
		</div>
	);
}

export default Home;
