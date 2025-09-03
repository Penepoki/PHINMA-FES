
import React, { useEffect, useMemo, useState } from "react";
import DashboardHeader from "../../../Components/Dashboard Components/Dashboard Header";
import EvalCards from "../../../Components/Dashboard Components/Professor Components/Evaluation Cards.tsx";
import CopusMatrixReadOnly from "../../../Components/Evaluation Components/Copus Matrix Read Only.tsx";
import PieChartWithTable from "../../../Components/Evaluation Components/Piechart with Table";
import CopusActiveSummary from "../../../Components/Evaluation Components/CopusActiveSummary";
import * as Interfaces from "../../../Types/Interfaces.ts";
import api from "../../../utils/api"; // your axios instance (baseURL, auth, etc.)

function Home() {
  const [appearModal, setAppearModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [user, setUser] = useState<any>(null);
  const [evaluations, setEvaluations] = useState<Interfaces.Evaluation[]>([]);
  const [copusTallies, setCopusTallies] = useState<any>({}); // { [evalId]: { studentTallies, teacherTallies, activeLearningPercentage }, totalActiveLearningPercentage }
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);

  const [selectedEvaluation, setSelectedEvaluation] = useState<any>(null);
  const [selectedProfessor, setSelectedProfessor] = useState<any>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);

  // fetch logged-in user + their evaluations + tallies
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        // 1) current user
        const me = await api.get("/user-dashboard/"); // adjust to your URL conf if needed
        setUser(me.data);

        // 2) my evaluations (as instructor)
        const evRes = await api.get("/evaluation/evaluations/my-evaluations/");
        const evals = evRes.data || [];
        setEvaluations(evals);

        // 3) tallies for this professor (uses logged-in by default)
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

  // EvalCards in your project expects onEvalClick(name: string)
  const evaluationCardData = useMemo(
    () =>
      evaluations.map((e) => ({
        name: e.name || `Evaluation #${e.id}`,
        fullname: e.evaluation_type || "COPUS",
        image: null,
      })),
    [evaluations]
  );

  const handleEvalClick = (evalName: string) => {
    const evaluation = evaluations.find((e) => (e.name || `Evaluation #${e.id}`) === evalName);
    if (!evaluation) return;
    setSelectedEvaluation(evaluation);
    // you can compute professor/schedule display fields here if your serializer includes them
    setSelectedProfessor((evaluation as any).instructor || (evaluation as any).professor_details || null);
    setSelectedSchedule((evaluation as any).schedule || null);
    setAppearModal(true);
  };

  const totalActive = copusTallies?.totalActiveLearningPercentage ?? 0;

  return (
    <div className="home-page z-10 flex h-full w-full flex-col items-center justify-start gap-y-6">
      <DashboardHeader />
      {error && <div className="alert alert-error mt-2">{error}</div>}

      {/* Summary gauges */}
      <div className="w-full mt-50 px-4">
        <CopusActiveSummary
          evaluations={evaluations}
          evaluationTallies={copusTallies}
          totalActiveLearningPercentage={totalActive}
        />
      </div>

      {/* Cards */}
      <div className="mt-4 flex h-full w-full flex-col items-center justify-start overflow-auto">
        <EvalCards evaluations={evaluationCardData} onEvalClick={handleEvalClick} />
      </div>

      {/* Modal */}
      {appearModal && selectedEvaluation && (
        <dialog open className="modal">
          <div className="modal-box max-h-full w-full max-w-5xl text-black">
            <h3 className="mt-2 mb-6 text-xl font-bold">
              {(selectedProfessor?.first_name || "")} {(selectedProfessor?.last_name || "")} — COPUS Evaluation —{" "}
              {selectedEvaluation?.evaluation_type}
            </h3>

            {/* Basic Information */}
            <div className="collapse-arrow collapse mb-4 border-1 border-gray-300">
              <input type="checkbox" />
              <div className="collapse-title text-lg font-semibold">Basic Information</div>
              <div className="collapse-content space-y-2">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="input w-full bg-transparent">
                    <span className="text-gray-400">Role:</span>
                    <span className="text-black"> Professor</span>
                  </div>
                  <div className="input input-bordered w-full bg-transparent">
                    <span className="text-gray-400">Date:</span>
                    <span className="text-black"> {selectedEvaluation?.observation_date}</span>
                  </div>
                  <div className="input input-bordered w-full bg-transparent">
                    <span className="text-gray-400">Name of Evaluated:</span>
                    <span className="text-black">
                      {`${selectedProfessor?.first_name || ""} ${selectedProfessor?.last_name || ""}`}
                    </span>
                  </div>
                  <div className="input input-bordered w-full bg-transparent">
                    <span className="text-gray-400">Section:</span>
                    <span className="text-black">
                      {(selectedSchedule && (selectedSchedule.section_name || selectedSchedule.section?.name)) || ""}
                    </span>
                  </div>
                  <div className="input input-bordered w-full bg-transparent">
                    <span className="text-gray-400">Subject:</span>
                    <span className="text-black">
                      {(selectedSchedule && (selectedSchedule.subject_name || selectedSchedule.subject?.name)) || ""}
                    </span>
                  </div>
                  <div className="input input-bordered w-full bg-transparent">
                    <span className="text-gray-400">Room:</span>
                    <span className="text-black">
                      {(selectedSchedule && (selectedSchedule.room_name || selectedSchedule.room?.name)) || ""}
                    </span>
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

            {/* COPUS Summary Chart */}
            <div className="mt-6 flex flex-col items-center justify-center gap-6 md:flex-row">
              <PieChartWithTable
                studentTallies={copusTallies[selectedEvaluation.id]?.studentTallies || {}}
                teacherTallies={copusTallies[selectedEvaluation.id]?.teacherTallies || {}}
              />
            </div>

            {/* AI Feedback placeholder (optional) */}
            <div className="collapse-arrow collapse mb-4 border-1 border-gray-300">
              <input type="checkbox" />
              <div className="collapse-title text-lg font-semibold">Assisted Summary</div>
              <div className="collapse-content">
                <textarea
                  id="ai-feedback-textarea"
                  className="textarea min-h-[300px] w-full"
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
                    setAppearModal(false);
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
                    setAppearModal(false);
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

export default Home;
