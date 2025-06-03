import { useEffect, useState } from "react";
import CopusMatrix from "../../../Components/Evaluation Components/Copus Matrix";
import PieChartWithTable from "../../../Components/Evaluation Components/Piechart with Table";
import api from "../../../utils/api";
import { ActivityData } from "../../../Components/Evaluation Components/Copus Matrix";
import CreateEvaluationForm from '../../../Components/Evaluation Components/CreateEvaluationForm';


interface Evaluation {
	id: number;
	schedule: number;
	observation_date: string;
	evaluation_type: string;
	additional_comments?: string;
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

interface CreateEvaluationProps {
  onSuccess: (evaluation: any) => void;
  schedules: Schedule[];
}

function Evaluation({ setActiveView }: EvalProps) {
	const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
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
		// Add this function to EvaluationView.tsx
	const createEvaluation = async (evaluationData: Partial<Evaluation>) => {
	  try {
		const response = await api.post('/evaluation/evaluations/', evaluationData);
		// Add the new evaluation to the state
		setEvaluations([...evaluations, response.data.data]);
		return response.data.data;
	  } catch (error) {
		console.error('Error creating evaluation:', error);
		throw error;
	  }
	};

	// Add this function to EvaluationView.tsx
	const updateEvaluation = async (id: number, evaluationData: Partial<Evaluation>) => {
	  try {
		const response = await api.put(`/evaluation/evaluations/${id}/`, evaluationData);
		// Update the evaluation in the state
		setEvaluations(evaluations.map(evaluation =>
		  evaluation.id === id ? { ...evaluation, ...response.data } : evaluation
		));

		return response.data;
	  } catch (error) {
		console.error('Error updating evaluation:', error);
		throw error;
	  }
	};

		// Add this function to EvaluationView.tsx
	const deleteEvaluation = async (id: number) => {
	  try {
		await api.delete(`/evaluation/evaluations/${id}/`);
		// Remove the evaluation from the state
		setEvaluations(evaluations.filter(evaluation => evaluation.id !== id));
	  } catch (error) {
		console.error('Error deleting evaluation:', error);
		throw error;
	  }
	};

		// Enhance your existing useEffect in EvaluationView.tsx
	useEffect(() => {
	  async function fetchData() {
		setLoading(true);
		try {
		  const [evalRes, schedRes, progRes, progProfRes] = await Promise.all([
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
		  // Add error state handling here
		  setError("Failed to load data. Please try again later.");
		} finally {
		  setLoading(false);
		}
	  }
	  fetchData();
	}, []);

	// Group by professor
	const professors = Array.from(
		new Map(
			programProfessors.map((pp) => [pp.professor, pp.professor_details]),
		).values(),
	);

	// For each professor, get their schedules and evaluations
	const getProfessorSchedules = (prof: Professor) =>
		schedules.filter((s) => s.instructor === prof.id);
	const getProfessorEvaluations = (prof: Professor) => {
		const profSchedules = getProfessorSchedules(prof).map((s) => s.id);
		return evaluations.filter((e) => profSchedules.includes(e.schedule));
	};

	// Filter professors based on search
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

			{/* Create New Copus Button */}
			<div className="flex w-full items-start justify-center border-b-2 border-b-gray-600 px-4 pb-2 shadow-xl md:justify-end">
				<button
					onClick={() => setModalOpen("create-new-copus")}
					className="flex w-auto rounded-lg bg-[#1c402a] px-5 py-2 whitespace-nowrap text-white shadow-xl transition-transform hover:scale-105"
				>
					Create New Copus
				</button>
			</div>

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
					placeholder="Schedule"
					value={searchSchedule}
					onChange={(e) => setSearchSchedule(e.target.value)}
					list="room-subject-list"
				/>
				<datalist id="room-subject-list">
					{schedules.map((schedule, index) => (
						<option
							key={index}
							value={`${schedule.room} ${schedule.subject}`}
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
												{profEvaluations.map(
													(evaluation, evalIndex) => (
														<label
															key={evaluation.id}
															className="btn cursor-pointer bg-gray-200 text-black hover:bg-gray-300"
														>
															<input
																name={`copus-${prof.id}`}
																className="hidden"
																onClick={() => {
																	setModalOpen(
																		`copus-${evaluation.id}`,
																	);
																	setSelectedEvaluation(
																		evaluation,
																	);
																	setSelectedProfessor(
																		prof,
																	);
																	setSelectedSchedule(
																		profSchedules.find(
																			(
																				s,
																			) =>
																				s.id ===
																				evaluation.schedule,
																		) ||
																			null,
																	);
																}}
															/>
															Copus{" "}
															{evalIndex + 1}
														</label>
													),
												)}
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
														{profEvaluations.length >
															0 && (
															<div className="mt-6 flex flex-col items-center justify-center gap-6 md:flex-row">
																<PieChartWithTable
																	studentTallies={
																		evaluationTallies[
																			profEvaluations[0]
																				.id
																		]
																			?.studentTallies ||
																		{}
																	}
																	teacherTallies={
																		evaluationTallies[
																			profEvaluations[0]
																				.id
																		]
																			?.teacherTallies ||
																		{}
																	}
																/>
															</div>
														)}
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

						{showCreateForm ? (
			  <div className="p-4 bg-white rounded shadow">
				<CreateEvaluationForm
				  onSuccess={(newEvaluation) => {
					setEvaluations([...evaluations, newEvaluation]);
					setShowCreateForm(false);
				  }}
				  schedules={schedules}
				/>
				<button
				  className="mt-2 text-gray-500"
				  onClick={() => setShowCreateForm(false)}
				>
				  Cancel
				</button>
			  </div>
			) : (
			  <button
				className="px-4 py-2 bg-[#1c402a] text-white rounded hover:bg-[#2a5e3e]"
				onClick={() => setShowCreateForm(true)}
			  >
				Create New Evaluation
			  </button>
			)}

			{/* Create New Copus Modal */}
			{modalOpen === "create-new-copus" && (
				<dialog open className="modal">
					<div className="modal-box w-11/12 max-w-5xl">
						<h3 className="mb-4 text-center text-2xl font-bold">
							New Copus
						</h3>
						<form method="dialog" className="flex flex-col gap-6">
							{/* Professor Dropdown */}
							<div className="flex flex-col gap-2 md:flex-row md:items-center">
								<label className="text-left text-lg font-bold md:w-1/4">
									Professor:
								</label>
								<select
									className="input input-bordered w-full"
									required
									onChange={(e) => {
										const prof = professors.find(
											(p) =>
												p.id === Number(e.target.value),
										);
										setSelectedProfessor(prof || null);
									}}
								>
									<option value="">Select professor</option>
									{professors.map((prof) => (
										<option key={prof.id} value={prof.id}>
											{prof.first_name} {prof.last_name}
										</option>
									))}
								</select>
							</div>

							{/* Schedule Dropdown */}
							<div className="flex flex-col gap-2 md:flex-row md:items-center">
								<label className="text-left text-lg font-bold md:w-1/4">
									Schedule:
								</label>
								<select
									className="input input-bordered w-full"
									required
									disabled={!selectedProfessor}
									onChange={(e) => {
										const sched = schedules.find(
											(s) =>
												s.id === Number(e.target.value),
										);
										setSelectedSchedule(sched || null);
									}}
								>
									<option value="">Select schedule</option>
									{selectedProfessor &&
										getProfessorSchedules(
											selectedProfessor,
										).map((s) => (
											<option key={s.id} value={s.id}>
												{s.name} - {s.room} {s.subject}
											</option>
										))}
								</select>
							</div>

							{/* Date */}
							<div className="flex flex-col gap-2 md:flex-row md:items-center">
								<label className="text-left text-lg font-bold md:w-1/4">
									Observation Date:
								</label>
								<input
									type="date"
									className="input input-bordered w-full"
									required
								/>
							</div>

							{/* Evaluation Type */}
							<div className="flex flex-col gap-2 md:flex-row md:items-center">
								<label className="text-left text-lg font-bold md:w-1/4">
									Evaluation Type:
								</label>
								<input
									type="text"
									className="input input-bordered w-full"
									required
								/>
							</div>

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
									onClick={() => setModalOpen(null)}
								>
									Cancel
								</button>
							</div>
						</form>
					</div>
				</dialog>
			)}

			{/* View/Edit Copus Modal */}
			{selectedEvaluation && selectedProfessor && (
				<dialog open className="modal">
					<div className="modal-box w-11/12 max-w-5xl text-black">
						<h3 className="mb-4 text-xl font-bold">
							{selectedProfessor.first_name}{" "}
							{selectedProfessor.last_name} - COPUS Evaluation
						</h3>

						{/* Basic Information */}
						<div className="collapse-arrow collapse mb-4 border-1 border-gray-300">
							<input type="checkbox" />
							<div className="collapse-title text-lg font-semibold">
								Basic Information
							</div>
							<div className="collapse-content space-y-2">
								<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
									<input
										type="text"
										value={firstName}
										className="input input-bordered w-full"
										readOnly
									/>
									<input
										type="date"
										value={
											selectedEvaluation.observation_date
										}
										className="input input-bordered w-full"
										readOnly
									/>
									<input
										type="text"
										value={`${selectedProfessor.first_name} ${selectedProfessor.last_name}`}
										readOnly
										className="input input-bordered w-full"
									/>
									<input
										type="text"
										value={selectedSchedule?.room || ""}
										readOnly
										className="input input-bordered w-full"
									/>
									<input
										type="text"
										value={selectedSchedule?.semester || ""}
										readOnly
										className="input input-bordered w-full"
									/>
									<input
										type="text"
										value={selectedSchedule?.year || ""}
										readOnly
										className="input input-bordered w-full"
									/>
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

						{/* Additional Information */}
						<div className="collapse-arrow collapse mb-4 border-1 border-gray-300">
							<input type="checkbox" />
							<div className="collapse-title text-lg font-semibold">
								Additional Information
							</div>
							<div className="collapse-content">
								<textarea
									className="textarea textarea-bordered min-h-[100px] w-full"
									placeholder="Enter any additional comments or observations here..."
									defaultValue={
										selectedEvaluation.additional_comments ||
										""
									}
									readOnly
								></textarea>
							</div>
						</div>

						{/* Actions */}
						<div className="modal-action">
							<form method="dialog">
								<button
									type="submit"
									className="btn bg-[#1c402a] text-white"
									onClick={() => setModalOpen(null)}
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
