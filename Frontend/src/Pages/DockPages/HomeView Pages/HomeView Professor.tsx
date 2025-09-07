import React, {useEffect, useMemo, useRef, useState} from "react";
import DashboardHeader from "../../../Components/Dashboard Components/Dashboard Header";
import EvalCards from "../../../Components/Dashboard Components/Professor Components/Evaluation Cards.tsx";
import CopusMatrixReadOnly from "../../../Components/Evaluation Components/Copus Matrix Read Only.tsx";
import PieChartWithTable from "../../../Components/Evaluation Components/Piechart with Table";
import CopusActiveSummary from "../../../Components/Evaluation Components/CopusActiveSummary";
import * as Interfaces from "../../../Types/Interfaces.ts";
import api from "../../../utils/api";

function Home() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [user, setUser] = useState<any>(null);
  const [evaluations, setEvaluations] = useState<Interfaces.Evaluation[]>([]);
    const [copusTallies, setCopusTallies] = useState<any>({});
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
    const [aiFeedbackLoading, setAiFeedbackLoading] = useState(false);
    const [aiFeedbackError, setAiFeedbackError] = useState<string | null>(null);

    const [selectedEvaluation, setSelectedEvaluation] = useState<Interfaces.Evaluation | null>(null);
    const [selectedProfessor, setSelectedProfessor] = useState<Interfaces.Professor | null>(null);
    const [selectedSchedule, setSelectedSchedule] = useState<Interfaces.Schedule | null>(null);

    // UI parity with Evaluation view
    const [isPieCollapseOpen, setIsPieCollapseOpen] = useState(true);

    // ALWAYS-MOUNTED modal (DaisyUI)
    const viewModalRef = useRef<HTMLDialogElement>(null);
    const openViewModal = () => viewModalRef.current?.showModal();
    const closeViewModal = () => viewModalRef.current?.close();

    // Load initial data
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
          const me = await api.get("/user-dashboard/");
        setUser(me.data);

        const evRes = await api.get("/evaluation/evaluations/my-evaluations/");
          setEvaluations(evRes.data || []);

        const talliesRes = await api.get("/evaluation/evaluations/copus-summary-by-professor/");
        setCopusTallies(talliesRes.data || {});
      } catch (err: any) {
        console.error(err);
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

    // Cards data
  const evaluationCardData = useMemo(
    () =>
      evaluations.map((e) => ({
        name: e.name || `Evaluation #${e.id}`,
        fullname: e.evaluation_type || "COPUS",
        image: null,
      })),
      [evaluations],
  );

    // Hydrate missing related objects for Basic Information (parity with Evaluation view)
    const hydrateEvaluationDetails = async (fullEval: any) => {
        const prof = fullEval?.professor_details || fullEval?.instructor || null;
        let sched = fullEval?.schedule_details || fullEval?.schedule || null;

        // If schedule is only an ID or a thin object, fetch its details
        if (!sched || typeof sched === "number" || !sched.subject_name) {
            try {
                const schedId = typeof sched === "number" ? sched : fullEval?.schedule;
                if (schedId) {
                    const schedRes = await api.get(`/schedule/schedules/${schedId}/`);
                    sched = schedRes.data;
                }
            } catch (e) {
                console.warn("Failed to hydrate schedule details", e);
            }
        }

        setSelectedEvaluation(fullEval);
        setSelectedProfessor(prof);
        setSelectedSchedule(sched);
        setAiFeedback(fullEval?.ai_feedback?.feedback ?? null);
    };

    // Open modal like Evaluation view
    const handleEvalClick = async (evalName: string) => {
    const evaluation = evaluations.find((e) => (e.name || `Evaluation #${e.id}`) === evalName);
    if (!evaluation) return;

        try {
            const res = await api.get(`/evaluation/evaluations/${evaluation.id}/`);
            const fullEval = res.data;
            await hydrateEvaluationDetails(fullEval);
            setIsPieCollapseOpen(true); // default open
            openViewModal();
        } catch (e) {
            console.error("Failed to fetch evaluation details:", e);
            // Fallback to minimal info; best-effort schedule hydrate
            const fallbackEval = evaluation;
            setSelectedEvaluation(fallbackEval);
            setSelectedProfessor((fallbackEval as any)?.professor_details || (fallbackEval as any)?.instructor || null);

            let sched: any = (fallbackEval as any)?.schedule || null;
            if (typeof sched === "number") {
                try {
                    const schedRes = await api.get(`/schedule/schedules/${sched}/`);
                    sched = schedRes.data;
                } catch {
                    // ignore
                }
            }
            setSelectedSchedule(sched);
            setAiFeedback(null);
            setIsPieCollapseOpen(true);
            openViewModal();
        }
  };

    // Prefetch/refresh AI feedback on selection (parity with Evaluation view)
    useEffect(() => {
        if (!selectedEvaluation?.id) {
            setAiFeedback(null);
            setAiFeedbackError(null);
            return;
        }
        setAiFeedbackLoading(true);
        setAiFeedbackError(null);
        api
            .get(`/evaluation/evaluations/${selectedEvaluation.id}/`)
            .then((res) => setAiFeedback(res.data?.ai_feedback?.feedback ?? null))
            .catch(() => setAiFeedback(null))
            .finally(() => setAiFeedbackLoading(false));
    }, [selectedEvaluation?.id]);

  const totalActive = copusTallies?.totalActiveLearningPercentage ?? 0;

  return (
    <div className="home-page z-10 flex h-full w-full flex-col items-center justify-start gap-y-6">
      <DashboardHeader />
      {error && <div className="alert alert-error mt-2">{error}</div>}

      {/* Summary gauges */}
        <div className="mt-50 w-full px-4">
        <CopusActiveSummary
          evaluations={evaluations}
          evaluationTallies={copusTallies}
          totalActiveLearningPercentage={totalActive}
        />
      </div>

      {/* Cards */}
        <div
            className="mt-4 flex bg-black/5 h-full w-full rounded-2xl flex-col items-center justify-start overflow-auto">
            <EvalCards
                evaluations={evaluationCardData}
                onEvalClick={handleEvalClick}
                isLoading={loading}
                skeletonCount={3}
            />
      </div>

        {/* ALWAYS-MOUNTED: View Copus Modal (identical pattern to Evaluation view) */}
        <dialog ref={viewModalRef} className="modal">
            <div className="modal-box max-h-full w-full max-w-5xl text-black">
                {selectedEvaluation && selectedProfessor && (
                    <>
                        <h3 className="mt-2 mb-6 text-xl font-bold">
                            {selectedProfessor.first_name} {selectedProfessor.last_name} — COPUS Evaluation —{" "}
                            {selectedEvaluation.evaluation_type?.toUpperCase?.() ||
                                selectedEvaluation.evaluation_type}
                        </h3>

                        {/* Basic Information (hydrated) */}
                        <div className="collapse-arrow collapse mb-4 border border-gray-300">
                            <input type="checkbox"/>
                            <div className="collapse-title text-lg font-semibold">Basic Information</div>
                            <div className="collapse-content space-y-2">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="input w-full bg-transparent">
                                        <span className="text-gray-400">Role:</span>
                                        <span className="text-black"> Professor</span>
                                    </div>

                                    <div className="input input-bordered w-full bg-transparent">
                                        <span className="text-gray-400">Date:</span>
                                        <span className="text-black"> {selectedEvaluation.observation_date}</span>
                                    </div>

                                    <div className="input input-bordered w-full bg-transparent">
                                        <span className="text-gray-400">Name of Evaluated:</span>
                                        <span className="text-black">
                        {`${selectedProfessor.first_name} ${selectedProfessor.last_name}`}
                      </span>
                                    </div>

                                    <div className="input input-bordered w-full bg-transparent">
                                        <span className="text-gray-400">Section:</span>
                                        <span className="text-black">
                        {selectedSchedule?.section_name || (selectedSchedule as any)?.section?.name || ""}
                      </span>
                                    </div>

                                    <div className="input input-bordered w-full bg-transparent">
                                        <span className="text-gray-400">Subject:</span>
                                        <span className="text-black">
                        {selectedSchedule?.subject_name || (selectedSchedule as any)?.subject?.name || ""}
                      </span>
                                    </div>

                                    <div className="input input-bordered w-full bg-transparent">
                                        <span className="text-gray-400">Room:</span>
                                        <span className="text-black">
                        {selectedSchedule?.room_name || (selectedSchedule as any)?.room?.name || ""}
                      </span>
                                    </div>

                                    <div className="input input-bordered w-full bg-transparent">
                                        <span className="text-gray-400">Program:</span>
                                        <span className="text-black">{selectedSchedule?.program_name || "N/A"}</span>
                                    </div>

                                    <div className="input input-bordered w-full bg-transparent">
                                        <span className="text-gray-400">Start Time:</span>
                                        <span className="text-black">{selectedSchedule?.start_time || ""}</span>
                                    </div>

                                    <div className="input input-bordered w-full bg-transparent">
                                        <span className="text-gray-400">End Time:</span>
                                        <span className="text-black">{selectedSchedule?.end_time || ""}</span>
                                    </div>

                                    <div className="input input-bordered w-full bg-transparent">
                                        <span className="text-gray-400">Semester:</span>
                                        <span className="text-black">{selectedSchedule?.semester || ""}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* COPUS Read Only Matrix */}
                        <CopusMatrixReadOnly
                            evaluationId={selectedEvaluation.id}
                            tallyData={copusTallies[selectedEvaluation.id] || {}}
                        />

                        {/* COPUS Summary Chart — collapse (controlled like Evaluation view) */}
                        <div className="collapse-arrow collapse my-4 border border-gray-300">
                            <input
                                type="checkbox"
                                checked={isPieCollapseOpen}
                                onChange={() => setIsPieCollapseOpen((v) => !v)}
                            />
                            <div className="collapse-title text-lg font-semibold">
                                COPUS Summary (Charts & Table)
                            </div>
                            <div className="collapse-content">
                                <div className="mt-4 flex flex-col items-center justify-center gap-6 md:flex-row">
                                    <PieChartWithTable
                                        studentTallies={copusTallies[selectedEvaluation.id]?.studentTallies || {}}
                                        teacherTallies={copusTallies[selectedEvaluation.id]?.teacherTallies || {}}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Assisted Summary (same section styling) */}
                        <div className="collapse-arrow collapse mb-4 border border-gray-300">
                            <input type="checkbox"/>
                            <div className="collapse-title text-lg font-semibold">
                                Assisted Summary
                                {aiFeedbackLoading && (
                                    <span className="ml-4 text-sm text-gray-500">Loading...</span>
                                )}
                            </div>
                            <div className="collapse-content">
                                {aiFeedbackError && (
                                    <div className="alert alert-error mb-2">
                                        <span>{aiFeedbackError}</span>
                                    </div>
                                )}
                                <textarea
                                    id="ai-feedback-textarea"
                                    className="textarea min-h-[300px] w-full"
                                    placeholder="AI feedback will appear here..."
                                    value={aiFeedback || ""}
                                    readOnly
                                />
                            </div>
                        </div>

                        {/* Actions (identical pattern) */}
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
                                    type="button"
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
                    aria-label="Close"
                >
                    close
                </button>
            </form>
        </dialog>
    </div>
  );
}

export default Home;
