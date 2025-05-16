import React, { useEffect } from "react";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/solid";

interface NavbarProps {
	activeView: string;
	setActiveView: (view: string) => void;
	isDockVisible: boolean;
	setIsDockVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

const NavbarStudent: React.FC<NavbarProps> = ({
	activeView,
	setActiveView,
	isDockVisible,
	setIsDockVisible,
}) => {
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			const target = e.target as HTMLElement;
			const tagName = target.tagName.toLowerCase();

			if (
				tagName === "input" ||
				tagName === "textarea" ||
				target.isContentEditable
			)
				return;

			if (e.code === "Space" || e.key === " ") {
				e.preventDefault();
				setIsDockVisible((prev) => !prev);
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [setIsDockVisible]);

	const handleClick = (page: string) => {
		setActiveView(page);
	};

	const buttonClasses = (btn: string) =>
		`dock ${activeView === btn ? "dock-active" : ""}`;

	return (
		<>
			{/* Toggle Button - Now Outside Navbar */}
			<div
				className={`fixed z-[501] -translate-y-1/2 transform transition-all duration-300 ${isDockVisible ? "right-2" : "right-2"} ${
					isDockVisible
						? "bottom-10 md:bottom-10"
						: "bottom-0 md:bottom-0"
				} `}
			>
				<div className="tooltip tooltip-left">
					<button
						className="flex h-12 w-12 items-center justify-center rounded-xl border border-gray-300 bg-[#1b2e3e]/50 text-white shadow-2xl hover:scale-110"
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
					className={`dock dock-sm bottom-0 w-full transition-transform duration-300 ease-in-out ${
						isDockVisible ? "translate-y-0" : "translate-y-full"
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
				</div>
			</nav>
		</>
	);
};

export default NavbarStudent;
