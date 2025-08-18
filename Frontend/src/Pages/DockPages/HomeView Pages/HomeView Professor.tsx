import { useEffect, useState } from "react";
import DashboardHeader from "../../../Components/Dashboard Components/Dashboard Header";
import api from "../../../utils/api";

interface EvaluationCard {
  id: number;
  name: string;
  fullname: string;
  image?: string | null;
}

function Home() {
  const [currentEvaluation, setCurrentEvaluation] = useState<EvaluationCard | null>(null);
  const [currentProfessor, setCurrentProfessor] = useState<any>(null);
  const [selectedEvaluation, setSelectedEvaluation] = useState<{
    id: number;
    evaluation_type: string;
    observation_date: string;
  } | null>(null);
  const [appearModal, setAppearModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copusData, setCopusData] = useState<any>({});
  const [evaluations, setEvaluations] = useState<EvaluationCard[]>([]);

  // Fetch logged-in professor
  useEffect(() => {
    const fetchProfessor = async () => {
      try {
        const res = await api.get("/users/me/");
        setCurrentProfessor(res.data);
      } catch (err) {
        console.error("Error fetching logged-in professor", err);
      }
    };
    fetchProfessor();
  }, []);

  // Fetch evaluations dynamically for logged-in professor
  useEffect(() => {
    const fetchEvaluations = async () => {
      if (!currentProfessor) return;
      try {
        const res = await api.get("/hrapp/evaluation/?professor=${currentProfessor.id}");
        // Map backend evaluations to your EvaluationCard format
        const evalCards: EvaluationCard[] = res.data.map((evalItem: any) => ({
          id: evalItem.id,
          name: evalItem.evaluation_type,
          fullname: evalItem.schedule?.name || "N/A",
        }));
        setEvaluations(evalCards);
      } catch (err) {
        console.error("Error fetching evaluations", err);
      }
    };
    fetchEvaluations();
  }, [currentProfessor]);

  const handleEvalClick = async (evaluation: EvaluationCard) => {
    if (!currentProfessor) return;

    setCurrentEvaluation(evaluation);
    setSelectedEvaluation({
      id: evaluation.id,
      evaluation_type: evaluation.name,
      observation_date: new Date().toISOString().slice(0, 10),
    });

    setLoading(true);

    try {
      const tsResponse = await api.get("/timestamp/timestamps/?evaluation=${evaluation.id}");
      const timestamps = tsResponse.data || [];

      const studentTallies: Record<string, { count: number; percentage: number }> = {};
      const teacherTallies: Record<string, { count: number; percentage: number }> = {};
      let totalStudent = 0, totalTeacher = 0;

      timestamps.forEach((ts: any) => {
        Object.entries(ts.student_activities || {}).forEach(([key, value]) => {
          if (!studentTallies[key]) studentTallies[key] = { count: 0, percentage: 0 };
          if (value) {
            studentTallies[key].count++;
            totalStudent++;
          }
        });
        Object.entries(ts.instructor_activities || {}).forEach(([key, value]) => {
          if (!teacherTallies[key]) teacherTallies[key] = { count: 0, percentage: 0 };
          if (value) {
            teacherTallies[key].count++;
            totalTeacher++;
          }
        });
      });

      Object.keys(studentTallies).forEach((key) => {
        studentTallies[key].percentage = totalStudent ? (studentTallies[key].count / totalStudent) * 100 : 0;
      });
      Object.keys(teacherTallies).forEach((key) => {
        teacherTallies[key].percentage = totalTeacher ? (teacherTallies[key].count / totalTeacher) * 100 : 0;
      });

      setCopusData({ [evaluation.id]: { studentTallies, teacherTallies } });
      setAppearModal(true);
    } catch (err) {
      console.error("Error fetching timestamps", err);
      setCopusData({});
      setAppearModal(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page z-10 flex h-full w-full flex-col items-center justify-center gap-y-6">
      <DashboardHeader />

      <div className="mt-34 flex h-full w-full flex-col items-center justify-start overflow-auto bg-black/20">
        {evaluations.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-10">
            <div className="loading loading-spinner loading-lg"></div>
            <p className="mt-4 text-white">Loading evaluations...</p>
          </div>
        ) : (
          <EvalCards evaluations={evaluations} onEvalClick={handleEvalClick} />
        )}
      </div>

      {/* Read-only COPUS modal */}
      {appearModal && currentEvaluation && currentProfessor && (
        <div className="modal modal-open">
          <div className="modal-box max-h-full w-full max-w-5xl text-black">
            <div className="flex justify-between items-start">
              <h3 className="mt-2 mb-6 text-xl font-bold">
                {currentProfessor.first_name} {currentProfessor.last_name} - COPUS - {currentEvaluation.name}
              </h3>
              <button
                className="btn btn-sm btn-error"
                onClick={() => setAppearModal(false)}
              >
                Close
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-10">
                <div className="loading loading-spinner loading-lg"></div>
                <span className="ml-3">Loading COPUS data...</span>
              </div>
            ) : (
              <CopusMatrixReadOnly
                evaluationId={currentEvaluation.id}
                tallyData={copusData[currentEvaluation.id]}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;