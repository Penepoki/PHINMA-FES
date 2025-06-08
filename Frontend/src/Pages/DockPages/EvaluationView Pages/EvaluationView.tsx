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

	const createEvaluation = async (evaluationData: Partial<Evaluation>) => {
	  try {
		const response = await api.post('/evaluation/evaluations/', evaluationData);
		setEvaluations([...evaluations, response.data.data]);
		return response.data.data;
	  } catch (error) {
		console.error('Error creating evaluation:', error);
		throw error;
	  }
	};

	const updateEvaluation = async (id: number, evaluationData: Partial<Evaluation>) => {
	  try {
		const response = await api.put(`/evaluation/evaluations/${id}/`, evaluationData);
		setEvaluations(evaluations.map(evaluation =>
		  evaluation.id === id ? { ...evaluation, ...response.data } : evaluation
		));
		return response.data;
	  } catch (error) {
		console.error('Error updating evaluation:', error);
		throw error;
	  }
	};

	const deleteEvaluation = async (id: number) => {
	  try {
		await api.delete(`/evaluation/evaluations/${id}/`);
		setEvaluations(evaluations.filter(evaluation => evaluation.id !== id));
	  } catch (error) {
		console.error('Error deleting evaluation:', error);
		throw error;
	  }
	};

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
	  return profEvals.find(e => e.evaluation_type === copusType);
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
												{/* COPUS Type Buttons */}
{(() => {
  // Find the first missing COPUS type for this professor
  const firstMissingType = COPUS_TYPE_CHOICES.find(
    copus => !getEvaluationByType(prof, copus.value)
  );
  return COPUS_TYPE_CHOICES.map((copus) => {
    const evalForType = getEvaluationByType(prof, copus.value);
    if (evalForType) {
      // Show Edit button for existing evaluation
      return (
        <label
          key={copus.value}
          className="btn cursor-pointer bg-gray-200 text-black hover:bg-gray-300 mx-1"
        >
          <button
            type="button"
            onClick={() => {
              setSelectedEvaluation(evalForType);
              setSelectedProfessor(prof);
              setModalOpen("copus-matrix");
            }}
            className="rounded px-5 py-2 text-white bg-[#2c503a] hover:bg-[#1c402a]"
          >
            {`Edit ${copus.label}`}
          </button>
        </label>
      );
    } else if (copus.value === firstMissingType?.value) {
      // Show only one New button for the first missing type
      return (
        <label
          key={copus.value}
          className="btn cursor-pointer bg-gray-200 text-black hover:bg-gray-300 mx-1"
        >
          <button
            type="button"
            onClick={async () => {
              const profSchedules = getProfessorSchedules(prof);
              if (profSchedules.length === 0) {
                alert("No schedule found for this professor.");
                return;
              }
              const newEvalData = {
                schedule: profSchedules[0].id,
                observation_date: new Date().toISOString().split('T')[0],
                evaluation_type: copus.value,
                instructor: prof.id,
              };
              try {
                const created = await createEvaluation(newEvalData);
                setSelectedEvaluation(created);
                setSelectedProfessor(prof);
                setModalOpen("copus-matrix");
              } catch (err) {
                alert("Failed to create evaluation.");
              }
            }}
            className="rounded px-5 py-2 text-white bg-blue-600 hover:bg-blue-700"
          >
            {`New ${copus.label}`}
          </button>
        </label>
      );
    }
    // Otherwise, don't show a button
    return null;
  });
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
																Department: {" "}
																<strong>
																	{prof.department || "N/A"}
																</strong>
															</div>
															{profSchedules.length > 0 && (
																<>
																	<div>
																		Room and Subject: {" "}
																		<strong>
																			{profSchedules[0].room} {profSchedules[0].subject}
																		</strong>
																	</div>
																	<div>
																		Year and Semester: {" "}
																		<strong>
																			{profSchedules[0].year} {profSchedules[0].semester}
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
																	<th>Evaluated Subject</th>
																	<th>Schedule</th>
																</tr>
															</thead>
															<tbody>
																{profSchedules.map((schedule, schedIndex) => (
																	<tr key={schedIndex}>
																		<td>{schedule.subject}</td>
																		<td>{schedule.name}</td>
																	</tr>
																))}
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
			{modalOpen === "create-new-copus" && (
				<dialog open className="modal">
					<div className="modal-box w-11/12 max-w-5xl">
						<h3 className="mb-4 text-center text-2xl font-bold">
							New Copus
						</h3>
						<CreateEvaluationForm
						  onSuccess={(newEvaluation) => {
							setEvaluations([...evaluations, newEvaluation]);
							setModalOpen(null);
						  }}
						  schedules={schedules}
						/>
						<div className="modal-action">
							<button
								type="button"
								className="btn btn-cancel"
								onClick={() => setModalOpen(null)}
							>
								Cancel
							</button>
						</div>
					</div>
				</dialog>
			)}

			{/* View/Edit Copus Modal */}
			{selectedEvaluation && selectedProfessor && (
				<dialog open className="modal">
					<div className="modal-box w-11/12 max-w-5xl text-black">
						<h3 className="mb-4 text-xl font-bold">
							{selectedProfessor.first_name} {selectedProfessor.last_name} - COPUS Evaluation
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
										value={selectedEvaluation.observation_date}
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

			{modalOpen === "copus-matrix" && selectedEvaluation && (
			  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
				<div className="relative w-full max-w-4xl p-6 bg-white rounded-md shadow-xl">
				  <button
					onClick={() => setModalOpen(null)}
					className="absolute top-4 right-4 text-gray-700 hover:text-gray-900"
				  >
					✖
				  </button>
				  <h2 className="mb-4 text-2xl font-semibold text-gray-800">
					Evaluation: {selectedEvaluation.evaluation_type} - {" "}
					{selectedEvaluation.observation_date}
				  </h2>
				  <CopusMatrix
					onTalliesUpdate={(studentTallies, teacherTallies) => {
					  console.log("Updated Tallies:", studentTallies, teacherTallies);
					}}
					// Pass the selected evaluation's ID to CopusMatrix
				  />

				  {/* Patch All Timestamps Button */}
				  <button
					className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
					onClick={async () => {
					  if (!selectedEvaluation) return;
					  try {
						const response = await api.get(`/evaluation/timestamps/?evaluation_id=${selectedEvaluation.id}`);
						const timestamps = response.data;
						for (const ts of timestamps) {
						  await api.put(`/evaluation/timestamps/${ts.id}/`, { ...ts, patched: true });
						}
						alert('All timestamps patched successfully!');
					  } catch (err) {
						console.error('Error patching timestamps:', err);
						alert('Failed to patch timestamps.');
					  }
					}}
				  >
					Patch All Timestamps
				  </button>
				</div>
			  </div>
			)}

		</div>
	);
}

export default Evaluation;
