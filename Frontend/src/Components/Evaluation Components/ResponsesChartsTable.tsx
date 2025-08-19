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
  ChartOptions,
} from "chart.js";
import api from "../../utils/api";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

type FilterType = "section" | "professor" | "program" | "faculty";
interface ResponsesChartsTableProps {
  evaluationId: number;
  filterType: FilterType;
  filterId: number;
}

/** ============================
 *  THEME HELPERS (Primary Color)
 *  ============================ */
// System primary
const PRIMARY_HEX = "#1c402a";

// Convert #rrggbb to rgba(r,g,b,a)
function hexToRgba(hex: string, alpha = 1): string {
  const raw = hex.replace("#", "");
  const bigint = parseInt(raw, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Shades based on primary with varying alpha for multi-segment visuals
const primaryAlphaScale = (count: number): string[] => {
  const start = 0.25; // faint
  const end = 0.95;   // almost solid
  const step = count > 1 ? (end - start) / (count - 1) : 0;
  return Array.from({ length: count }, (_, i) => hexToRgba(PRIMARY_HEX, start + step * i));
};

// Common chart options fragment for dark UI + primary accents
const baseDarkOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: "#ffffff",
        usePointStyle: true,
        padding: 16,
      },
    },
    tooltip: {
      backgroundColor: hexToRgba(PRIMARY_HEX, 0.92),
      titleColor: "#ffffff",
      bodyColor: "#ffffff",
      borderColor: hexToRgba("#ffffff", 0.25),
      borderWidth: 1,
    },
  },
  scales: {
    x: {
      ticks: { color: "#ffffff" },
      grid: { color: "rgba(255,255,255,0.10)" },
    },
    y: {
      ticks: { color: "#ffffff" },
      grid: { color: "rgba(255,255,255,0.10)" },
    },
  },
} as const;

// Helper to group responses by question and answer
function groupBy<T, K extends keyof any>(array: T[], getKey: (item: T) => K) {
  return array.reduce((result, item) => {
    const key = getKey(item);
    (result[key] = result[key] || []).push(item);
    return result;
  }, {} as Record<K, T[]>);
}

const endpointMap = {
  section: (evaluationId: number, filterId: number) =>
    `/studentevaluationresponse/studentevaluationresponse/by-evaluation-and-section?student_evaluation=${evaluationId}&section=${filterId}`,
  professor: (_evaluationId: number, filterId: number) =>
    `/studentevaluationresponse/studentevaluationresponse/by-professor?professor=${filterId}`,
  program: (_evaluationId: number, filterId: number) =>
    `/studentevaluationresponse/studentevaluationresponse/by-program?program=${filterId}`,
  faculty: (_evaluationId: number, filterId: number) =>
    `/studentevaluationresponse/studentevaluationresponse/by-faculty?faculty=${filterId}`,
};

