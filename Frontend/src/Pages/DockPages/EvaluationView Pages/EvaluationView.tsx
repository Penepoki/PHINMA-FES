import { useEffect, useState } from "react";
import CopusMatrix from "../../../Components/Evaluation Components/Copus Matrix";
import PieChartWithTable from "../../../Components/Evaluation Components/Piechart with Table";
import api from "../../../utils/api";
import { ActivityData } from "../../../Components/Evaluation Components/Copus Matrix";
import CreateEvaluationForm from "../../../Components/Evaluation Components/CreateEvaluationForm";
import { generateAIFeedback } from "../../../utils/api";

interface Evaluation {
	id: number;
	schedule: number;
	observation_date: string;
	evaluation_label: string;
	additional_comments?: string;
	instructor?: string;
}

interface Schedule {
	id: number;
	name: string;
	program: number;
	instructor: number;
	subject: string;
	room: string;
	semester: string;
	year: string;
	section_name?: string;
	subject_name?: string;
	room_name?: string;
	program_name?: string;
	start_time?: string;
	end_time?: string;
}

interface Program {
	id: number;
	name: string;
	code: string;
}

interface ProgramProfessor {
	id: number;
	program: number;
	professor: number;
	professor_details: Professor;
}

interface Professor {
	id: number;
	first_name: string;
	last_name: string;
	department?: string;
}

interface EvalProps {
	setActiveView: (view: string) => void;
}

