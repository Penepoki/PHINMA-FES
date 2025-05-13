import React, { useEffect, useState } from "react";

interface NavbarProps {
	activeView: string;
	setActiveView: (view: string) => void;
}

const NavbarHR: React.FC<NavbarProps> = ({ activeView, setActiveView }) => {
	const [isDockVisible, setIsDockVisible] = useState<boolean>(true);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			const target = e.target as HTMLElement;
			const tagName = target.tagName.toLowerCase();

			const isTyping =
				tagName === "input" ||
				tagName === "textarea" ||
				target.isContentEditable;

			if (isTyping) return;

			if (e.code === "Space" || e.key === " ") {
				e.preventDefault();
				setIsDockVisible((prev) => !prev);
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, []);

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
			<div
				className={`fixed z-[501] -translate-y-1/2 transform transition-all duration-300 ${isDockVisible ? "left-4" : "left-2"} ${
					isDockVisible && secondaryDockVisible
						? "bottom-38 md:bottom-20"
						: isDockVisible
							? "bottom-20"
							: "bottom-0"
				} `}
			>
				<div className="tooltip tooltip-right">
					<button
						className="bg-primary h-12 rounded-xl border-1 border-gray-300 px-4 text-xl text-white shadow-2xl hover:scale-110"
						onClick={() => setIsDockVisible(!isDockVisible)}
					>
						{isDockVisible ? "◀" : "▶"}
					</button>
					<div className="tooltip-content hidden text-sm whitespace-pre-line sm:block">
						Open/Close Dock
						<br />
						(Shortcut: Space)
					</div>
				</div>
			</div>

			<nav data-theme="SJC" className="relative">
				{/* Primary Dock */}
				<div
					className={`dock dock-xl bottom-2 z-[500] mx-auto w-[95%] rounded-xl border-1 border-[#1c402a] shadow-2xl transition-transform duration-300 ease-in-out ${
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

				{/* Secondary Dock */}
				{secondaryDockVisible && (
					<div
						className={`dock dock-lg bottom-23 z-[499] mx-auto w-[90%] rounded-xl border-1 border-[#1c402a] shadow-xl transition-all duration-500 ease-in-out ${
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
									onClick={() =>
										handleClick("createStudentEval")
									}
								>
									<span className="dock-label">
										Create Student Evaluations
									</span>
								</button>
								<button
									className="dock"
									onClick={() => handleClick("studentEval")}
								>
									<span className="dock-label">
										Student Evaluations
									</span>
								</button>
								<button
									className="dock"
									onClick={() => handleClick("evalSummary")}
								>
									<span className="dock-label">
										Evaluation Summary
									</span>
								</button>
							</>
						)}

						{activeView === "createStudentEval" && (
							<>
								<button
									className="dock"
									onClick={() =>
										handleClick("createStudentEval")
									}
								>
									<span className="dock-label">
										Create Student Evaluations
									</span>
								</button>
								<button
									className="dock"
									onClick={() => handleClick("studentEval")}
								>
									<span className="dock-label">
										Student Evaluations
									</span>
								</button>
								<button
									className="dock"
									onClick={() => handleClick("evalSummary")}
								>
									<span className="dock-label">
										Evaluation Summary
									</span>
								</button>
							</>
						)}

						{activeView === "studentEval" && (
							<>
								<button
									className="dock"
									onClick={() =>
										handleClick("createStudentEval")
									}
								>
									<span className="dock-label">
										Create Student Evaluations
									</span>
								</button>
								<button
									className="dock"
									onClick={() => handleClick("studentEval")}
								>
									<span className="dock-label">
										Student Evaluations
									</span>
								</button>
								<button
									className="dock"
									onClick={() => handleClick("evalSummary")}
								>
									<span className="dock-label">
										Evaluation Summary
									</span>
								</button>
							</>
						)}

						{activeView === "evalSummary" && (
							<>
								<button
									className="dock"
									onClick={() =>
										handleClick("createStudentEval")
									}
								>
									<span className="dock-label">
										Create Student Evaluations
									</span>
								</button>
								<button
									className="dock"
									onClick={() => handleClick("studentEval")}
								>
									<span className="dock-label">
										Student Evaluations
									</span>
								</button>
								<button
									className="dock"
									onClick={() => handleClick("evalSummary")}
								>
									<span className="dock-label">
										Evaluation Summary
									</span>
								</button>
							</>
						)}

						{/* Buttons for Resource Group */}
						{activeView === "resourceGroup" && (
							<>
								<button
									className="dock"
									onClick={() => handleClick("courses")}
								>
									<span className="dock-label">Courses</span>
								</button>
								<button
									className="dock"
									onClick={() => handleClick("subject")}
								>
									<span className="dock-label">Subjects</span>
								</button>
								<button
									className="dock"
									onClick={() => handleClick("rooms")}
								>
									<span className="dock-label">Rooms</span>
								</button>
								<button
									className="dock"
									onClick={() => handleClick("schedules")}
								>
									<span className="dock-label">
										Schedules
									</span>
								</button>
							</>
						)}
						{activeView === "courses" && (
							<>
								<button
									className="dock"
									onClick={() => handleClick("courses")}
								>
									<span className="dock-label">Courses</span>
								</button>
								<button
									className="dock"
									onClick={() => handleClick("subject")}
								>
									<span className="dock-label">Subjects</span>
								</button>
								<button
									className="dock"
									onClick={() => handleClick("rooms")}
								>
									<span className="dock-label">Rooms</span>
								</button>
								<button
									className="dock"
									onClick={() => handleClick("schedules")}
								>
									<span className="dock-label">
										Schedules
									</span>
								</button>
							</>
						)}
						{activeView === "schedules" && (
							<>
								<button
									className="dock"
									onClick={() => handleClick("courses")}
								>
									<span className="dock-label">Courses</span>
								</button>
								<button
									className="dock"
									onClick={() => handleClick("subject")}
								>
									<span className="dock-label">Subjects</span>
								</button>
								<button
									className="dock"
									onClick={() => handleClick("rooms")}
								>
									<span className="dock-label">Rooms</span>
								</button>
								<button
									className="dock"
									onClick={() => handleClick("schedules")}
								>
									<span className="dock-label">
										Schedules
									</span>
								</button>
							</>
						)}
						{activeView === "rooms" && (
							<>
								<button
									className="dock"
									onClick={() => handleClick("courses")}
								>
									<span className="dock-label">Courses</span>
								</button>
								<button
									className="dock"
									onClick={() => handleClick("subject")}
								>
									<span className="dock-label">Subjects</span>
								</button>
								<button
									className="dock"
									onClick={() => handleClick("rooms")}
								>
									<span className="dock-label">Rooms</span>
								</button>
								<button
									className="dock"
									onClick={() => handleClick("schedules")}
								>
									<span className="dock-label">
										Schedules
									</span>
								</button>
							</>
						)}
						{activeView === "subject" && (
							<>
								<button
									className="dock"
									onClick={() => handleClick("courses")}
								>
									<span className="dock-label">Courses</span>
								</button>
								<button
									className="dock"
									onClick={() => handleClick("subject")}
								>
									<span className="dock-label">Subjects</span>
								</button>
								<button
									className="dock"
									onClick={() => handleClick("rooms")}
								>
									<span className="dock-label">Rooms</span>
								</button>
								<button
									className="dock"
									onClick={() => handleClick("schedules")}
								>
									<span className="dock-label">
										Schedules
									</span>
								</button>
							</>
						)}
					</div>
				)}
			</nav>
		</>
	);
};

export default NavbarHR;
