import { useState, useEffect } from "react";

type ToggleBoxProps = {
	label: string;
	active: boolean;
	onToggle: (label: string) => void;
};

function ToggleBox({ label, active, onToggle }: ToggleBoxProps) {
	const delay = (Math.random() * 2).toFixed(2);
	return (
		<button
			className={`float-breathe min-w-[140px] rounded-xl px-6 py-3 text-center text-base transition-colors hover:scale-105 hover:bg-gray-300 ${
				active ? "bg-[#1c402a] text-white" : "bg-gray-200 text-black"
			}`}
			onClick={() => onToggle(label)}
			style={{
				// animationDuration: `${duration}s`,
				animationDelay: `${delay}s`,
			}}
		>
			{label}
		</button>
	);
}

const CopusMatrix = () => {
	const MIN_MINUTE = 2;
	const MAX_MINUTE = 60;
	const INCREMENT = 2;

	const [minute, setMinute] = useState(MIN_MINUTE);

	// State to hold selections per minute
	const [selectionsByMinute, setSelectionsByMinute] = useState<{
		[key: number]: { student: string | null; teacher: string | null };
	}>({});

	// Current selected for displayed minute
	const [currentStudent, setCurrentStudent] = useState<string | null>(null);
	const [currentTeacher, setCurrentTeacher] = useState<string | null>(null);

	const minuteBoxes = Array.from(
		{ length: (MAX_MINUTE - MIN_MINUTE) / INCREMENT + 1 },
		(_, index) => MIN_MINUTE + index * INCREMENT,
	);

	const studentOptions = [
		"Listening",
		"Individual Thinking",
		"Group Activity",
		"Answering Questions",
		"Asking Questions",
		"Whole Class Discussion",
		"Student Presentations",
		"Test/Quiz",
		"Waiting",
		"Other",
	];

	const teacherOptions = [
		"Lecture",
		"Real-time Writing",
		"Moving/Guiding",
		"Answering Questions",
		"Posing Questions",
		"Follow-up",
		"1-on-1 Discussion",
		"Demonstrate/Video",
		"Administrative Tasks",
		"Waiting",
		"Other",
	];

	// Load selections when minute changes
	useEffect(() => {
		const saved = selectionsByMinute[minute];
		setCurrentStudent(saved?.student ?? null);
		setCurrentTeacher(saved?.teacher ?? null);
	}, [minute, selectionsByMinute]);

	const updateSelections = (
		type: "student" | "teacher",
		label: string | null,
	) => {
		setSelectionsByMinute((prev) => {
			const prevForMinute = prev[minute] || {
				student: null,
				teacher: null,
			};
			const updated = {
				...prev,
				[minute]: {
					...prevForMinute,
					[type]: label,
				},
			};
			return updated;
		});

		// Also update current states immediately for UI responsiveness
		if (type === "student") setCurrentStudent(label);
		else setCurrentTeacher(label);
	};

	const handleStudentToggle = (label: string) => {
		// If clicking same selected, deselect it, else select new
		updateSelections("student", currentStudent === label ? null : label);
	};

	const handleTeacherToggle = (label: string) => {
		updateSelections("teacher", currentTeacher === label ? null : label);
	};

	const handlePrev = () => {
		setMinute((prev) => Math.max(prev - INCREMENT, MIN_MINUTE));
	};

	const handleNext = () => {
		setMinute((prev) => Math.min(prev + INCREMENT, MAX_MINUTE));
	};

	// Condition: student AND teacher selected for current minute
	const hasStudentAndTeacherSelected =
		currentStudent !== null && currentTeacher !== null;

	return (
		<div className="mb-4 rounded-lg border border-gray-300 p-4">
			<div className="mb-4 flex items-center justify-center gap-3">
				<div className="flex flex-col items-center gap-4">
					{/* Navigation */}
					<div className="flex items-center justify-center gap-4">
						<button
							className="text-xl font-bold disabled:opacity-30"
							onClick={handlePrev}
							disabled={minute === MIN_MINUTE}
						>
							&larr;
						</button>
						<h2 className="text-xl font-bold">Minute {minute}</h2>
						<button
							className="text-xl font-bold disabled:opacity-30"
							onClick={handleNext}
							disabled={minute === MAX_MINUTE}
						>
							&rarr;
						</button>
					</div>

					{/* Minute Boxes */}
					<div className="grid grid-cols-5 gap-2 md:grid-cols-15">
						{minuteBoxes.map((m) => {
							const selections = selectionsByMinute[m];
							const answered =
								selections?.student != null &&
								selections?.teacher != null;

							return (
								<button
									key={m}
									onClick={() => setMinute(m)}
									className={`h-10 w-10 rounded-md text-sm font-semibold ${
										minute === m
											? hasStudentAndTeacherSelected
												? "bg-[#1c402a] text-white"
												: "bg-gray-400 text-white"
											: answered
												? "bg-[#1c402a] text-white"
												: "bg-gray-200 text-gray-700 hover:bg-gray-300"
									}`}
								>
									{m}
								</button>
							);
						})}
					</div>
				</div>
			</div>

			<div className="mb-6 text-center text-lg font-semibold text-gray-700">
				Students Doing
			</div>
			<div className="mb-4 flex flex-wrap justify-center gap-2">
				{studentOptions.map((label, index) => (
					<ToggleBox
						key={index}
						label={label}
						active={currentStudent === label}
						onToggle={handleStudentToggle}
					/>
				))}
			</div>

			<div className="mb-6 text-center text-lg font-semibold text-gray-700">
				Teacher Doing
			</div>
			<div className="flex flex-wrap justify-center gap-2">
				{teacherOptions.map((label, index) => (
					<ToggleBox
						key={index}
						label={label}
						active={currentTeacher === label}
						onToggle={handleTeacherToggle}
					/>
				))}
			</div>
		</div>
	);
};

export default CopusMatrix;
