import { useState } from "react";
import DashboardHeader from "../../../Components/Dashboard Components/Dashboard Header";
import SchoolCards from "../../../Components/Dashboard Components/HR Components/School Cards";
import CollegeCards from "../../../Components/Dashboard Components/HR Components/College Cards";

const schools = [
	{ name: "SJC MANILA", image: null },
	{ name: "SJC QC", image: null },
	{ name: "SJC AURORA", image: null },
	{ name: "UPANG", image: null },
	{ name: "UI", image: null },
	{ name: "SWU", image: null },
	{ name: "UCDO", image: null },
	{ name: "UCDO", image: null },
];

const colleges = [
	{
		name: "CITE",
		fullname: "College of Information Technology Education",
		image: null,
	},
	{
		name: "CAHS",
		fullname: "College of Allied Health Sciences",
		image: null,
	},
	{
		name: "CMA",
		fullname: "College of Management and Accountancy",
		image: null,
	},
	{
		name: "CCJE",
		fullname: "College of Criminal Justice Education",
		image: null,
	},
	{ name: "COED", fullname: "College of Education", image: null },
	{ name: "SHS", fullname: "Senior High School", image: null },
	{ name: "etc", fullname: "Other", image: null },
];

function Home() {
	const [selectedSchool, setSelectedSchool] = useState<string | null>(null);

	const handleSchoolClick = (schoolName: string) => {
		// You can store the school name or just a boolean
		setSelectedSchool(schoolName);
	};

	return (
		<div className="home-page z-10 flex h-full w-full flex-col items-center justify-center gap-y-6">
			<DashboardHeader />

			<div className="mt-34 flex h-full w-full flex-col items-center justify-start overflow-auto bg-black/20">
				{selectedSchool ? (
					<>
						<h2 className="mt-6 mb-4 text-4xl font-bold text-white">
							Colleges of {selectedSchool}
						</h2>
						<button
							className="btn absolute left-20 mt-6 mb-4 bg-[#1c402a] text-xs text-gray-400 hover:scale-105"
							onClick={() => setSelectedSchool(null)}
						>
							← Back to Schools
						</button>
						<CollegeCards college={colleges} />
					</>
				) : (
					<SchoolCards
						school={schools}
						onSchoolClick={handleSchoolClick}
					/>
				)}
			</div>
		</div>
	);
}

export default Home;
