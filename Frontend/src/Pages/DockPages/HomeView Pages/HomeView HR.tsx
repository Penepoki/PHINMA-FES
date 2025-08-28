import {useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "../../../Components/Dashboard Components/Dashboard Header";
import SchoolCards from "../../../Components/Dashboard Components/HR Components/School Cards";
import api from "../../../utils/api";

function Home() {
	const [schools, setSchools] = useState<any[]>([]);
	const [selectedSchool, setSelectedSchool] = useState<any | null>(null);
	const navigate = useNavigate();

	// Fetch faculties (schools) from backend
	useEffect(() => {
		(async () => {
			try {
				const token = localStorage.getItem('token');
				const res = await api.get('/faculty/faculties/', {
					headers: {Authorization: `Token ${token}`},
				});
				const schoolCards = res.data.map((f: any) => ({
					id: f.id, name: f.name, fullname: f.name, image: null
				}));
				setSchools(schoolCards);
			} catch (e) {
				console.error('Failed to fetch faculties:', e);
			}
		})();
	}, []);

	const handleSchoolClick = async (schoolNameOrId: any) => {
		try {
			const picked = schools.find((s) => s.name === schoolNameOrId || s.id === schoolNameOrId);
			if (!picked) return;

			const token = localStorage.getItem('token');

			// 1) Clear any previous temp context (safe if none)
			await api.post('/clear-faculty-context/', {}, {headers: {Authorization: `Token ${token}`}});

			// 2) Set the new context
			await api.post('/set-faculty-context/', {faculty_id: picked.id}, {headers: {Authorization: `Token ${token}`}});

			// 3) Mark this session as “viewing as Dean”
			localStorage.setItem('isTempFaculty', 'true');
			localStorage.setItem('facultyId', String(picked.id));
			localStorage.setItem('faculty_id', String(picked.id));

			// 4) Navigate to the Dean dashboard for that faculty
			navigate('/Dashboard/dean', {state: {facultyId: picked.id, collegeName: picked.name}});
		} catch (err) {
			console.error('Failed to switch faculty context:', err);
		}
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
							handleSchoolClick(schoolNameOrId);
						}}
					/>
				)}
			</div>
		</div>
	);
}

export default Home;
