import { useState } from "react";
import SubjectCards from "../../../Components/Dashboard Components/Student Components/Subject Cards";
import SemesterCard from "../../../Components/Dashboard Components/HR Components/Semester Cards";
import DashboardHeader from "../../../Components/Dashboard Components/Dashboard Header";

function Home() {
	const [openModal, setOpenModal] = useState<string | null>(null);

	const subjects = [
		{
			name: "Mathematics",
			teacher: "Mr. Smith",
			questions: [
				"I understand the lessons with the help of activities provided by my teacher.",
				"I receive guidance from my teacher on how to complete the activities/tasks/modules.",
				"I feel comfortable asking questions and sharing ideas in our class.",
				"I participate in class because my teacher asks interesting and challenging questions.",
				"I receive feedback from my teacher on how to improve my work, both in class and during consultation hours.",
				"I have been able to apply the lessons from this class to real-life situations",
			],
			image: null,
		},
		{
			name: "Biology",
			teacher: "Ms. Johnson",
			questions: Array.from(
				{ length: 10 },
				(_, i) => `Biology Question ${i + 1}`,
			),
			image: null,
		},
		{
			name: "Chemistry",
			teacher: "Dr. Allen",
			questions: Array.from(
				{ length: 10 },
				(_, i) => `Chemistry Question ${i + 1}`,
			),
			image: null,
		},
		{
			name: "Chemistry",
			teacher: "Dr. Allen",
			questions: Array.from(
				{ length: 10 },
				(_, i) => `Chemistry Question ${i + 1}`,
			),
			image: null,
		},
		{
			name: "Chemistry",
			teacher: "Dr. Allen",
			questions: Array.from(
				{ length: 10 },
				(_, i) => `Chemistry Question ${i + 1}`,
			),
			image: null,
		},
		{
			name: "Chemistry",
			teacher: "Dr. Allen",
			questions: Array.from(
				{ length: 10 },
				(_, i) => `Chemistry Question ${i + 1}`,
			),
			image: null,
		},
		{
			name: "Chemistry",
			teacher: "Dr. Allen",
			questions: Array.from(
				{ length: 10 },
				(_, i) => `Chemistry Question ${i + 1}`,
			),
			image: null,
		},
		{
			name: "Chemistry",
			teacher: "Dr. Allen",
			questions: Array.from(
				{ length: 10 },
				(_, i) => `Chemistry Question ${i + 1}`,
			),
			image: null,
		},
		{
			name: "Chemistry",
			teacher: "Dr. Allen",
			questions: Array.from(
				{ length: 10 },
				(_, i) => `Chemistry Question ${i + 1}`,
			),
			image: null,
		},
		{
			name: "Chemistry",
			teacher: "Dr. Allen",
			questions: Array.from(
				{ length: 10 },
				(_, i) => `Chemistry Question ${i + 1}`,
			),
			image: null,
		},
		// Add more subjects as needed...
	];

	const totalSubjects = subjects.length;
	const [completedSubjects, setCompletedSubjects] = useState<Set<string>>(
		new Set(),
	);
	const ratio = `${completedSubjects.size}/${totalSubjects}`;

	const semesterData = [
		{
			semester: "1st",
			ratio: ratio,
		},
		{
			semester: "2nd",
			ratio: ratio,
		},
	];

	return (
		<div className="home-page z-10 flex h-full w-full flex-col items-center justify-center gap-y-6">
			{/* Header */}
			<DashboardHeader />

			{/* Content */}
			<div className="mt-35 ml-3 flex h-auto w-auto flex-col-reverse items-start justify-center gap-4 overflow-y-auto md:mr-103 md:flex-row">
				{/* Subject List */}

				<SubjectCards
					subjects={subjects}
					onClick={(subjectName) => setOpenModal(subjectName)}
					completedSubjects={completedSubjects}
				/>

				{/* Progress Bar */}
				<div className="flex w-full flex-row items-center justify-center gap-6 md:absolute md:right-20 md:mt-26 md:w-auto md:flex-col">
					{semesterData.map(({ semester, ratio }) => (
						<SemesterCard
							key={semester}
							semester={semester}
							ratio={ratio}
						/>
					))}
				</div>
			</div>

			{/* Modals for Each Subject */}
			{openModal && (
				<div className="modal modal-open" id="subject_modal">
					{subjects.map((subject) =>
						openModal === subject.name ? (
							<div
								key={subject.name}
								className="modal-box flex h-[80%] w-[90%] max-w-5xl flex-col text-black md:w-11/12"
							>
								{/* Sticky Header */}
								<div className="sticky top-0 z-10 flex items-start justify-between px-6 py-3">
									<div className="text-left">
										<h3 className="text-2xl font-bold">
											{subject.name}
										</h3>
										<p className="text-md text-gray-400">
											Teacher:{" "}
											<strong>{subject.teacher}</strong>
										</p>
									</div>
									<button
										type="button"
										className="btn btn-sm btn-error mt-2 h-9 text-white"
										onClick={() => setOpenModal(null)}
									>
										Cancel
									</button>
								</div>

								{/* Scrollable Questions */}
								<form
									method="dialog"
									className="mb-6 flex-1 overflow-y-scroll border-t-3 px-6 shadow-[inset_0_30px_20px_-20px_rgba(0,0,0,0.35)]"
									onSubmit={(e) => {
										e.preventDefault();
										setCompletedSubjects((prev) => {
											const updated = new Set(prev);
											updated.add(subject.name);
											return updated;
										});

										setOpenModal(null);
										alert(
											`${subject.name} submitted successfully!`,
										);
									}}
								>
									<div className="flex flex-col gap-12">
										{subject.questions.map(
											(question, index) => (
												<div
													key={index}
													className="flex flex-col gap-2 md:items-start"
												>
													<label className="w-full pt-2 text-lg font-semibold">
														{question}
													</label>
													{[
														"Strongly Agree",
														"Agree",
														"Neutral",
														"Disagree",
													].map((val, i) => (
														<label
															key={i}
															className="flex items-center gap-2"
														>
															<input
																type="radio"
																name={`question-${index}`}
																value={val}
																className="radio"
															/>
															{
																[
																	"Almost Always (Halos Palagi)",
																	"Often (Madalas)",
																	"Sometimes (Paminsan-minsan)",
																	"Rarely (Madalang)",
																][i]
															}
														</label>
													))}
												</div>
											),
										)}
									</div>

									{/* Sticky Footer */}
									<div className="modal-action bottom-0 pt-3">
										<button
											type="submit"
											className="btn btn-success text-white"
										>
											Submit
										</button>
									</div>
								</form>
							</div>
						) : null,
					)}
				</div>
			)}
		</div>
	);
}

export default Home;
