import React, { useEffect } from "react";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/solid";

interface NavbarProps {
	activeView: string;
	setActiveView: (view: string) => void;
	isDockVisible: boolean;
	setIsDockVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

const NavbarHR: React.FC<NavbarProps> = ({
	activeView,
	setActiveView,
	isDockVisible,
	setIsDockVisible,
}) => {
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

	const secondaryDockMap: Record<string, string[]> = {
		evaluation: ["createStudentEval", "studentEval", "evalSummary"],
		createStudentEval: ["createStudentEval", "studentEval", "evalSummary"],
		studentEval: ["createStudentEval", "studentEval", "evalSummary"],
		evalSummary: ["createStudentEval", "studentEval", "evalSummary"],
		resourceGroup: ["courses", "subject", "rooms", "schedules"],
		courses: ["courses", "subject", "rooms", "schedules"],
		subject: ["courses", "subject", "rooms", "schedules"],
		rooms: ["courses", "subject", "rooms", "schedules"],
		schedules: ["courses", "subject", "rooms", "schedules"],
	};

	const secondaryDockVisible = Boolean(secondaryDockMap[activeView]);

	return (
		<>
			{/* Toggle Button - Now Outside Navbar */}
			<div
				className={`fixed -translate-y-1/2 transform transition-all duration-300 ${isDockVisible ? "right-2" : "right-2"} ${
					isDockVisible && secondaryDockVisible
						? "bottom-25 md:bottom-25"
						: isDockVisible
							? "bottom-10"
							: "bottom-0"
				} `}
			>
				<div className="tooltip tooltip-left">
					<button
						className="flex h-12 w-12 items-center justify-center rounded-xl border border-gray-300 bg-[#13202b] text-white shadow-2xl hover:scale-110"
						onClick={() => setIsDockVisible(!isDockVisible)}
					>
						{isDockVisible ? (
							<ChevronDownIcon className="h-6 w-6" />
						) : (
							<ChevronUpIcon className="h-6 w-6" />
						)}
					</button>

					<div className="tooltip-content hidden text-sm whitespace-pre-line sm:block">
						Open/Close Dock
						<br />
						(Shortcut: Space)
					</div>
				</div>
			</div>

			<nav data-theme="SJC" className="flex">
				{/* Primary Dock */}
				<div
					className={`dock dock-xs bottom-0 w-full transition-transform duration-300 ease-in-out ${
						isDockVisible ? "translate-y-0" : "translate-y-[100%]"
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
						className={`dock dock-xs bottom-12 z-2 w-full border-b-2 border-gray-800 transition-all duration-300 ease-in-out ${
							isDockVisible
								? "translate-y-0"
								: "translate-y-[200%]"
						}`}
					>
						{secondaryDockMap[activeView]?.map((view) => (
							<button
								key={view}
								className="dock"
								onClick={() => handleClick(view)}
							>
								<span className="dock-label">
									{(() => {
										switch (view) {
											case "createStudentEval":
												return "Create Student Evaluations";
											case "studentEval":
												return "Student Evaluations";
											case "evalSummary":
												return "Evaluation Summary";
											case "courses":
												return "Courses";
											case "subject":
												return "Subjects";
											case "rooms":
												return "Rooms";
											case "schedules":
												return "Schedules";
											default:
												return view;
										}
									})()}
								</span>
							</button>
						))}
					</div>
				)}
			</nav>
		</>
	);
};

export default NavbarHR;