function Evaluation({ setActiveView }: EvalProps) {
	const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
	const [aiFeedback, setAiFeedback] = useState<string | null>(null);
	const [aiFeedbackLoading, setAiFeedbackLoading] = useState(false);
	const [aiFeedbackError, setAiFeedbackError] = useState<string | null>(null);
	const [schedules, setSchedules] = useState<Schedule[]>([]);
	const [programs, setPrograms] = useState<Program[]>([]);
	const [programProfessors, setProgramProfessors] = useState<
		ProgramProfessor[]
	>([]);
	const [evaluationTallies, setEvaluationTallies] = useState<{
		[evaluationId: number]: {
			studentTallies: Record<string, ActivityData>;
			teacherTallies: Record<string, ActivityData>;
		};
	}>({});
	const [modalOpen, setModalOpen] = useState<string | null>(null);
	const [selectedProfessor, setSelectedProfessor] =
		useState<Professor | null>(null);
	const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(
		null,
	);
	const [selectedEvaluation, setSelectedEvaluation] =
		useState<Evaluation | null>(null);
	const [loading, setLoading] = useState(true);
	const [searchProfessor, setSearchProfessor] = useState("");
	const [searchSchedule, setSearchSchedule] = useState("");
	const [searchSemester, setSearchSemester] = useState("");
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const getToday = () => new Date().toISOString().split('T')[0];
	// Fetch AI feedback when modal opens and selectedEvaluation changes
	useEffect(() => {
		if (selectedEvaluation && selectedEvaluation.id) {
			setAiFeedbackLoading(true);
			setAiFeedbackError(null);
			api.get(`/evaluation/evaluations/${selectedEvaluation.id}/`) // or wherever you fetch the evaluation
				.then((res) => {
					setAiFeedback(res.data.ai_feedback?.feedback || null);
				})
				.catch(() => setAiFeedback(null))
				.finally(() => setAiFeedbackLoading(false));
		}
	}, [selectedEvaluation]);

	const handleGenerateAIFeedback = async () => {
		if (!selectedEvaluation) return;
		setAiFeedbackLoading(true);
		setAiFeedbackError(null);
		try {
			const res = await generateAIFeedback(selectedEvaluation.id);
			setAiFeedback(res.ai_feedback.feedback);
		} catch (err: any) {
			setAiFeedbackError("Failed to generate AI feedback.");
		} finally {
			setAiFeedbackLoading(false);
		}
	};

	const createEvaluation = async (evaluationData: Partial<Evaluation>) => {
		try {
			const response = await api.post(
				"/evaluation/evaluations/",
				evaluationData,
			);
			setEvaluations([...evaluations, response.data.data]);
			return response.data.data;
		} catch (error) {
			console.error("Error creating evaluation:", error);
			throw error;
		}
	};
	const handleOpenEvaluation = (evaluation) => {
		setSelectedEvaluation(evaluation);
		const scheduleObj = schedules.find((s) => s.id === evaluation.schedule);
		console.log("Schedules:", schedules);
		console.log("Evaluation.schedule:", evaluation.schedule);
		console.log("Matched scheduleObj:", scheduleObj);
		setSelectedSchedule(scheduleObj || null);
		setModalOpen("copus-matrix");
	};

	const updateEvaluation = async (
		id: number,
		evaluationData: Partial<Evaluation>,
	) => {
		try {
			const response = await api.put(
				`/evaluation/evaluations/${id}/`,
				evaluationData,
			);
			setEvaluations(
				evaluations.map((evaluation) =>
					evaluation.id === id
						? { ...evaluation, ...response.data }
						: evaluation,
				),
			);
			return response.data;
		} catch (error) {
			console.error("Error updating evaluation:", error);
			throw error;
		}
	};

	const deleteEvaluation = async (id: number) => {
		try {
			await api.delete(`/evaluation/evaluations/${id}/`);
			setEvaluations(
				evaluations.filter((evaluation) => evaluation.id !== id),
			);
		} catch (error) {
			console.error("Error deleting evaluation:", error);
			throw error;
		}
	};

	useEffect(() => {
		async function fetchData() {
			setLoading(true);
			try {
				const [evalRes, schedRes, progRes, progProfRes] =
					await Promise.all([
						api.get("/evaluation/evaluations/"),
						api.get("/schedule/schedules/"),
						api.get("/program/programs/"),
						api.get("/program-professor/program-professors/"),
					]);
				setEvaluations(evalRes.data);
				setSchedules(schedRes.data);
				setPrograms(progRes.data);
				setProgramProfessors(progProfRes.data);
			} catch (err) {
				console.error("Error fetching data:", err);
				setError("Failed to load data. Please try again later.");
			} finally {
				setLoading(false);
			}
		}
		fetchData();
	}, []);

	const professors = Array.from(
		new Map(
			programProfessors.map((pp) => [pp.professor, pp.professor_details]),
		).values(),
	);

	const getProfessorSchedules = (prof: Professor) =>
		schedules.filter((s) => s.instructor === prof.id);
	const getProfessorEvaluations = (prof: Professor) => {
		const profSchedules = getProfessorSchedules(prof).map((s) => s.id);
		return evaluations.filter((e) => profSchedules.includes(e.schedule));
	};

	const COPUS_TYPE_CHOICES = [
		{ value: "copus_1", label: "COPUS 1" },
		{ value: "copus_2", label: "COPUS 2" },
		{ value: "copus_3", label: "COPUS 3" },
	];

	const getEvaluationByType = (prof: Professor, copusType: string) => {
		const profEvals = getProfessorEvaluations(prof);
		return profEvals.find((e) => e.evaluation_type === copusType);
	};

	const filteredProfessors = professors.filter((prof) =>
		`${prof.first_name} ${prof.last_name}`
			.toLowerCase()
			.includes(searchProfessor.toLowerCase()),
	);

	const firstName = localStorage.getItem("firstName") || "User";

	if (loading) return <div className="text-white">Loading...</div>;
	return (
		<div className="custom-container gap-y-6">
			<div className="breadcrumbs text-md text-white">
				<ul>
					<li>
						<a onClick={() => setActiveView("home")}>Home</a>
					</li>
					<li>Evaluation</li>
				</ul>
			</div>
			<h2 className="mt-4 text-3xl font-bold text-white">
				Copus Evaluation Forms
			</h2>



			{/* Search Filters */}
			<div className="flex w-full flex-row items-center justify-center gap-1 border-b-2 border-gray-600 px-4 pb-2 text-black shadow-xl backdrop-blur-lg md:gap-6">
				<input
					type="text"
					className="input w-full max-w-md border border-gray-300"
					placeholder="Professor"
					value={searchProfessor}
					onChange={(e) => setSearchProfessor(e.target.value)}
					list="professor-list"
				/>
				<datalist id="professor-list">
					{professors.map((prof, index) => (
						<option
							key={index}
							value={`${prof.first_name} ${prof.last_name}`}
						/>
					))}
				</datalist>

				<input
					type="text"
					className="input w-full max-w-md border border-gray-300"
					placeholder="Year & Semester"
					value={searchSemester}
					onChange={(e) => setSearchSemester(e.target.value)}
					list="year-semester-list"
				/>
				<datalist id="year-semester-list">
					{Array.from(
						new Set(
							schedules.map((s) => `${s.year} ${s.semester}`),
						),
					).map((item, index) => (
						<option key={index} value={item} />
					))}
				</datalist>
			</div>

			{/* Professors Table */}
			<div className="w-full overflow-x-auto text-white shadow-xl backdrop-blur-lg">
				<table className="table">
					<thead className="bg-[#1c402a]/50 text-xl font-bold text-white shadow-xl">
						<tr>
							<th>Course and Professor</th>
						</tr>
					</thead>
					<tbody className="text-lg text-white">
						{filteredProfessors.map((prof, index) => {
							const profSchedules = getProfessorSchedules(prof);
							const profEvaluations =
								getProfessorEvaluations(prof);
							const modalId = `modal-${prof.id}`;

							return (
								<tr key={prof.id}>
									<td>
										<div className="collapse-arrow collapse rounded-md shadow-2xl backdrop-blur-lg">
											<input type="checkbox" />
											<div className="collapse-title bg-[#1c402a]/50 text-xl font-semibold">
												{prof.first_name}{" "}
												{prof.last_name}
											</div>
											<div
												className="z-50 flex items-center justify-center gap-x-3 bg-[#1c402a]/50 py-3"
												onClick={(e) =>
													e.stopPropagation()
												}
											>
												{/* COPUS Type Buttons */}
												{(() => {
													// Find the first missing COPUS type for this professor
													const firstMissingType =
														COPUS_TYPE_CHOICES.find(
															(copus) =>
																!getEvaluationByType(
																	prof,
																	copus.value,
																),
														);
													return COPUS_TYPE_CHOICES.map(
														(copus) => {
															const evalForType =
																getEvaluationByType(
																	prof,
																	copus.value,
																);
															if (evalForType) {
																// Show Edit button for existing evaluation
																return (
																	<label
																		key={
																			copus.value
																		}
																		className="btn mx-1 cursor-pointer bg-[#1b2e3e] text-white hover:bg-[#4e6e88]"
																	>
																		<button
																			type="button"
																			onClick={() => {
																				setSelectedEvaluation(
																					evalForType,
																				);
																				setSelectedProfessor(
																					prof,
																				);
																				setModalOpen(
																					"copus-matrix",
																				);
																				handleOpenEvaluation(
																					evalForType,
																				);
																			}}
																		>
																			{`Edit ${copus.label}`}
																		</button>
																	</label>
																);
															} else if (
																copus.value ===
																firstMissingType?.value
															) {
																// Show only one New button for the first missing type
																return (
																	<label
																		key={
																			copus.value
																		}
																		className="btn mx-1 cursor-pointer bg-gray-300 text-white hover:bg-gray-500"
																	>
																		<button
																			type="button"
																			onClick={() => {
																			  setSelectedProfessor(prof); // <-- use 'prof' from the map, not 'professor'
																			  (
																				document.getElementById("create_new_copus") as HTMLDialogElement
																			  )?.showModal();
																			}}
																		  >
																			{`New ${copus.label}`}
																		</button>
																	</label>
																);
															}
															// Otherwise, don't show a button
															return null;
														},
													);
												})()}
											</div>
											<div className="collapse-content flex bg-black/20 text-lg">
												<div className="flex h-full w-full flex-col justify-center">
													<div className="flex flex-row">
														<div className="avatar mt-3">
															<div className="h-24 w-24 rounded-full">
																<img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
															</div>
														</div>
														<div className="ml-6 flex w-full flex-col justify-center border-b-2 border-gray-300">
															<div>
																Department:{" "}
																<strong>
																	{prof.department ||
																		"N/A"}
																</strong>
															</div>
															{profSchedules.length >
																0 && (
																<>
																	<div>
																		Room and
																		Subject:{" "}
																		<strong>
																			{
																				profSchedules[0]
																					.room
																			}{" "}
																			{
																				profSchedules[0]
																					.subject
																			}
																		</strong>
																	</div>
																	<div>
																		Year and
																		Semester:{" "}
																		<strong>
																			{
																				profSchedules[0]
																					.year
																			}{" "}
																			{
																				profSchedules[0]
																					.semester
																			}
																		</strong>
																	</div>
																</>
															)}
														</div>
													</div>
													<div className="mt-3">
														<table className="table w-full border-b-2 border-gray-300">
															<thead className="text-gray-300">
																<tr>
																	<th>
																		Evaluated
																		Subject
																	</th>
																	<th>
																		Schedule
																	</th>
																</tr>
															</thead>
															<tbody>
																{profSchedules.map(
																	(
																		schedule,
																		schedIndex,
																	) => (
																		<tr
																			key={
																				schedIndex
																			}
																		>
																			<td>
																				{
																					schedule.subject
																				}
																			</td>
																			<td>
																				{
																					schedule.name
																				}
																			</td>
																		</tr>
																	),
																)}
															</tbody>
														</table>
													</div>
												</div>
											</div>
										</div>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>

			{/* Create New Copus Modal */}

			<dialog id="create_new_copus" className="modal">
				<div className="modal-box w-11/12 max-w-5xl">
					<h3 className="mb-4 text-center text-2xl font-bold">
						New Copus
					</h3>
					<CreateEvaluationForm
						  onSuccess={(newEvaluation) => {
							setEvaluations([...evaluations, newEvaluation]);
							// Detector: if the new evaluation's date is today, open Copus Matrix modal
							if (newEvaluation.observation_date === getToday()) {
							  setSelectedEvaluation(newEvaluation);
							  setSelectedProfessor(selectedProfessor);
							  const scheduleObj = schedules.find((s) => s.id === newEvaluation.schedule);
							  setSelectedSchedule(scheduleObj || null);
							  setModalOpen("copus-matrix");
							} else {
							  setModalOpen(null);
							}
							const dialog = document.getElementById("create_new_copus") as HTMLDialogElement;
  							if (dialog) dialog.close();
						  }}
						  schedules={schedules}
						  initialInstructor={selectedProfessor}
						/>
				</div>
			</dialog>

			{/* View/Edit Copus Modal */}
			{selectedEvaluation && selectedProfessor && (
				<dialog open className="modal">
					<div className="modal-box max-h-full w-full max-w-5xl text-black">
						<h3 className="mt-2 mb-6 text-xl font-bold">
							{selectedProfessor.first_name}{" "}
							{selectedProfessor.last_name} - COPUS Evaluation -{" "}
							{selectedEvaluation.evaluation_type}
						</h3>

						{/* Basic Information */}
						<div className="collapse-arrow collapse mb-4 border-1 border-gray-300">
							<input type="checkbox" />
							<div className="collapse-title text-lg font-semibold">
								Basic Information
							</div>

							<div className="collapse-content space-y-2">
								<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
									<div className="input w-full bg-transparent">
										<span className="text-gray-400">
											Role:
										</span>
										<span className="text-black">
											{" "}
											{firstName}
										</span>
									</div>
									<div className="input input-bordered w-full bg-transparent">
										<span className="text-gray-400">
											Date:
										</span>
										<span className="text-black">
											{" "}
											{
												selectedEvaluation.observation_date
											}
										</span>
									</div>

									<div className="input input-bordered w-full bg-transparent">
										<span className="text-gray-400">
											Name of Evaluated:
										</span>
										<span className="text-black">
											{" "}
											{`${selectedProfessor.first_name} ${selectedProfessor.last_name}`}
										</span>
									</div>

									<div className="input input-bordered w-full bg-transparent">
										<span className="text-gray-400">
											Section:
										</span>
										<span className="text-black">
											{" "}
											{selectedSchedule?.section_name ||
												""}
										</span>
									</div>
									<div className="input input-bordered w-full bg-transparent">
										<span className="text-gray-400">
											Subject:
										</span>
										<span className="text-black">
											{" "}
											{selectedSchedule?.subject_name ||
												""}
										</span>
									</div>
									<div className="input input-bordered w-full bg-transparent">
										<span className="text-gray-400">
											Room:
										</span>
										<span className="text-black">
											{" "}
											{selectedSchedule?.room_name || ""}
										</span>
									</div>
									<div className="input input-bordered w-full bg-transparent">
										<span className="text-gray-400">
											Program:
										</span>
										<span className="text-black">
											{" "}
											{selectedSchedule?.program_name ||
												"Null"}
										</span>
									</div>
									<div className="input input-bordered w-full bg-transparent">
										<span className="text-gray-400">
											Start Time:
										</span>
										<span className="text-black">
											{" "}
											{selectedSchedule?.start_time || ""}
										</span>
									</div>
									<div className="input input-bordered w-full bg-transparent">
										<span className="text-gray-400">
											End Time:
										</span>
										<span className="text-black">
											{" "}
											{selectedSchedule?.end_time || ""}
										</span>
									</div>
									<div className="input input-bordered w-full bg-transparent">
										<span className="text-gray-400">
											Semester:
										</span>
										<span className="text-black">
											{" "}
											{selectedSchedule?.semester || ""}
										</span>
									</div>
								</div>
							</div>
						</div>

						{/* COPUS Matrix */}
						<CopusMatrix
							onTalliesUpdate={(student, teacher) => {
								setEvaluationTallies((prev) => ({
									...prev,
									[selectedEvaluation.id]: {
										studentTallies: student,
										teacherTallies: teacher,
									},
								}));
							}}
							evaluationId={selectedEvaluation.id}
						/>

						{/* COPUS Summary Chart */}
						<div className="mt-6 flex flex-col items-center justify-center gap-6 md:flex-row">
							<PieChartWithTable
								studentTallies={
									evaluationTallies[selectedEvaluation.id]
										?.studentTallies || {}
								}
								teacherTallies={
									evaluationTallies[selectedEvaluation.id]
										?.teacherTallies || {}
								}
							/>
						</div>

						{/* AI Feedback */}
						<div className="collapse-arrow collapse mb-4 border-1 border-gray-300">
							<input type="checkbox" />
							<div className="collapse-title text-lg font-semibold">
								Assisted Summary
								{aiFeedbackLoading && (
									<span className="ml-4 text-sm text-gray-500">
										Loading...
									</span>
								)}
							</div>
							<div className="collapse-content">
								<div className="mb-2 flex items-center">
									{aiFeedback === null &&
										!aiFeedbackLoading && (
											<button
												className="btn btn-primary btn-xs mr-4"
												onClick={
													handleGenerateAIFeedback
												}
												disabled={aiFeedbackLoading}
												type="button"
											>
												Generate AI Feedback
											</button>
										)}
									{aiFeedbackError && (
										<div className="text-red-500">
											{aiFeedbackError}
										</div>
									)}
								</div>
								<textarea
									id="ai-feedback-textarea"
									className="textarea min-h-[700px] w-full"
									placeholder="AI feedback will appear here..."
									value={aiFeedback || ""}
									readOnly
								/>
							</div>
						</div>

						{/* Actions */}
						<div className="modal-action">
							<form
								method="dialog"
								className="flex flex-wrap gap-3"
							>
								<button
									className="btn btn-primary px-6 text-white"
									onClick={() => {
										setModalOpen(null);
										setSelectedEvaluation(null);
										setSelectedProfessor(null);
										setSelectedSchedule(null);
									}}
								>
									Save and Exit
								</button>

								<button
									type="submit"
									className="btn btn-cancel text-white"
									onClick={() => {
										setModalOpen(null);
										setSelectedEvaluation(null);
										setSelectedProfessor(null);
										setSelectedSchedule(null);
									}}
								>
									Close
								</button>
							</form>
						</div>
					</div>
				</dialog>
			)}
		</div>
	);
}

export default Evaluation;
