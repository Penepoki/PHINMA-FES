import { useEffect, useState } from "react";
import DashboardHeader from "../../../Components/Dashboard Components/Dashboard Header";
import EvalCards from "../../../Components/Dashboard Components/Professor Components/Evaluation Cards.tsx";
import CopusMatrixReadOnly from "../../../Components/Evaluation Components/Copus Matrix Read Only.tsx";
import PieChartWithTable from "../../../Components/Evaluation Components/Piechart with Table";
import * as Interfaces from "../../../Types/Interfaces.ts";
import * as Fetcher from "../../../utils/fetcher.ts";

function Home() {
  const [appearModal, setAppearModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [evaluations, setEvaluations] = useState<Interfaces.Evaluation[]>([]);
  const [schedules, setSchedules] = useState<Interfaces.Schedule[]>([]);
  const [programs, setPrograms] = useState<Interfaces.Program[]>([]);
  const [programProfessors, setProgramProfessors] = useState<Interfaces.ProgramProfessor[]>([]);
  const [modalOpen, setModalOpen] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [selectedEvaluation, setSelectedEvaluation] = useState<any>(null);
  const [selectedProfessor, setSelectedProfessor] = useState<any>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);
  const [copusData, setCopusData] = useState<any>({});

  const currentProfessorId = 1; // replace with your auth/state logic

  // Fetch COPUS data for the current professor
  // useEffect(() => {
  //   async function fetchCopusData() {
  //     if (!currentProfessorId) return;
  //     setLoading(true);
  //     try {
  //       const response = await api.get(/copus-summary-by-professor/ ? professor = ${ currentProfessorId });
  //       setCopusData(response.data);
  //     } catch (err) {
  //       console.error("Error fetching COPUS data:", err);
  //       setError("Failed to load COPUS data.");
  //     } finally {
  //       setLoading(false);
  //     }
  //   }
  //   fetchCopusData();
  // }, [currentProfessorId]);

  const evaluationarray = [
    { name: "COPUS EXAMPLE", fullname: "College of Information Technology Education", image: null },
    { name: "CAHS", fullname: "College of Allied Health Sciences", image: null },
    { name: "CMA", fullname: "College of Management and Accountancy", image: null },
    { name: "CCJE", fullname: "College of Criminal Justice Education", image: null },
    { name: "COED", fullname: "College of Education", image: null },
    { name: "SHS", fullname: "Senior High School", image: null },
    { name: "etc", fullname: "Other", image: null },
  ];

  const professors = Array.from(
    new Map(programProfessors.map((pp) => [pp.professor, pp.professor_details])).values()
  );

  const handleEvalClick = (evaluationId: number) => {
    const evaluation = evaluations.find((e) => e.id === evaluationId);
    if (!evaluation) return;

    setSelectedEvaluation(evaluation);
    setSelectedProfessor(evaluation.professor);
    setSelectedSchedule(evaluation.schedule);
    setAppearModal(true);
  };

  return (
    <div className="home-page z-10 flex h-full w-full flex-col items-center justify-center gap-y-6">
      <DashboardHeader />

      <div className="mt-34 flex h-full w-full flex-col items-center justify-start overflow-auto bg-black/20">
        <EvalCards evaluations={evaluationarray} onEvalClick={handleEvalClick} />
      </div>

      {appearModal && selectedEvaluation && (
        <dialog open className="modal">
          <div className="modal-box max-h-full w-full max-w-5xl text-black">
            <h3 className="mt-2 mb-6 text-xl font-bold">
              {selectedProfessor?.first_name} {selectedProfessor?.last_name} - COPUS Evaluation -{" "}
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
                    <span className="text-black"> First Name Placeholder</span>
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
                    <span className="text-black">{selectedSchedule?.section_name || ""}</span>
                  </div>
                  <div className="input input-bordered w-full bg-transparent">
                    <span className="text-gray-400">Subject:</span>
                    <span className="text-black">{selectedSchedule?.subject_name || ""}</span>
                  </div>
                  <div className="input input-bordered w-full bg-transparent">
                    <span className="text-gray-400">Room:</span>
                    <span className="text-black">{selectedSchedule?.room_name || ""}</span>
                  </div>
                  <div className="input input-bordered w-full bg-transparent">
                    <span className="text-gray-400">Program:</span>
                    <span className="text-black">{selectedSchedule?.program_name || "Null"}</span>
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
              tallyData={copusData[selectedEvaluation.id] || {}}
            />

            {/* COPUS Summary Chart */}
            <div className="mt-6 flex flex-col items-center justify-center gap-6 md:flex-row">
              <PieChartWithTable
                studentTallies={copusData[selectedEvaluation.id]?.studentTallies || {}}
                teacherTallies={copusData[selectedEvaluation.id]?.teacherTallies || {}}
              />
            </div>

            {/* AI Feedback */}
            <div className="collapse-arrow collapse mb-4 border-1 border-gray-300">
              <input type="checkbox" />
              <div className="collapse-title text-lg font-semibold">
                Assisted Summary
              </div>
              <div className="collapse-content">
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
