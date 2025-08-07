import { useEffect, useState } from "react";
import FacultyPieChart from "./FacultyPieChart";
import api from "../../../utils/api";
import { Evaluation } from "../../../Types/Interfaces";

function RecentlyEvaluatedFaculty() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [evaluationTallies, setEvaluationTallies] = useState<{
    [evaluationId: string]: {
      teacherTallies: { [question: string]: { sentiment: string } };
    };
  }>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);

  useEffect(() => {
    const fetchRecentEvaluations = async () => {
      try {
        const response = await api.get("/evaluation/evaluations", {
          params: {
            ordering: "-created_at",
            limit: 3,
          },
        });
        const recentEvaluations = response.data.slice(0, 3);
        setEvaluations(recentEvaluations);
      } catch (error) {
        console.error("Failed to fetch evaluations", error);
      }
    };

    fetchRecentEvaluations();
  }, []);

  useEffect(() => {
    const fetchTallies = async () => {
      try {
        const talliesData: typeof evaluationTallies = {};

        await Promise.all(
          evaluations.map(async (evalItem) => {
            const response = await api.get(`/evaluation/tallies/${evalItem.id}`);
            talliesData[evalItem.id] = response.data;
          })
        );

        setEvaluationTallies(talliesData);
      } catch (error) {
        console.error("Failed to fetch tallies", error);
      }
    };

    if (evaluations.length > 0) {
      setSelectedEvaluation(evaluations[0]);
      fetchTallies();
    }
  }, [evaluations]);

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % evaluations.length;
    setCurrentIndex(nextIndex);
    setSelectedEvaluation(evaluations[nextIndex]);
  };

  const currentEvaluation = evaluations[currentIndex];
  const faculty = currentEvaluation?.faculty;
  const imageSrc = faculty?.image || "/default-avatar.png";
  const facultyName = faculty?.name || "Faculty";

  const teacherTallies = evaluationTallies[currentEvaluation?.id]?.teacherTallies;

  const chartData = teacherTallies
    ? [
      Object.values(teacherTallies).filter((d) => d.sentiment === "positive").length,
      Object.values(teacherTallies).filter((d) => d.sentiment === "neutral").length,
      Object.values(teacherTallies).filter((d) => d.sentiment === "negative").length,
    ]
    : [0, 0, 0];

  return (
    <div className="bg-base-100 shadow-lg border border-white/10 rounded-2xl p-4 col-span-4 h-full">
      <div className="flex flex-col items-center">
        <span className="text-lg font-bold text-white">Recently Evaluated</span>

        {evaluations.length === 0 ? (
          <div className="mt-8 text-white">Loading evaluations...</div>
        ) : (
          <>
            <div className="avatar mt-8">
              <div className="w-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                <img src={imageSrc} alt={facultyName} />
              </div>
            </div>

            <span className="text-3xl font-bold text-white mt-4">{facultyName}</span>

            <div className="w-full h-96 mt-6">
              <FacultyPieChart data={chartData} width={400} height={400} />
            </div>

            <button
              onClick={handleNext}
              className="btn mt-4 btn-outline btn-primary text-white"
            >
              Next
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default RecentlyEvaluatedFaculty;
