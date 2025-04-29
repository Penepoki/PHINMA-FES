import React, { useState } from "react";

interface NavbarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeView, setActiveView }) => {
  const [isDockVisible, setIsDockVisible] = useState<boolean>(true);

  const handleClick = (page: string) => {
    setActiveView(page);
  };

  const buttonClasses = (btn: string) =>
    `dock ${activeView === btn ? "dock-active" : ""}`;

  const secondaryDockVisible =
    activeView === "evaluation" ||
    activeView === "resourceGroup" ||
    activeView === "createStudentEval" ||
    activeView === "studentEval" ||
    activeView === "evalSummary" ||
    activeView === "courses" ||
    activeView === "rooms" ||
    activeView === "schedules" ||
    activeView === "subject";

  return (
    <>
      {/* Toggle Button - Now Outside Navbar */}
      <button
        className={`fixed px-4 bg-primary text-white text-xl border-1 border-gray-300 rounded-xl shadow-2xl h-12 z-[1000] transition-all duration-300 bottom-0 transform -translate-y-1/2 hover:scale-110 ${
          isDockVisible ? "left-4" : "left-2"
        } ${
          isDockVisible && secondaryDockVisible
            ? "bottom-38 md:bottom-20" // When secondary dock is visible, set bottom to 38 (or any other value you prefer)
            : isDockVisible
              ? "bottom-20" // When only primary dock is visible, set bottom to 22
              : "bottom-0" // When both docks are closed, reset to bottom-0
        }`}
        onClick={() => setIsDockVisible(!isDockVisible)}
      >
        {isDockVisible ? "◀" : "▶"}
      </button>

      <nav data-theme="SJC" className="relative">
        {/* Secondary Dock */}
        {secondaryDockVisible && (
          <div
            className={`dock dock-lg w-[90%] mx-auto bottom-23 rounded-xl shadow-xl transition-all duration-500 ease-in-out z-[499] 
      ${
        isDockVisible
          ? "translate-x-0 translate-y-0 opacity-100"
          : "-translate-x-[110%] translate-y-10 opacity-0"
      }`}
          >
            {/* Buttons for Evaluation */}
            {activeView === "evaluation" && (
              <>
                <button
                  className="dock"
                  onClick={() => handleClick("createStudentEval")}
                >
                  <span className="dock-label">Create Student Evaluations</span>
                </button>
                <button
                  className="dock"
                  onClick={() => handleClick("studentEval")}
                >
                  <span className="dock-label">Student Evaluations</span>
                </button>
                <button
                  className="dock"
                  onClick={() => handleClick("evalSummary")}
                >
                  <span className="dock-label">Evaluation Summary</span>
                </button>
              </>
            )}

            {activeView === "createStudentEval" && (
              <>
                <button
                  className="dock"
                  onClick={() => handleClick("createStudentEval")}
                >
                  <span className="dock-label">Create Student Evaluations</span>
                </button>
                <button
                  className="dock"
                  onClick={() => handleClick("studentEval")}
                >
                  <span className="dock-label">Student Evaluations</span>
                </button>
                <button
                  className="dock"
                  onClick={() => handleClick("evalSummary")}
                >
                  <span className="dock-label">Evaluation Summary</span>
                </button>
              </>
            )}

            {activeView === "studentEval" && (
              <>
                <button
                  className="dock"
                  onClick={() => handleClick("createStudentEval")}
                >
                  <span className="dock-label">Create Student Evaluations</span>
                </button>
                <button
                  className="dock"
                  onClick={() => handleClick("studentEval")}
                >
                  <span className="dock-label">Student Evaluations</span>
                </button>
                <button
                  className="dock"
                  onClick={() => handleClick("evalSummary")}
                >
                  <span className="dock-label">Evaluation Summary</span>
                </button>
              </>
            )}

            {activeView === "evalSummary" && (
              <>
                <button
                  className="dock"
                  onClick={() => handleClick("createStudentEval")}
                >
                  <span className="dock-label">Create Student Evaluations</span>
                </button>
                <button
                  className="dock"
                  onClick={() => handleClick("studentEval")}
                >
                  <span className="dock-label">Student Evaluations</span>
                </button>
                <button
                  className="dock"
                  onClick={() => handleClick("evalSummary")}
                >
                  <span className="dock-label">Evaluation Summary</span>
                </button>
              </>
            )}

            {/* Buttons for Resource Group */}
            {activeView === "resourceGroup" && (
              <>
                <button className="dock" onClick={() => handleClick("courses")}>
                  <span className="dock-label">Courses</span>
                </button>
                <button className="dock" onClick={() => handleClick("subject")}>
                  <span className="dock-label">Subjects</span>
                </button>
                <button className="dock" onClick={() => handleClick("rooms")}>
                  <span className="dock-label">Rooms</span>
                </button>
                <button
                  className="dock"
                  onClick={() => handleClick("schedules")}
                >
                  <span className="dock-label">Schedules</span>
                </button>
              </>
            )}
            {activeView === "courses" && (
              <>
                <button className="dock" onClick={() => handleClick("courses")}>
                  <span className="dock-label">Courses</span>
                </button>
                <button className="dock" onClick={() => handleClick("subject")}>
                  <span className="dock-label">Subjects</span>
                </button>
                <button className="dock" onClick={() => handleClick("rooms")}>
                  <span className="dock-label">Rooms</span>
                </button>
                <button
                  className="dock"
                  onClick={() => handleClick("schedules")}
                >
                  <span className="dock-label">Schedules</span>
                </button>
              </>
            )}
            {activeView === "schedules" && (
              <>
                <button className="dock" onClick={() => handleClick("courses")}>
                  <span className="dock-label">Courses</span>
                </button>
                <button className="dock" onClick={() => handleClick("subject")}>
                  <span className="dock-label">Subjects</span>
                </button>
                <button className="dock" onClick={() => handleClick("rooms")}>
                  <span className="dock-label">Rooms</span>
                </button>
                <button
                  className="dock"
                  onClick={() => handleClick("schedules")}
                >
                  <span className="dock-label">Schedules</span>
                </button>
              </>
            )}
            {activeView === "rooms" && (
              <>
                <button className="dock" onClick={() => handleClick("courses")}>
                  <span className="dock-label">Courses</span>
                </button>
                <button className="dock" onClick={() => handleClick("subject")}>
                  <span className="dock-label">Subjects</span>
                </button>
                <button className="dock" onClick={() => handleClick("rooms")}>
                  <span className="dock-label">Rooms</span>
                </button>
                <button
                  className="dock"
                  onClick={() => handleClick("schedules")}
                >
                  <span className="dock-label">Schedules</span>
                </button>
              </>
            )}
            {activeView === "subject" && (
              <>
                <button className="dock" onClick={() => handleClick("courses")}>
                  <span className="dock-label">Courses</span>
                </button>
                <button className="dock" onClick={() => handleClick("subject")}>
                  <span className="dock-label">Subjects</span>
                </button>
                <button className="dock" onClick={() => handleClick("rooms")}>
                  <span className="dock-label">Rooms</span>
                </button>
                <button
                  className="dock"
                  onClick={() => handleClick("schedules")}
                >
                  <span className="dock-label">Schedules</span>
                </button>
              </>
            )}
          </div>
        )}

        {/* Primary Dock */}
        <div
          className={`dock dock-xl w-[95%] mx-auto bottom-2 rounded-xl shadow-2xl transition-transform duration-300 ease-in-out z-[500] ${
            isDockVisible ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <button
            className={buttonClasses("home")}
            onClick={() => handleClick("home")}
          >
            <span className="dock-label">Home</span>
          </button>

          <button
            className={buttonClasses("profile")}
            onClick={() => handleClick("profile")}
          >
            <span className="dock-label">Profile</span>
          </button>

          <button
            className={buttonClasses("evaluation")}
            onClick={() => handleClick("evaluation")}
          >
            <span className="dock-label">Evaluation</span>
          </button>

          <button
            className={buttonClasses("resourceGroup")}
            onClick={() => handleClick("resourceGroup")}
          >
            <span className="dock-label">Resource Group</span>
          </button>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
