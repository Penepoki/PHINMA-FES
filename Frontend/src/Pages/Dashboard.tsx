import { JSX, useState } from "react";
import Background from "../assets/Landing Page Assets/Background4.png";
import NavbarHR from "../Components/Dashboard Components/Navbar HR";
import NavbarStudent from "../Components/Dashboard Components/Navbar Student";
import DashboardAnimation from "../Components/Dashboard Components/Dashboard Anim";

// Import your view components (create them as needed)
import HomeViewDean from "./DockPages/HomeView Pages/HomeView Dean";
import HomeViewHR from "./DockPages/HomeView Pages/HomeView HR";
import HomeViewStudent from "./DockPages/HomeView Pages/HomeView Student";
import Profile from "./DockPages/ProfileView";
import Evaluation from "./DockPages/EvaluationView Pages/EvaluationView";
import ResourceGroup from "./DockPages/ResourceGroup Pages/ResourceGroupView";

import CreateStudentEvaluation from "./DockPages/EvaluationView Pages/CreateStudentEvaluation";
import StudentEvaluation from "./DockPages/EvaluationView Pages/StudentEvaluationView";
import EvaluationSummary from "./DockPages/EvaluationView Pages/EvaluationSummaryView";

import Courses from "./DockPages/ResourceGroup Pages/Courses";
import Rooms from "./DockPages/ResourceGroup Pages/Rooms";
import Schedules from "./DockPages/ResourceGroup Pages/Schedules";
import Subject from "./DockPages/ResourceGroup Pages/Subject";

function Dashboard({ role }: { role: string }) {
	// Default view is "home"
	const [activeView, setActiveView] = useState("home");
	const [isDockVisible, setIsDockVisible] = useState(true);
	const viewComponents: Record<string, JSX.Element> = {
		home:
			role === "Dean" || role === "Program Head" ? (
				<HomeViewDean
					activeView={activeView}
					setActiveView={setActiveView}
				/>
			) : role === "HR" ? (
				<HomeViewHR />
			) : role === "Student" ? (
				<HomeViewStudent />
			) : (
				<div>Home</div>
			),
		profile: <Profile setActiveView={setActiveView} />,
		evaluation: <Evaluation setActiveView={setActiveView} />,
		resourceGroup: <ResourceGroup setActiveView={setActiveView} />,
		// subComponents
		createStudentEval: (
			<CreateStudentEvaluation setActiveView={setActiveView} />
		),
		studentEval: <StudentEvaluation setActiveView={setActiveView} />,
		evalSummary: <EvaluationSummary setActiveView={setActiveView} />,
		// Resource Group sub-components
		courses: <Courses setActiveView={setActiveView} />,
		rooms: <Rooms setActiveView={setActiveView} />,
		schedules: <Schedules setActiveView={setActiveView} />,
		subject: <Subject setActiveView={setActiveView} />,
	};

	// Calculate if secondary dock should be shown
	return (
		<section id="dashboard-section" data-theme="SJC">
			<div
				className="z-1 min-h-screen bg-cover bg-center"
				style={{
					backgroundImage: `url(${Background})`,
				}}
			>
				<DashboardAnimation />

				<header
					className="absolute top-0 left-0 z-1 flex h-[20%] w-full items-center justify-end space-x-5 pl-7"
					style={{
						background:
							"linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0))",
					}}
				></header>

				<div className="flex h-screen flex-col overflow-hidden">
					{/* Header (optional) */}
					<header className="..."></header>

					{/* Main content that grows to fill available space */}
					<main
						className={`z-40 flex-1 overflow-y-auto px-3 transition-all duration-300 md:px-10 ${
							isDockVisible
								? activeView === "evaluation" ||
									activeView === "resourceGroup" ||
									activeView === "createStudentEval" ||
									activeView === "studentEval" ||
									activeView === "evalSummary" ||
									activeView === "courses" ||
									activeView === "rooms" ||
									activeView === "schedules" ||
									activeView === "subject"
									? "pb-13 md:pb-13"
									: "pb-0 md:pb-0"
								: "pb-0"
						}`}
					>
						{viewComponents[activeView] || (
							<div>View not found</div>
						)}
					</main>

					{/* Dock: height transition controlled */}
					<nav
						className={`transition-all duration-300 ${
							isDockVisible ? "h-[80px] md:h-[100px]" : "h-0"
						} overflow-hidden`}
					>
						{role === "Dean" ||
						role === "HR" ||
						role === "Program Head" ? (
							<NavbarHR
								activeView={activeView}
								setActiveView={setActiveView}
								isDockVisible={isDockVisible}
								setIsDockVisible={setIsDockVisible}
							/>
						) : role === "Student" ? (
							<NavbarStudent
								activeView={activeView}
								setActiveView={setActiveView}
								isDockVisible={isDockVisible}
								setIsDockVisible={setIsDockVisible}
							/>
						) : null}
					</nav>
				</div>
			</div>
		</section>
	);
}

export default Dashboard;
