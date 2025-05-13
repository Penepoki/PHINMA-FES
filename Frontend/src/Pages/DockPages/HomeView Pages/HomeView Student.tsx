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
			questions: Array.from(
				{ length: 10 },
				() =>
					`I understand the lessons with the help of activities provided by my teacher.`,
			),
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
								className="modal-box h-[80%] w-11/12 max-w-5xl text-left text-black"
							>
								<h3 className="mb-2 text-center text-2xl font-bold text-black">
									{subject.name}
								</h3>
								<p className="text-md mb-4 text-center">
									Teacher: <strong>{subject.teacher}</strong>
								</p>

								<form
									method="dialog"
									className="flex h-[85%] flex-col gap-12 overflow-x-clip overflow-y-auto"
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
									{subject.questions.map(
										(question, index) => (
											<div
												key={index}
												className="flex flex-col gap-2 md:flex-row md:items-start"
											>
												<label className="pt-2 text-lg font-semibold md:w-1/3">
													{question}
												</label>
												<label className="flex items-center gap-2">
													<input
														type="radio"
														name={`question-${index}`}
														value="Strongly Agree"
														className="radio"
													/>
													Strongly Agree
												</label>
												<label className="flex items-center gap-2">
													<input
														type="radio"
														name={`question-${index}`}
														value="Agree"
														className="radio"
													/>
													Agree
												</label>
												<label className="flex items-center gap-2">
													<input
														type="radio"
														name={`question-${index}`}
														value="Neutral"
														className="radio"
													/>
													Neutral
												</label>
												<label className="flex items-center gap-2">
													<input
														type="radio"
														name={`question-${index}`}
														value="Disagree"
														className="radio"
													/>
													Disagree
												</label>
												<label className="flex items-center gap-2">
													<input
														type="radio"
														name={`question-${index}`}
														value="Strongly Disagree"
														className="radio"
													/>
													Strongly Disagree
												</label>
											</div>
										),
									)}

									<div className="modal-action">
										<button
											type="submit"
											className="btn btn-success text-white"
										>
											Submit
										</button>
										<button
											type="button"
											className="btn btn-cancel"
											onClick={() => setOpenModal(null)}
										>
											Cancel
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
