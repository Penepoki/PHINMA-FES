import { useState, useEffect } from "react";
import api from "/src/utils/api.ts";
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

	// Add tally tracking
	const [studentTallies, setStudentTallies] = useState<{
		[key: string]: number;
	}>({});
	const [teacherTallies, setTeacherTallies] = useState<{
		[key: string]: number;
	}>({});
	const [minute, setMinute] = useState(MIN_MINUTE);
	// Time tracking states
	const [currentTime, setCurrentTime] = useState<string>("");
	const [startTime, setStartTime] = useState<Date | null>(null);
	const [elapsedTime, setElapsedTime] = useState<string>("00");
	const [isTimerStarted, setIsTimerStarted] = useState(false);
	const [evaluationId, setEvaluationId] = useState<number | null>(null);
	// Start timer function
	const startTimer = async () => {
		if (!isTimerStarted) {
			const startTimeValue = new Date();
			setStartTime(startTimeValue);
			setIsTimerStarted(true);


				try {
					const response = await api.post("/api/evaluations", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						schedule: 1, // Replace with real schedule ID
						startTime: startTimeValue.toISOString(),
					}),
				});
				const data = await response.json();
				setEvaluationId(data.id); // Save the evaluation ID
			} catch (error) {
				console.error("Failed to start evaluation", error);
				setIsTimerStarted(false); // Reset timer state if API call fails
			}
		}
	};


	// Update current time and elapsed time every second
	useEffect(() => {
		if (!isTimerStarted) {
			setCurrentTime(
				new Date().toLocaleTimeString([], {
					hour: "2-digit",
					minute: "2-digit",
				}),
			);
			return;
		}

		const timer = setInterval(() => {
			const now = new Date();
			setCurrentTime(
				now.toLocaleTimeString([], {
					hour: "2-digit",
					minute: "2-digit",
				}),
			);

			if (startTime) {
				const elapsed = now.getTime() - startTime.getTime();
				const totalMinutes = Math.floor(elapsed / (1000 * 60));
				setElapsedTime(totalMinutes.toString().padStart(2, "0"));
			}
		}, 1000);

		return () => clearInterval(timer);
	}, [startTime]);

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

	// Update tallies whenever selections change
	useEffect(() => {
		calculateTallies();
	}, [selectionsByMinute]);
	const getTotalMinutesObserved = () => {
		return Object.values(selectionsByMinute).filter(
			(selection) => selection.student && selection.teacher,
		).length;
	};

	const calculateTallies = () => {
		const newStudentTallies: { [key: string]: number } = {};
		const newTeacherTallies: { [key: string]: number } = {};

		// Initialize tallies to 0
		studentOptions.forEach((option) => (newStudentTallies[option] = 0));
		teacherOptions.forEach((option) => (newTeacherTallies[option] = 0));

		// Count selections from all minutes
		Object.values(selectionsByMinute).forEach((selection) => {
			if (selection.student) {
				newStudentTallies[selection.student]++;
			}
			if (selection.teacher) {
				newTeacherTallies[selection.teacher]++;
			}
		});

		setStudentTallies(newStudentTallies);
		setTeacherTallies(newTeacherTallies);
	};

		const updateSelections = async (
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

		// Update current state immediately
		if (type === "student") setCurrentStudent(label);
		else setCurrentTeacher(label);

		// Save updated state to back-end
		if (!evaluationId) return;

		const scoringData = {
			student_activities: Object.entries(studentTallies).reduce(
				(acc, [activity, count]) => ({
					...acc,
					[activity]: `${(
						(count / getTotalMinutesObserved()) *
						100
					).toFixed(1)}%`,
				}),
				{},
			),
			instructor_activities: Object.entries(teacherTallies).reduce(
				(acc, [activity, count]) => ({
					...acc,
					[activity]: `${(
						(count / getTotalMinutesObserved()) *
						100
					).toFixed(1)}%`,
				}),
				{},
			),
			elapsedTime, // Send the most recent elapsed time
			startTime: startTime?.toISOString(),
		};


		try {
			await api.patch(`/api/evaluations/${evaluationId}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(scoringData),
			});
		} catch (error) {
			console.error("Failed to update evaluation", error);
		}
	};

	const handleStudentToggle = (label: string) => {
		startTimer();
		// If clicking same selected, deselect it, else select new
		updateSelections("student", currentStudent === label ? null : label);
	};

	const handleTeacherToggle = (label: string) => {
		startTimer();
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
			{" "}
			<div className="mb-4 text-center text-sm font-semibold text-gray-700">
				<div className="flex w-full flex-row justify-between">
					<span>Current Time: {currentTime}</span>
					<span>|</span>
					<span>
						Time Started:{" "}
						{startTime?.toLocaleTimeString([], {
							hour: "2-digit",
							minute: "2-digit",
						})}{" "}
					</span>{" "}
					<span>|</span>
					<span>Time Elapsed: {elapsedTime} Minutes</span>
				</div>
			</div>
			<div className="mb-4 flex items-center justify-center gap-3">
				<div className="flex flex-col items-center gap-4">
					<div className="text-center text-sm text-gray-400">
						The Observer must select an option for both the student
						and teacher doing in order to complete the minute.
						<br /> Timer will start after the selecting an option.
					</div>
					{/* Navigation */}
					<div className="flex items-center justify-center gap-4">
						<button
							className="tooltip text-xl font-bold disabled:opacity-30"
							onClick={handlePrev}
							disabled={minute === MIN_MINUTE}
							data-tip="Click to go back to the previous minutes"
						>
							&larr;
						</button>{" "}
						<h2 className="text-xl font-bold">
							{`Minutes ${minute - 2} - ${minute}`}
						</h2>
						<button
							className="tooltip text-xl font-bold disabled:opacity-30"
							onClick={handleNext}
							disabled={minute === MAX_MINUTE}
							data-tip="Click to go to the next minutes"
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
									onClick={() => {
										startTimer();
										setMinute(m);
									}}
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
			</div>{" "}
			<div className="flex flex-wrap justify-center gap-2">
				{teacherOptions.map((label, index) => (
					<ToggleBox
						key={index}
						label={label}
						active={currentTeacher === label}
						onToggle={handleTeacherToggle}
					/>
				))}
			</div>{" "}
			{/* Activity Summary */}
			<div className="collapse-arrow collapse mt-8 rounded-xl border border-gray-300">
				<input type="checkbox" />
				<div className="collapse-title text-center text-lg font-semibold">
					Activity Summary
				</div>
				<div className="collapse-content">
					<div className="grid gap-8 md:grid-cols-2">
						{/* Student Activities */}
						<div>
							<h4 className="mb-2 text-center font-semibold">
								Student Activities
							</h4>
							<div className="space-y-2">
								{Object.entries(studentTallies).map(
									([activity, count]) => (
										<div
											key={activity}
											className="flex justify-between"
										>
											<span>{activity}:</span>
											<span>
												{count} times (
												{count > 0
													? (
															(count /
																getTotalMinutesObserved()) *
															100
														).toFixed(1)
													: "0"}
												%)
											</span>
										</div>
									),
								)}
							</div>
						</div>

						{/* Teacher Activities */}
						<div>
							<h4 className="mb-2 text-center font-semibold">
								Teacher Activities
							</h4>
							<div className="space-y-2">
								{Object.entries(teacherTallies).map(
									([activity, count]) => (
										<div
											key={activity}
											className="flex justify-between"
										>
											<span>{activity}:</span>
											<span>
												{count} times (
												{count > 0
													? (
															(count /
																getTotalMinutesObserved()) *
															100
														).toFixed(1)
													: "0"}
												%)
											</span>
										</div>
									),
								)}
							</div>
						</div>
					</div>

					<div className="mt-4 text-center text-sm text-gray-600">
						Total Minutes Observed: {getTotalMinutesObserved() * 2}
					</div>

					<div className="mt-4 flex justify-center">
								<button
									onClick={async () => {
									const scoringData = {
									student_activities: Object.entries(studentTallies).reduce(
									(acc, [activity, count]) => ({
										...acc,
									[activity]: `${(
									(count / getTotalMinutesObserved()) *
									100
									).toFixed(1)}%`,
									}),
									{},
									),
									instructor_activities: Object.entries(teacherTallies).reduce(
										(acc, [activity, count]) => ({
											...acc,
											[activity]: `${(
												(count / getTotalMinutesObserved()) *
												100
											).toFixed(1)}%`,
										}),
										{},
									),
									totalMinutesObserved: getTotalMinutesObserved(),
									startTime: startTime?.toISOString(),
									elapsedTime: elapsedTime,
								};

								try {
									await api.post(`/api/evaluations/${evaluationId}/finish`, {
										method: "POST",
										headers: {
											"Content-Type": "application/json",
										},
										body: JSON.stringify(scoringData),
									});
									alert("Evaluation saved successfully!");
								} catch (error) {
									console.error("Failed to save evaluation", error);
								}
							}}
							className="rounded-lg bg-[#1c402a] px-6 py-2 text-white transition-colors hover:bg-[#2c503a]"
							disabled={getTotalMinutesObserved() === 0}
						>
							Save Evaluation
						</button>;
					</div>
				</div>
			</div>
		</div>
	);
};

export default CopusMatrix;
