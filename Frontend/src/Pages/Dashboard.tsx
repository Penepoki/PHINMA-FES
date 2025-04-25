import { JSX, useState } from "react";
import Background from "../assets/Landing Page Assets/Background4.png";
import NavBar from "../Components/Dashboard Components/Navbar";
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

function Dashboard( {role} : {role: string}) {
  // Default view is "home"
  const [activeView, setActiveView] = useState("home");
  const viewComponents: Record<string, JSX.Element> = {
    home:
     role === "Dean"|| role === "Program Head"
      ? <HomeViewDean activeView={activeView} setActiveView={setActiveView} />
      : role === "HR"
      ? (<HomeViewHR />)
      : role === "Student"
      ? (<HomeViewStudent />)
      : <div>Home</div>,
    profile: <Profile />,
    evaluation: <Evaluation setActiveView={setActiveView} />,
    resourceGroup: <ResourceGroup setActiveView={setActiveView} />,
    // subComponents
    createStudentEval: (
      <CreateStudentEvaluation setActiveView={setActiveView} />
    ),
    studentEval: <StudentEvaluation setActiveView={setActiveView} />,
    evalSummary: <EvaluationSummary />,
    // Resource Group sub-components
    courses: <Courses setActiveView={setActiveView} />,
    rooms: <Rooms setActiveView={setActiveView} />,
    schedules: <Schedules setActiveView={setActiveView} />,
    subject: <Subject setActiveView={setActiveView} />,
  };

  return (
    <section id="dashboard-section" data-theme="SJC">
      <div
        className="min-h-screen bg-cover bg-center z-1"
        style={{ backgroundImage: `url(${Background})` }}
      >
        <DashboardAnimation />

        <header
          className="absolute top-0 left-0 w-full flex space-x-5 pl-7 justify-end items-center h-[20%] z-1"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0))",
          }}
        ></header>

        {/* Main Content: Render dynamic view based on activeView */}
        <main className="flex w-screen h-screen p-3 md:p-10 z-40">
          {viewComponents[activeView] || <div>View not found</div>}
        </main>

        {/* NavBar (passing setActiveView and activeView to update the view state) */}
        <nav className="z-40">
          <NavBar activeView={activeView} setActiveView={setActiveView} />
        </nav>
      </div>
    </section>
  );
}

export default Dashboard;
