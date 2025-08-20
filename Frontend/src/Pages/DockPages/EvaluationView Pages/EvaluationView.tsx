import { useEffect, useMemo, useRef, useState } from "react";
import CopusMatrix from "../../../Components/Evaluation Components/Copus Matrix";
import PieChartWithTable from "../../../Components/Evaluation Components/Piechart with Table";
import api from "../../../utils/api";
import { ActivityData } from "../../../Components/Evaluation Components/Copus Matrix";
import CreateEvaluationForm from "../../../Components/Evaluation Components/CreateEvaluationForm";
import CopusSummaryTable from "../../../Components/Evaluation Components/CopusSummaryTable.tsx";
import { generateAIFeedback } from "../../../utils/api";
import * as Fetcher from "../../../utils/fetcher.ts";
import * as Interfaces from "../../../Types/Interfaces.ts";
import BreadAndLogout from "../../../Components/Bread and Logout.tsx";

interface EvalProps {
  setActiveView: (view: string) => void;
}

function Evaluation({ setActiveView }: EvalProps) {
  const [evaluations, setEvaluations] = useState<Interfaces.Evaluation[]>([]);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [aiFeedbackLoading, setAiFeedbackLoading] = useState(false);
  const [aiFeedbackError, setAiFeedbackError] = useState<string | null>(null);
  const [schedules, setSchedules] = useState<Interfaces.Schedule[]>([]);
  const [programProfessors, setProgramProfessors] = useState<Interfaces.ProgramProfessor[]>([]);
  const [evaluationTallies, setEvaluationTallies] = useState<{
    [evaluationId: number]: {
      studentTallies: Record<string, ActivityData>;
      teacherTallies: Record<string, ActivityData>;
    };
  }>({});
  const [selectedProfessor, setSelectedProfessor] = useState<Interfaces.Professor | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<Interfaces.Schedule | null>(null);
  const [selectedEvaluation, setSelectedEvaluation] = useState<Interfaces.Evaluation | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchProfessor, setSearchProfessor] = useState("");
  const [searchSemester, setSearchSemester] = useState("");
  const [error, setError] = useState<string | null>(null);

  // NEW: modal refs (always-mounted)
  const viewModalRef = useRef<HTMLDialogElement>(null);
  const summaryModalRef = useRef<HTMLDialogElement>(null);
  const openViewModal = () => viewModalRef.current?.showModal();
  const closeViewModal = () => viewModalRef.current?.close();
  const openSummaryModal = () => {
    setIsSummaryOpen(true);
    summaryModalRef.current?.showModal();
  };
  const closeSummaryModal = () => {
    setIsSummaryOpen(false);
    summaryModalRef.current?.close();
  };
  const [isSummaryOpen, setIsSummaryOpen] = useState(false); // only to trigger summary tallies effect

  const getToday = () => new Date().toISOString().split("T")[0];

  // Load initial data
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [evalData, evalProfessor, evalSchedules] = await Promise.all([
          Fetcher.evaluationFetcher(),
          Fetcher.programProfessorFetcher(),
          Fetcher.schedulesFetcher(),
        ]);
        setEvaluations(evalData);
        setProgramProfessors(evalProfessor);
        setSchedules(evalSchedules);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Prefetch AI feedback when a specific evaluation is selected (view modal path)
  useEffect(() => {
    if (selectedEvaluation?.id) {
      setAiFeedbackLoading(true);
      setAiFeedbackError(null);
      api
        .get(`/evaluation/evaluations/${selectedEvaluation.id}/`)
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
    } catch {
      setAiFeedbackError("Failed to generate AI feedback.");
    } finally {
      setAiFeedbackLoading(false);
    }
  };

  const createEvaluation = async (evaluationData: Partial<Interfaces.Evaluation>) => {
    try {
      const response = await api.post("/evaluation/evaluations/", evaluationData);
      setEvaluations((prev) => [...prev, response.data.data]);
      return response.data.data;
    } catch (error) {
      console.error("Error creating evaluation:", error);
      throw error;
    }
  };

  const handleOpenEvaluation = (evaluation: Interfaces.Evaluation) => {
    setSelectedEvaluation(evaluation);
    const scheduleObj = schedules.find((s) => s.id === evaluation.schedule) || null;
    setSelectedSchedule(scheduleObj);
    openViewModal();
  };

  const updateEvaluation = async (id: number, evaluationData: Partial<Interfaces.Evaluation>) => {
    try {
      const response = await api.put(`/evaluation/evaluations/${id}/`, evaluationData);
      setEvaluations((prev) => prev.map((e) => (e.id === id ? { ...e, ...response.data } : e)));
      return response.data;
    } catch (error) {
      console.error("Error updating evaluation:", error);
      throw error;
    }
  };

  const deleteEvaluation = async (id: number) => {
    try {
      await api.delete(`/evaluation/evaluations/${id}/`);
      setEvaluations((prev) => prev.filter((e) => e.id !== id));
    } catch (error) {
      console.error("Error deleting evaluation:", error);
      throw error;
    }
  };

  // Derived data
  const professors = useMemo(
    () =>
      Array.from(
        new Map(programProfessors.map((pp) => [pp.professor, pp.professor_details])).values(),
      ),
    [programProfessors],
  );

  const getProfessorSchedules = (prof: Interfaces.Professor) =>
    schedules.filter((s) => s.instructor === prof.id);

  const getProfessorEvaluations = (prof: Interfaces.Professor) => {
    const profSchedules = getProfessorSchedules(prof).map((s) => s.id);
    return evaluations.filter((e) => profSchedules.includes(e.schedule));
  };

  const COPUS_TYPE_CHOICES = [
    { value: "copus_1", label: "COPUS 1" },
    { value: "copus_2", label: "COPUS 2" },
    { value: "copus_3", label: "COPUS 3" },
  ] as const;

  const getEvaluationByType = (prof: Interfaces.Professor, copusType: string) =>
    getProfessorEvaluations(prof).find((e) => e.evaluation_type === copusType);

  const studentOptions = [
    "Listening",
    "Individual Thinking",
    "Group",
    "Answer Question",
    "Ask Question",
    "Whole Class Discussion",
    "Student Presentations",
    "Test/Quiz",
    "Waiting",
    "Other",
  ];

  const teacherOptions = [
    "Lecture",
    "Realtime Writing",
    "Moving/Guiding",
    "Answer Questions",
    "Pose Question",
    "Follow-up Question",
    "1-on-1 discussion",
    "Demonstrative",
    "Administrative",
    "Waiting",
    "Other",
  ];

  const filteredProfessors = professors.filter((prof) =>
    `${prof.first_name} ${prof.last_name}`.toLowerCase().includes(searchProfessor.toLowerCase()),
  );

  const firstName = localStorage.getItem("firstName") || "User";

  // Bulk tallies when opening summary (uses isSummaryOpen flag)
  useEffect(() => {
    if (isSummaryOpen && selectedProfessor) {
      const copusEvals = getProfessorEvaluations(selectedProfessor).filter((e) =>
        ["copus_1", "copus_2", "copus_3"].includes(e.evaluation_type),
      );
      if (copusEvals.length > 0) {
        const evalIds = copusEvals.map((e) => e.id).join(",");
        (async () => {
          const res = await api.get(`/copus/bulk-tallies/?evaluation_ids=${evalIds}`);
          setEvaluationTallies(res.data);
        })();
      }
    }
  }, [isSummaryOpen, selectedProfessor]);

  // Shared classes (no borders)
  const btnBase = "btn mx-1 text-white border-0 ring-0 focus:ring-0 focus:outline-none";
  const btnCopus = `${btnBase} bg-[#1b2e3e] hover:bg-[#4e6e88]`;
  const btnNew = `${btnBase} bg-gray-500 hover:bg-gray-400`;

  return (
    <div className="custom-container gap-y-6">
      <BreadAndLogout
        setActiveView={setActiveView}
        breadcrumbs={[
          { label: "Home", view: "home" },
          { label: "Evaluation" },
        ]}
      />

      <h2 className="mt-4 text-3xl font-bold text-white">Copus Evaluation Forms</h2>
      <span className="mb-2 block mx-6 font-thin text-[#888888]">
        This is where you can manage and review evaluations. You’ll be able to check active and
        past submissions, explore results with AI-driven sentiment analysis and NLP insights, and
        make sure all feedback is properly addressed.
      </span>

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
            <option key={index} value={`${prof.first_name} ${prof.last_name}`} />
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
          {Array.from(new Set(schedules.map((s) => `${s.year} ${s.semester}`))).map((item, index) => (
            <option key={index} value={item} />
          ))}
        </datalist>
      </div>

      {/* Professors Table */}
      <div className="w-full overflow-x-auto text-white shadow-xl backdrop-blur-lg">
        <table className="table">
          <thead className="bg-gradient-to-r from-[#1c402a]/40 to-[#1b2e3e]/40 text-xl font-bold text-white shadow-xl">
            <tr>
              <th>Course and Professor</th>
            </tr>
          </thead>
          <tbody className="text-lg text-white">
            {loading ? (
              [...Array(3)].map((_, idx) => (
                <tr key={idx}>
                  <td>
                    <div className="collapse-arrow collapse rounded-md shadow-2xl backdrop-blur-lg">
                      <input type="checkbox" />
                      <div className="collapse-title bg-gradient-to-r from-[#1c402a]/40 to-[#1b2e3e]/40 text-xl font-semibold">
                        <div className="skeleton h-8 w-56 rounded-2xl"></div>
                      </div>

                      {/* Skeleton buttons row */}
                      <div className="z-50 flex items-center justify-center gap-x-3 bg-gradient-to-r from-[#1c402a]/40 to-[#1b2e3e]/40 py-3">
                        <div className="skeleton h-10 w-36 rounded-2xl"></div>
                        <div className="skeleton h-10 w-32 rounded-2xl"></div>
                        <div className="skeleton h-10 w-32 rounded-2xl"></div>
                        <div className="skeleton h-10 w-28 rounded-2xl"></div>
                      </div>

                      <div className="collapse-content flex bg-black/20 text-lg">
                        <div className="flex h-full w-full flex-col justify-center">
                          <div className="flex flex-row">
                            <div className="avatar mt-3">
                              <div className="h-24 w-24 rounded-full skeleton bg-primary/20"></div>
                            </div>
                            <div className="ml-6 flex w-full flex-col justify-center border-b-2 border-gray-300">
                              <div className="mb-2 h-5 w-1/4 rounded bg-primary/20 skeleton"></div>
                              <div className="mb-2 h-5 w-1/3 rounded bg-primary/20 skeleton"></div>
                              <div className="h-5 w-1/2 rounded bg-primary/20 skeleton"></div>
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
                                {[...Array(2)].map((_, j) => (
                                  <tr key={j}>
                                    <td>
                                      <div className="skeleton h-5 w-32 rounded"></div>
                                    </td>
                                    <td>
                                      <div className="skeleton h-5 w-20 rounded"></div>
                                    </td>
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
              ))
            ) : (
              filteredProfessors.map((prof) => {
                const profSchedules = getProfessorSchedules(prof);
                const profEvaluations = getProfessorEvaluations(prof);

                const hasAllCopus = COPUS_TYPE_CHOICES.every((copus) =>
                  profEvaluations.some((e) => e.evaluation_type === copus.value),
                );

                // Find first missing COPUS type
                const firstMissingType = COPUS_TYPE_CHOICES.find(
                  (copus) => !getEvaluationByType(prof, copus.value),
                );

                return (
                  <tr key={prof.id}>
                    <td>
                      <div className="collapse-arrow collapse rounded-md shadow-2xl backdrop-blur-lg">
                        <input type="checkbox" />
                        <div className="collapse-title bg-gradient-to-r from-[#1c402a]/40 to-[#1b2e3e]/40 text-xl font-semibold">
                          {prof.first_name} {prof.last_name}
                        </div>

                        {/* Button Row */}
                        <div
                          className="z-50 flex items-center justify-center gap-x-3 bg-gradient-to-r from-[#1c402a]/40 to-[#1b2e3e]/40 py-3"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Copus Summary */}
                          {hasAllCopus && (
                            <button
                              type="button"
                              className={btnCopus}
                              onClick={() => {
                                setSelectedProfessor(prof);
                                openSummaryModal();
                              }}
                            >
                              Copus Summary
                            </button>
                          )}

                          {/* Divider ONLY when Copus Summary is visible */}
                          {hasAllCopus && (
                            <div className="divider divider-horizontal divider-accent mx-2"></div>
                          )}

                          {/* COPUS 1/2/3 */}
                          {COPUS_TYPE_CHOICES.map((copus) => {
                            const evalForType = getEvaluationByType(prof, copus.value);

                            if (evalForType) {
                              return (
                                <button
                                  key={copus.value}
                                  type="button"
                                  className={btnCopus}
                                  onClick={() => {
                                    setSelectedEvaluation(evalForType);
                                    setSelectedProfessor(prof);
                                    handleOpenEvaluation(evalForType);
                                  }}
                                >
                                  {`Edit ${copus.label}`}
                                </button>
                              );
                            }

                            if (copus.value === firstMissingType?.value) {
                              return (
                                <button
                                  key={copus.value}
                                  type="button"
                                  className={btnNew}
                                  onClick={() => {
                                    setSelectedProfessor(prof);
                                    (document.getElementById("create_new_copus") as HTMLDialogElement)?.showModal();
                                  }}
                                >
                                  {`New ${copus.label}`}
                                </button>
                              );
                            }

                            return null;
                          })}
                        </div>

                        {/* Collapse Content */}
                        <div className="collapse-content flex bg-black/20 text-lg">
                          <div className="flex h-full w-full flex-col justify-center">
                            <div className="flex flex-row">
                              <div className="avatar mt-3">
                                <div className="h-24 w-24 rounded-full">
                                  <img
                                    src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                                    alt="Professor avatar"
                                  />
                                </div>
                              </div>
                              <div className="ml-6 flex w-full flex-col justify-center border-b-2 border-gray-300">
                                <div>
                                  Department: <strong>{prof.department || "N/A"}</strong>
                                </div>
                                {profSchedules.length > 0 && (
                                  <>
                                    <div>
                                      Room and Subject:{" "}
                                      <strong>
                                        {profSchedules[0].room} {profSchedules[0].subject}
                                      </strong>
                                    </div>
                                    <div>
                                      Year and Semester:{" "}
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
                                  {profSchedules.map((schedule, idx) => (
                                    <tr key={idx}>
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
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Create New Copus Modal (kept as id-based) */}
      <dialog id="create_new_copus" className="modal">
        <div className="modal-box w-11/12 max-w-5xl">
          <h3 className="mb-4 text-center text-2xl font-bold">New Copus</h3>
          {(() => {
            let initialCopusType = "copus_1";
            if (selectedProfessor) {
              const used = getProfessorEvaluations(selectedProfessor).map((e) => e.evaluation_type);
              const missing = COPUS_TYPE_CHOICES.find((c) => !used.includes(c.value));
              if (missing) initialCopusType = missing.value;
            }
            return (
              <CreateEvaluationForm
                onSuccess={(newEvaluation) => {
                  setEvaluations((prev) => [...prev, newEvaluation]);
                  if (newEvaluation.observation_date === getToday()) {
                    setSelectedEvaluation(newEvaluation);
                    const scheduleObj = schedules.find((s) => s.id === newEvaluation.schedule) || null;
                    setSelectedSchedule(scheduleObj);
                    openViewModal(); // open the View/Edit modal
                  }
                  (document.getElementById("create_new_copus") as HTMLDialogElement)?.close();
                }}
                schedules={schedules}
                initialInstructor={selectedProfessor}
                initialCopusType={initialCopusType}
              />
            );
          })()}
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      {/* ALWAYS-MOUNTED: View/Edit Copus Modal */}
      <dialog ref={viewModalRef} className="modal">
        <div className="modal-box max-h-full w-full max-w-5xl text-black">
          {selectedEvaluation && selectedProfessor && (
            <>
              <h3 className="mt-2 mb-6 text-xl font-bold">
                {selectedProfessor.first_name} {selectedProfessor.last_name} - COPUS Evaluation -{" "}
                {selectedEvaluation.evaluation_type}
              </h3>

              {/* Basic Information */}
              <div className="collapse-arrow collapse mb-4 border border-gray-300">
                <input type="checkbox" />
                <div className="collapse-title text-lg font-semibold">Basic Information</div>

                <div className="collapse-content space-y-2">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="input w-full bg-transparent">
                      <span className="text-gray-400">Role:</span>
                      <span className="text-black"> {localStorage.getItem("firstName") || "User"}</span>
                    </div>
                    <div className="input input-bordered w-full bg-transparent">
                      <span className="text-gray-400">Date:</span>
                      <span className="text-black"> {selectedEvaluation.observation_date}</span>
                    </div>

                    <div className="input input-bordered w-full bg-transparent">
                      <span className="text-gray-400">Name of Evaluated:</span>
                      <span className="text-black">
                        {" "}
                        {`${selectedProfessor.first_name} ${selectedProfessor.last_name}`}
                      </span>
                    </div>

                    <div className="input input-bordered w-full bg-transparent">
                      <span className="text-gray-400">Section:</span>
                      <span className="text-black"> {selectedSchedule?.section_name || ""}</span>
                    </div>
                    <div className="input input-bordered w-full bg-transparent">
                      <span className="text-gray-400">Subject:</span>
                      <span className="text-black"> {selectedSchedule?.subject_name || ""}</span>
                    </div>
                    <div className="input input-bordered w-full bg-transparent">
                      <span className="text-gray-400">Room:</span>
                      <span className="text-black"> {selectedSchedule?.room_name || ""}</span>
                    </div>
                    <div className="input input-bordered w-full bg-transparent">
                      <span className="text-gray-400">Program:</span>
                      <span className="text-black"> {selectedSchedule?.program_name || "Null"}</span>
                    </div>
                    <div className="input input-bordered w-full bg-transparent">
                      <span className="text-gray-400">Start Time:</span>
                      <span className="text-black"> {selectedSchedule?.start_time || ""}</span>
                    </div>
                    <div className="input input-bordered w-full bg-transparent">
                      <span className="text-gray-400">End Time:</span>
                      <span className="text-black"> {selectedSchedule?.end_time || ""}</span>
                    </div>
                    <div className="input input-bordered w-full bg-transparent">
                      <span className="text-gray-400">Semester:</span>
                      <span className="text-black"> {selectedSchedule?.semester || ""}</span>
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
                  studentTallies={evaluationTallies[selectedEvaluation.id]?.studentTallies || {}}
                  teacherTallies={evaluationTallies[selectedEvaluation.id]?.teacherTallies || {}}
                />
              </div>

              {/* AI Feedback */}
              <div className="collapse-arrow collapse mb-4 border border-gray-300">
                <input type="checkbox" />
                <div className="collapse-title text-lg font-semibold">
                  Assisted Summary
                  {aiFeedbackLoading && <span className="ml-4 text-sm text-gray-500">Loading...</span>}
                </div>
                <div className="collapse-content">
                  <div className="mb-2 flex items-center">
                    {aiFeedback === null && !aiFeedbackLoading && (
                      <button
                        className="btn btn-primary btn-xs mr-4"
                        onClick={handleGenerateAIFeedback}
                        disabled={aiFeedbackLoading}
                        type="button"
                      >
                        Generate AI Feedback
                      </button>
                    )}
                    {aiFeedbackError && <div className="text-red-500">{aiFeedbackError}</div>}
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
                <form method="dialog" className="flex flex-wrap gap-3">
                  <button
                    className="btn btn-primary px-6 text-white"
                    onClick={() => {
                      setSelectedEvaluation(null);
                      setSelectedProfessor(null);
                      setSelectedSchedule(null);
                      closeViewModal();
                    }}
                  >
                    Save and Exit
                  </button>
                  <button
                    type="submit"
                    className="btn btn-cancel text-white"
                    onClick={() => {
                      setSelectedEvaluation(null);
                      setSelectedProfessor(null);
                      setSelectedSchedule(null);
                      closeViewModal();
                    }}
                  >
                    Close
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
        <form method="dialog" className="modal-backdrop">
          <button
            onClick={() => {
              setSelectedEvaluation(null);
              setSelectedProfessor(null);
              setSelectedSchedule(null);
            }}
          >
            close
          </button>
        </form>
      </dialog>

      {/* ALWAYS-MOUNTED: Copus Summary Modal */}
      <dialog ref={summaryModalRef} className="modal">
        <div className="modal-box max-h-full w-full max-w-5xl text-black">
          {selectedProfessor && (
            <>
              <h3 className="mt-2 mb-6 text-xl font-bold">
                {selectedProfessor.first_name} {selectedProfessor.last_name} - COPUS Summary
              </h3>
              <CopusSummaryTable
                evaluations={getProfessorEvaluations(selectedProfessor).filter((e) =>
                  ["copus_1", "copus_2", "copus_3"].includes(e.evaluation_type),
                )}
                evaluationTallies={evaluationTallies}
                studentOptions={studentOptions}
                teacherOptions={teacherOptions}
              />
              <div className="modal-action">
                <button
                  className="btn btn-cancel text-white"
                  onClick={() => {
                    closeSummaryModal();
                  }}
                >
                  Close
                </button>
              </div>
            </>
          )}
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={closeSummaryModal}>close</button>
        </form>
      </dialog>
    </div>
  );
}

export default Evaluation;