const ResponsesChartsTable: React.FC<ResponsesChartsTableProps> = ({ evaluationId, filterType, filterId }) => {
  const [responses, setResponses] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uniqueStudentCount, setUniqueStudentCount] = useState<number | null>(null);
  const [uniqueCountLoading, setUniqueCountLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchBulk() {
      setLoading(true);
      setError(null);
      try {
        // For section, use the old logic
        if (filterType === "section") {
          const [resResponses, resQuestions] = await Promise.all([
            api.get(endpointMap[filterType](evaluationId, filterId)),
            api.get(`/studentevaluationquestion/studentevaluationquestion/by-evaluation?student_evaluation=${evaluationId}`)

          ]);
          if (!isMounted) return;
          setResponses(resResponses.data);
          setQuestions(resQuestions.data);
        } else {
          // For program/professor/faculty: fetch all evaluations for the context
          let evalsRes;
          if (filterType === "program") {
            evalsRes = await api.get(`/studentevaluation/studentevaluation/by-program?program=${filterId}`);
          } else if (filterType === "professor") {
            evalsRes = await api.get(`/studentevaluation/studentevaluation/by-professor?professor=${filterId}`);
          } else if (filterType === "faculty") {
            evalsRes = await api.get(`/studentevaluation/studentevaluation/by-faculty?faculty=${filterId}`);
          }
          let evaluationIds: number[] = [];
          if (Array.isArray(evalsRes?.data)) {
            evaluationIds = evalsRes.data.map((e: any) => e.id);
          } else if (evalsRes?.data?.id) {
            evaluationIds = [evalsRes.data.id];
          }
          // Always fetch all questions for all evaluationIds
          const allQuestions = await Promise.all(
              evaluationIds.map(eid =>
                  api.get(`/studentevaluationquestion/studentevaluationquestion/by-evaluation?student_evaluation=${eid}`)
              )
          );
          const questions = allQuestions.flatMap(res => res.data);
          // Fetch all responses for the context
          const resResponses = await api.get(endpointMap[filterType](evaluationId, filterId));
          if (!isMounted) return;
          setResponses(resResponses.data);
          setQuestions(questions);
        }
      } catch (e) {
        if (!isMounted) return;
        setError("Failed to fetch responses or questions");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    if (!evaluationId || !filterId) return;
    fetchBulk();
    return () => { isMounted = false; };
  }, [evaluationId, filterType, filterId]);

  useEffect(() => {
    async function fetchUniqueCount() {
      setUniqueCountLoading(true);
      try {
        let endpoint = '';

        if (filterType === "section") {
          endpoint = `/studentevaluationresponse/studentevaluationresponse/unique-count-by-evaluation?student_evaluation=${evaluationId}`;
        } else if (filterType === "program") {
          endpoint = `/studentevaluationresponse/studentevaluationresponse/unique-count-by-program?program=${filterId}`;
        } else if (filterType === "professor") {
          endpoint = `/studentevaluationresponse/studentevaluationresponse/unique-count-by-professor?professor=${filterId}`;
        } else if (filterType === "faculty") {
          endpoint = `/studentevaluationresponse/studentevaluationresponse/unique-count-by-faculty?faculty=${filterId}`;
        }

        if (endpoint) {
          const res = await api.get(endpoint);
          setUniqueStudentCount(res.data.unique_response_count);
        }
      } catch (e) {
        setUniqueStudentCount(null);
      } finally {
        setUniqueCountLoading(false);
      }
    }

    if (!filterId) return;
    fetchUniqueCount();
  }, [evaluationId, filterType, filterId, responses, questions]);

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

  const ratingQuestions = Object.values(groupedByQuestion).filter(
    (arr) => arr[0]?.question_type?.toUpperCase() === "RATING"
  );
  const mcqQuestions = Object.values(groupedByQuestion).filter(
    (arr) => arr[0]?.question_type?.toUpperCase() === "MCQ"
  );

  const tableTitle = {
    section: "Section Response Charts",
    professor: "Professor Response Charts",
    program: "Program Response Charts",
    faculty: "Faculty Response Charts",
  }[filterType];

  return (
    <div className="w-full overflow-x-auto text-white shadow-xl">
      <table className="table text-lg">
        <thead className="sticky top-0 z-1 bg-[#1c402a] text-xl font-bold text-white">
          <tr>
            <th>{tableTitle}</th>
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

                      {/* Student Response Count Display */}
                      <div className="mb-6 p-4 bg-[rgba(28,64,42,0.18)] rounded-lg border border-[rgba(28,64,42,0.35)]">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-full" style={{ backgroundColor: hexToRgba(PRIMARY_HEX, 0.25) }}>
                              <svg className="w-6 h-6" style={{ color: hexToRgba(PRIMARY_HEX, 0.9) }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-white">
                                {filterType === "section" && "Students Who Responded"}
                                {filterType === "program" && "Students Who Responded (Program-wide)"}
                                {filterType === "professor" && "Students Who Responded (Professor-wide)"}
                                {filterType === "faculty" && "Students Who Responded (Faculty-wide)"}
                              </h3>
                              <p className="text-sm text-gray-300">
                                {filterType === "section" && "Unique students who answered questions in this section"}
                                {filterType === "program" && "Unique students who answered questions across all evaluations in this program"}
                                {filterType === "professor" && "Unique students who answered questions across all evaluations by this professor"}
                                {filterType === "faculty" && "Unique students who answered questions across all evaluations in this faculty"}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            {uniqueCountLoading ? (
                              <div className="flex items-center space-x-2">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderColor: hexToRgba(PRIMARY_HEX, 0.9) }}></div>
                                <span className="text-gray-300">Loading...</span>
                              </div>
                            ) : (
                              <div className="backdrop-blur-sm rounded-lg px-4 py-2 border" style={{ backgroundColor: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.20)" }}>
                                <div className="text-3xl font-bold text-white">
                                  {uniqueStudentCount !== null ? uniqueStudentCount : '—'}
                                </div>
                                <div className="text-xs text-gray-300 uppercase tracking-wide">
                                  {uniqueStudentCount === 1 ? 'Student' : 'Students'}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {uniqueStudentCount !== null && uniqueStudentCount > 0 && (
                          <div className="mt-3 pt-3 border-t border-white/10">
                            <div className="flex items-center space-x-4 text-sm text-gray-300">
                              <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: hexToRgba(PRIMARY_HEX, 0.85) }}></div>
                                <span>Active Responses</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: hexToRgba(PRIMARY_HEX, 0.55) }}></div>
                                <span>
                                  {filterType === "section" && "Section Level"}
                                  {filterType === "program" && "Program Level"}
                                  {filterType === "professor" && "Professor Level"}
                                  {filterType === "faculty" && "Faculty Level"}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {uniqueStudentCount === 0 && !uniqueCountLoading && (
                          <div className="mt-3 pt-3 border-t border-white/10">
                            <div className="flex items-center space-x-2 text-sm text-yellow-300">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                              </svg>
                              <span>No student responses found for this {filterType}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Bar chart for each rating question */}
                      {ratingQuestions.length > 0 && (
                        <div className="mb-6">
                          <h6 className="font-bold mb-2">Rating Scale Results</h6>
                          <div className="flex flex-wrap -mx-2">
                            {ratingQuestions.map((responses, idx) => {
                              const answerCounts: Record<string, number> = {};
                              responses.forEach((r) => {
                                answerCounts[r.answer] = (answerCounts[r.answer] || 0) + 1;
                              });

                              const labels = Object.keys(answerCounts);
                              const values = Object.values(answerCounts);

                              // Single-hue (primary) palette with varied alpha per bar
                              const backgroundColors = primaryAlphaScale(labels.length);
                              const borderColors = labels.map(() => hexToRgba(PRIMARY_HEX, 0.95));

                              const barData = {
                                labels,
                                datasets: [
                                  {
                                    label: "Number of Responses",
                                    data: values,
                                    backgroundColor: backgroundColors,
                                    borderColor: borderColors,
                                    borderWidth: 2,
                                    borderRadius: 6,
                                    borderSkipped: false,
                                    hoverBackgroundColor: labels.map(() => hexToRgba(PRIMARY_HEX, 0.85)),
                                    hoverBorderColor: labels.map(() => hexToRgba(PRIMARY_HEX, 1)),
                                  },
                                ],
                              };

                              const barOptions: ChartOptions<'bar'> = {
                                ...baseDarkOptions,
                                indexAxis: "y",
                                plugins: {
                                  ...baseDarkOptions.plugins,
                                  legend: { display: false },
                                  tooltip: {
                                    ...baseDarkOptions.plugins.tooltip,
                                    callbacks: {
                                      label: function(context: any) {
                                        const label = context.label || '';
                                        const value = context.parsed.x || 0;
                                        const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                                        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
                                        return `${label}: ${value} responses (${percentage}%)`;
                                      },
                                    },
                                  },
                                },
                              };

                              return (
                                <div key={idx} className="w-full md:w-1/2 px-2 mb-6 flex flex-col items-center">
                                  <div className="mb-2 font-medium text-center">
                                    Q{responses[0].student_eval_question}: {responses[0].question_text || "Rating Question"}
                                  </div>

                                  {/* Rating scale legend */}
                                  <div className="mb-3 p-2 rounded-lg w-full max-w-sm" style={{ backgroundColor: "rgba(17,17,17,0.5)" }}>
                                    <div className="text-xs font-semibold text-gray-300 mb-1">Rating Scale:</div>
                                    <div className="text-xs text-gray-400 space-y-1">
                                      {labels.map((rating, ratingIdx) => (
                                        <div key={ratingIdx} className="flex items-center justify-between">
                                          <div className="flex items-center">
                                            <div
                                              className="w-3 h-3 rounded mr-2 flex-shrink-0"
                                              style={{ backgroundColor: backgroundColors[ratingIdx] }}
                                            ></div>
                                            <span className="truncate">{rating}</span>
                                          </div>
                                          <span className="font-medium text-white ml-2">
                                            {answerCounts[rating]}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="w-full max-w-sm h-64 flex items-center justify-center">
                                    <Bar data={barData} options={barOptions} />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Pie chart for each MCQ question */}
                      {mcqQuestions.length > 0 && (
                        <div>
                          <h6 className="font-bold mb-2">MCQ Results</h6>
                          <div className="flex flex-wrap -mx-2">
                            {mcqQuestions.map((responses, idx) => {
                              const choices: string[] = responses[0]?.choices || [];
                              const answerCounts: Record<string, number> = {};
                              choices.forEach((choice) => { answerCounts[choice] = 0; });
                              responses.forEach((r) => { answerCounts[r.answer] = (answerCounts[r.answer] || 0) + 1; });

                              // Build a monochrome (primary) palette across choices
                              const pieBg = primaryAlphaScale(Math.max(choices.length, 1));
                              const pieBorder = pieBg.map(() => hexToRgba(PRIMARY_HEX, 0.95));

                              const pieData = {
                                labels: choices,
                                datasets: [
                                  {
                                    data: choices.map((c) => answerCounts[c] || 0),
                                    backgroundColor: pieBg,
                                    borderWidth: 2,
                                    borderColor: pieBorder,
                                    hoverBackgroundColor: choices.map((_, i) => hexToRgba(PRIMARY_HEX, Math.min(1, 0.35 + (i * 0.08)))),
                                    hoverBorderColor: pieBorder,
                                  },
                                ],
                              };

                              const pieOptions: ChartOptions<"pie"> = {
                                ...baseDarkOptions,
                                plugins: {
                                  ...baseDarkOptions.plugins,
                                  legend: {
                                    ...baseDarkOptions.plugins.legend,
                                    position: "bottom",
                                  },
                                  tooltip: {
                                    ...baseDarkOptions.plugins.tooltip,
                                    callbacks: {
                                      label: function(context: any) {
                                        const label = context.label || '';
                                        const value = context.parsed || 0;
                                        const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                                        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
                                        return `${label}: ${value} responses (${percentage}%)`;
                                      },
                                    },
                                  },
                                },
                                scales: undefined, // pies don’t use scales
                              };

                              return (
                                <div key={idx} className="w-full md:w-1/2 px-2 mb-6 flex flex-col items-center">
                                  <div className="mb-2 font-medium text-center">
                                    Q{responses[0].student_eval_question}: {responses[0].question_text || "MCQ Question"}
                                  </div>

                                  {/* Available choices display */}
                                  <div className="mb-3 p-2 rounded-lg w-full max-w-xs" style={{ backgroundColor: "rgba(17,17,17,0.5)" }}>
                                    <div className="text-xs font-semibold text-gray-300 mb-1">Available Choices:</div>
                                    <div className="text-xs text-gray-400 space-y-1">
                                      {choices.map((choice, choiceIdx) => (
                                        <div key={choiceIdx} className="flex items-center">
                                          <div
                                            className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                                            style={{ backgroundColor: pieBg[choiceIdx % pieBg.length] }}
                                          ></div>
                                          <span className="truncate">{choice}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="w-full max-w-xs h-64 flex items-center justify-center">
                                    <Pie data={pieData} options={pieOptions} />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {ratingQuestions.length === 0 && mcqQuestions.length === 0 && !loading && (
                        <div>No rating or MCQ responses found for this {filterType}.</div>
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

export default ResponsesChartsTable;
