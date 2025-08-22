import {useState, useEffect} from "react";
import DashboardHeader from "../../../Components/Dashboard Components/Dashboard Header";
import SchoolCards from "../../../Components/Dashboard Components/HR Components/School Cards";
import api from "../../../utils/api";

function Home() {
	const [schools, setSchools] = useState<any[]>([]);
	const [selectedSchool, setSelectedSchool] = useState<any | null>(null);

	// Fetch faculties (schools) from backend
	useEffect(() => {
		const fetchFaculties = async () => {
			try {
				const token = localStorage.getItem('token');
				const response = await api.get('/faculty/faculties/', {
					headers: {
						'Authorization': `Token ${token}`,
					},
				});
				const schoolCards = response.data.map((faculty: any) => ({
					id: faculty.id,
					name: faculty.name,
					fullname: faculty.name, // If you have a fullname field, use it
					image: null, // Add image if available in backend
				}));
				setSchools(schoolCards);
			} catch (error) {
				console.error('Failed to fetch faculties:', error);
			}
		};
		fetchFaculties();
	}, []);

	// Function to handle school (faculty) selection
	const handleSchoolSelect = (school: any) => {
		setSelectedSchool(school);
	};

	return (
		<div className="home-page z-10 flex h-full w-full flex-col items-center justify-center gap-y-6">
			<DashboardHeader />
			<div className="mt-34 flex h-full w-full flex-col items-center justify-start overflow-auto bg-black/20">
				{selectedSchool ? (
					<>
						<h2 className="mt-6 mb-4 text-4xl font-bold text-white">
							School: {selectedSchool.name}
						</h2>
						<button
							className="btn absolute left-20 mt-6 mb-4 bg-[#1c402a] text-xs text-gray-400 hover:scale-105"
							onClick={() => setSelectedSchool(null)}
						>
							← Back to Schools
						</button>
						{/* You can show more details or CollegeCards here if needed */}
						<div className="text-white">Selected School ID: {selectedSchool.id}</div>
					</>
				) : (
					<SchoolCards
						school={schools}
						onSchoolClick={(schoolNameOrId: any) => {
							const schoolObj = schools.find(s => s.name === schoolNameOrId || s.id === schoolNameOrId);
							if (schoolObj) handleSchoolSelect(schoolObj);
						}}
					/>
				)}
			</div>
		</div>
	);
}

export default Home;
