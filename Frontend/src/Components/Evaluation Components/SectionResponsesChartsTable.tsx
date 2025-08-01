import React, { useEffect, useState } from "react";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import api from "../../utils/api";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

interface SectionResponsesChartsTableProps {
  evaluationId: number;
  sectionId: number;
}

// Helper to group responses by question and answer
function groupBy<T, K extends keyof any>(array: T[], getKey: (item: T) => K) {
  return array.reduce((result, item) => {
    const key = getKey(item);
    (result[key] = result[key] || []).push(item);
    return result;
  }, {} as Record<K, T[]>);
}

const SectionResponsesChartsTable: React.FC<SectionResponsesChartsTableProps> = ({ evaluationId, sectionId }) => {
  const [responses, setResponses] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!evaluationId || !sectionId) return;
    setLoading(true);
    setError(null);
    Promise.all([
      api.get(`/studentevaluationresponse/studentevaluationresponse/by-evaluation-and-section?student_evaluation=${evaluationId}&section=${sectionId}`),
      api.get(`/studentevaluationquestion/studentevaluationquestion/by-evaluation?student_evaluation=${evaluationId}`)
    ])
      .then(([resResponses, resQuestions]) => {
        setResponses(resResponses.data);
        setQuestions(resQuestions.data);
      })
      .catch(() => setError("Failed to fetch section responses or questions"))
      .finally(() => setLoading(false));
  }, [evaluationId, sectionId]);

  // Join responses with questions
  const enrichedResponses = responses.map((resp) => {
    const q = questions.find((q: any) => q.id === resp.student_eval_question);
    return {
      ...resp,
      question_type: q?.type,
      question_text: q?.question,
      choices: q?.options || [],
    };
  });

  // Group responses by question type
  const groupedByQuestion = groupBy(enrichedResponses, (r) => r.student_eval_question);

  // Pie chart for rating scale (aggregate all rating answers)
  const ratingQuestions = Object.values(groupedByQuestion).filter(
    (arr) => arr[0]?.question_type?.toUpperCase() === "RATING"
  );
  const mcqQuestions = Object.values(groupedByQuestion).filter(
    (arr) => arr[0]?.question_type?.toUpperCase() === "MCQ"
  );

  return (
    <div className="w-full overflow-x-auto text-white shadow-xl">
      <table className="table text-lg">
        <thead className="sticky top-0 z-1 bg-[#1c402a] text-xl font-bold text-white">
          <tr>
            <th>Section Response Charts</th>
          </tr>
        </thead>
        <tbody className="bg-black/20">
          <tr className="transition-colors duration-500 hover:bg-[#1b2e3e]">
            <td>
              {/* DaisyUI Collapse for expandable row */}
              <div className="collapse collapse-arrow rounded-md shadow-2xl backdrop-blur-lg">
                <input type="checkbox" />
                <div className="collapse-title bg-[#1c402a]/50 text-xl font-semibold">
                  Click to view charts
                </div>
                <div className="collapse-content flex bg-black/20 text-lg">
                  <div className="w-full">
                    <div className="max-h-[500px] overflow-y-auto p-2">
                      {loading && <div>Loading charts...</div>}
                      {error && <div className="text-red-500">{error}</div>}
                      {/* Pie chart for each rating question */}
                      {ratingQuestions.length > 0 && (
                        <div className="mb-6">
                          <h6 className="font-bold mb-2">Rating Scale Results</h6>
                          <div className="flex flex-wrap -mx-2">
                            {ratingQuestions.map((responses, idx) => {
                              const answerCounts: Record<string, number> = {};
                              responses.forEach((r) => {
                                answerCounts[r.answer] = (answerCounts[r.answer] || 0) + 1;
                              });
                              const data = {
                                labels: Object.keys(answerCounts),
                                datasets: [
                                  {
                                    data: Object.values(answerCounts),
                                    backgroundColor: [
                                      "#36A2EB",
                                      "#FF6384",
                                      "#FFCE56",
                                      "#4BC0C0",
                                      "#9966FF",
                                      "#FF9F40",
                                    ],
                                  },
                                ],
                              };
                              return (
                                <div key={idx} className="w-full md:w-1/2 px-2 mb-4 flex flex-col items-center">
                                  <div className="mb-1 font-medium text-center">Q{responses[0].student_eval_question}: {responses[0].question_text || "Rating Question"}</div>
                                  <div className="w-full max-w-xs h-64 flex items-center justify-center">
                                    <Pie data={data} />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      {/* Bar chart for each MCQ question */}
                      {mcqQuestions.length > 0 && (
                        <div>
                          <h6 className="font-bold mb-2">MCQ Results</h6>
                          <div className="flex flex-wrap -mx-2">
                            {mcqQuestions.map((responses, idx) => {
                              // Get all possible choices from the question
                              const choices: string[] = responses[0]?.choices || [];
                              const answerCounts: Record<string, number> = {};
                              choices.forEach((choice) => {
                                answerCounts[choice] = 0;
                              });
                              responses.forEach((r) => {
                                answerCounts[r.answer] = (answerCounts[r.answer] || 0) + 1;
                              });
                              const data = {
                                labels: choices,
                                datasets: [
                                  {
                                    label: "Number of Students",
                                    data: choices.map((c) => answerCounts[c] || 0),
                                    backgroundColor: "#36A2EB",
                                  },
                                ],
                              };
                              return (
                                <div key={idx} className="w-full md:w-1/2 px-2 mb-4 flex flex-col items-center">
                                  <div className="mb-1 font-medium text-center">Q{responses[0].student_eval_question}: {responses[0].question_text || "MCQ Question"}</div>
                                  <div className="w-full max-w-xs h-64 flex items-center justify-center">
                                    <Bar data={data} options={{ indexAxis: "x" }} />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      {ratingQuestions.length === 0 && mcqQuestions.length === 0 && !loading && (
                        <div>No rating or MCQ responses found for this section.</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default SectionResponsesChartsTable;
