import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { LineElement, PointElement, LineController } from "chart.js";
import { Scatter } from "react-chartjs-2";
import { SankeyController, Flow } from "chartjs-chart-sankey";
import { Chart } from "react-chartjs-2";
import { useEffect, useMemo, useState } from "react";
import api from "../../utils/api.ts";
import BreadAndLogout from "../../Components/Bread and Logout.tsx";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  LineController,
  Flow,
  SankeyController,
);

// Keep base ChartJS registration for other charts
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

interface ResourceGroupProps {
  setActiveView: (view: string) => void;
}

type Tallies = Record<string, { count: number } | number>;
type ProfessorAgg = {
  studentTallies: Record<string, { count: number }>;
  teacherTallies: Record<string, { count: number }>;
  evaluationIds: string[];
};

// Helper: detect if a key looks like an evaluation id (including negatives like "-1")
const isLikelyEvaluationId = (key: string) => /^-?\d+$/.test(key);

// Helper: pull an evaluation id from a key or entry
const extractEvaluationId = (key: string, value: any): string | null => {
  if (isLikelyEvaluationId(key)) return key;
  if (value?.evaluation_id != null) return String(value.evaluation_id);
  return null;
};

// Helper: extract a professor name from entry or mapping, else fallback
const resolveProfessorName = (key: string, value: any, evalToProfessor: Record<string, string>): string => {
  // Prefer name fields on the entry itself if present
  const inlineName =
    value?.professor ||
    value?.professor_name ||
    value?.instructor ||
    value?.teacher ||
    value?.faculty_name;

  if (inlineName) return inlineName;

  // Next try evaluationId → professor map
  const evalId = extractEvaluationId(key, value);
  if (evalId && evalToProfessor[evalId]) return evalToProfessor[evalId];

  // If key itself is a non-eval id label, treat key as the name
  if (!isLikelyEvaluationId(key)) return key;

  // Fallback
  return "Unknown Professor";
};

// Helper: normalize tally objects to consistent { count } shape and sum into target
const addTalliesInto = (
  target: Record<string, { count: number }>,
  source: Tallies | undefined | null
) => {
  if (!source) return;
  Object.entries(source).forEach(([label, v]) => {
    const c = typeof v === "number" ? v : (v?.count ?? 0);
    if (!target[label]) target[label] = { count: 0 };
    target[label].count += c;
  });
};

// Groups raw COPUS summary data by professor, replacing evaluation-id keys with professor names
const groupCopusByProfessor = (rawData: any, evalToProfessor: Record<string, string>) => {
  const professorAggregates: Record<string, ProfessorAgg> = {};
  let totalActiveLearningPercentage: number | null = null;

  if (typeof rawData?.totalActiveLearningPercentage === "number") {
    totalActiveLearningPercentage = rawData.totalActiveLearningPercentage;
  }

  Object.keys(rawData || {}).forEach((key) => {
    if (key === "totalActiveLearningPercentage") return;

    const entry = rawData[key] || {};
    const profName = resolveProfessorName(key, entry, evalToProfessor);
    if (!professorAggregates[profName]) {
      professorAggregates[profName] = {
        studentTallies: {},
        teacherTallies: {},
        evaluationIds: [],
      };
    }

    // Track evaluation IDs if we can detect one
    const maybeEvalId = extractEvaluationId(key, entry);
    if (maybeEvalId) {
      professorAggregates[profName].evaluationIds.push(maybeEvalId);
    }

    // Sum student/teacher tallies
    addTalliesInto(professorAggregates[profName].studentTallies, entry?.studentTallies);
    addTalliesInto(professorAggregates[profName].teacherTallies, entry?.teacherTallies);
  });

  return { professorAggregates, totalActiveLearningPercentage };
};

// Fetch all evaluations by faculty and build a map: evaluation id → professor name
// Adjust endpoint/params if your API differs.
const fetchEvaluationProfessorMapByFaculty = async (facultyId: string): Promise<Record<string, string>> => {
  const map: Record<string, string> = {};
  try {
    // If you already have a function to fetch all evaluations by faculty (including AALP),
    // use that same endpoint here to get evaluation metadata with professor names.
    const endpoint = "/evaluation/evaluations/by-faculty";
    const params: any = { faculty: facultyId }; // If your API expects `faculty_id`, change key accordingly.

    const res = await api.get(endpoint, { params });
    const evaluations: any[] = Array.isArray(res.data) ? res.data : [];

    evaluations.forEach((e: any) => {
      const id = e?.id ?? e?.evaluation_id;
      if (id == null) return;
      const professorName =
        e?.professor ||
        e?.professor_name ||
        e?.instructor ||
        e?.teacher ||
        e?.faculty_name ||
        e?.faculty?.name ||
        e?.professor?.name ||
        `Professor ${id}`;
      map[String(id)] = professorName;
    });
  } catch (err) {
    console.warn("[DEBUG] Could not fetch evaluations for professor mapping; falling back to inline names.", err);
  }
  return map;
};

function LeanSixSigma({ setActiveView }: ResourceGroupProps) {
  const [showRetentionDialog, setShowRetentionDialog] = useState(false);
  const [formYear, setFormYear] = useState<'1st' | '2nd' | '3rd' | '4th'>('1st');
  const [formSemester, setFormSemester] = useState<'1st' | '2nd' | 'Summer'>('1st');
  const [formRetention, setFormRetention] = useState<string>("");
  const [copusData, setCopusData] = useState<any>(null);
  const [copusLoading, setCopusLoading] = useState(false);
  const [copusError, setCopusError] = useState<string | null>(null);
  const [studentTallies, setStudentTallies] = useState<{ code: string; count: number; summary: string }[]>([]);
  const [teacherTallies, setTeacherTallies] = useState<{ code: string; count: number; summary: string }[]>([]);
  const [professorCount, setProfessorCount] = useState(0);
  const [avgActiveLearning, setAvgActiveLearning] = useState<number | null>(null);
  const [maxActivityPoints, setMaxActivityPoints] = useState(0);
  const [sankeyData, setSankeyData] = useState<any>(null);
  // Retention vs Responses regression state
  const [retentionPoints, setRetentionPoints] = useState<any[] | null>(null);
  const [regression, setRegression] = useState<any | null>(null);
  const [retentionLoading, setRetentionLoading] = useState(false);
  const [retentionError, setRetentionError] = useState<string | null>(null);
  // Retention save dialog state
  const [savingRetention, setSavingRetention] = useState(false);
  const [retentionSaveError, setRetentionSaveError] = useState<string | null>(null);
  const [formSemesters, setFormSemesters] = useState<string[]>(['1st', '2nd']);
  // Filters for comparison (year levels and semesters)
  const yearLevelOptions = ['1st','2nd','3rd','4th'] as const;
  const semesterOptions = ['1st','2nd','Summer'] as const;
  const [visibleYearLevels, setVisibleYearLevels] = useState<string[]>([...yearLevelOptions]);
  const [visibleSemesters, setVisibleSemesters] = useState<string[]>([...semesterOptions]);

  // Sentiment Analysis Summary state
  const [sentimentSummary, setSentimentSummary] = useState<any>(null);
  const [sentimentLoading, setSentimentLoading] = useState(false);
  const [sentimentError, setSentimentError] = useState<string | null>(null);
  const [sentimentBySemester, setSentimentBySemester] = useState<any>(null);
  const [sentimentByYear, setSentimentByYear] = useState<any>(null);

  const STUDENT_CODE_MAP: Record<string, string> = {
    'Listening': 'L',
    'Individual Thinking': 'Ind',
    'Group': 'Grp',
    'Answer Question': 'AnQ',
    'Ask Question': 'AsQ',
    'Whole Class Discussion': 'WC',
    'Student Presentations': 'SP',
    'Test/Quiz': 'TQ',
    'Waiting': 'Wait',
    'Other': 'Other',
  };
  const TEACHER_CODE_MAP: Record<string, string> = {
    'Lecture': 'Lec',
    'Realtime Writing': 'RW',
    'Moving/Guiding': 'MG',
    'Answer Questions': 'AnQs',
    'Pose Question': 'PQ',
    'Follow-up Question': 'FUp',
    '1-on-1 discussion': '1o1',
    'Demonstrate/Video': 'D/v',
    'Administrative': 'Admin',
    'Waiting': 'Wait',
    'Other': 'Other',
  };
  const makeCode = (summary: string, map: Record<string, string>) =>
    map[summary] || summary.replace(/[^A-Za-z0-9 ]/g, '').split(' ').map(w => w[0]).join('').slice(0, 4);

  // Fetch copus summary data on mount
  useEffect(() => {
    const fetchCopusSummary = async () => {
      setCopusLoading(true);
      setCopusError(null);
      try {
        const token = localStorage.getItem("token");
        const faculty_id = localStorage.getItem("faculty_id");
        const isSuperuser = localStorage.getItem("is_superuser") === "true";
        let endpoint = "";
        const params: any = {};

        if (isSuperuser) {
          console.log("[DEBUG] User is superuser: showing all faculties");
          endpoint = "/evaluation/evaluations/copus-summary-by-faculty/";
        } else if (faculty_id) {
          console.log(`[DEBUG] Fetching for faculty_id: ${faculty_id}`);
          endpoint = "/evaluation/evaluations/copus-summary-by-faculty/";
          params.faculty = faculty_id; // If your API expects `faculty_id`, change this accordingly.
        } else {
          setCopusError("No faculty_id found for user");
          return;
        }

        console.log("[DEBUG] API request:", {
          url: (api.defaults?.baseURL || "") + endpoint,
          params,
          headers: { Authorization: `Bearer ${token ? token.substring(0, 8) + '...' : ''}` },
        });

        const response = await api.get(endpoint, { params });
        console.log("[DEBUG] Copus summary API response:", response.data);
        const raw = response.data || {};

        // Build evaluationId → professor map when possible
        let evalToProfessor: Record<string, string> = {};
        if (!isSuperuser && faculty_id) {
          evalToProfessor = await fetchEvaluationProfessorMapByFaculty(faculty_id);
        } else {
          console.log("[DEBUG] Skipping evaluation→professor mapping fetch for superuser or missing faculty.");
        }

        // Group by professor (replace eval-id keys with professor names using mapping and aggregate)
        const {
          professorAggregates,
          totalActiveLearningPercentage
        } = groupCopusByProfessor(raw, evalToProfessor);

        // Debug: show mapping of professor -> evaluation IDs
        const mappingLog = Object.entries(professorAggregates).map(([prof, agg]) => ({
          professor: prof,
          evaluationIds: agg.evaluationIds,
          copusCount: agg.evaluationIds.length
        }));
        console.log("[DEBUG] COPUS Professor/Evaluation mapping:", mappingLog);

        // Aggregate tallies across all professors for the summary tables
        const studentCountMap: Record<string, number> = {};
        const teacherCountMap: Record<string, number> = {};

        Object.values(professorAggregates).forEach((agg) => {
          const st = agg.studentTallies || {};
          const tt = agg.teacherTallies || {};
          Object.keys(st).forEach((label) => {
            const c = st[label]?.count || 0;
            studentCountMap[label] = (studentCountMap[label] || 0) + c;
          });
          Object.keys(tt).forEach((label) => {
            const c = tt[label]?.count || 0;
            teacherCountMap[label] = (teacherCountMap[label] || 0) + c;
          });
        });

        const studentRows = Object.entries(studentCountMap).map(([summary, count]) => ({
          summary,
          count: count as number,
          code: makeCode(summary, STUDENT_CODE_MAP),
        })).sort((a, b) => b.count - a.count);

        const teacherRows = Object.entries(teacherCountMap).map(([summary, count]) => ({
          summary,
          count: count as number,
          code: makeCode(summary, TEACHER_CODE_MAP),
        })).sort((a, b) => b.count - a.count);

        setStudentTallies(studentRows);
        setTeacherTallies(teacherRows);

        const professorCountLocal = Object.keys(professorAggregates).length;
        setProfessorCount(professorCountLocal);

        const avg = typeof totalActiveLearningPercentage === 'number' ? totalActiveLearningPercentage : null;
        setAvgActiveLearning(avg);

        // Compute Max count per Activity points across all COPUS evaluations
        const allCounts = [
          ...Object.values(studentCountMap),
          ...Object.values(teacherCountMap),
        ];
        const computedMax = allCounts.length ? Math.max(...allCounts) : 0;
        setMaxActivityPoints(computedMax);

        // Store aggregated data
        setCopusData(professorAggregates);

        // Build Sankey flows: Professor -> Activity counts (aggregated)
        const flows: any[] = [];
        Object.entries(professorAggregates).forEach(([profName, agg]) => {
          const st = agg.studentTallies || {};
          const tt = agg.teacherTallies || {};
          [...Object.entries(st), ...Object.entries(tt)].forEach(([activity, info]) => {
            const count = (info as any)?.count || 0;
            if (count > 0) {
              flows.push({
                from: profName,
                to: activity,
                flow: count,
              });
            }
          });
        });

        setSankeyData({
          datasets: [
            {
              label: "Professor → Activity",
              data: flows,
              colorFrom: "red",
              colorTo: "orange",
              colorMode: "gradient",
            },
          ],
        });

      } catch (e: any) {
        console.error("[DEBUG] Error fetching copus summary:", e);
        setCopusError(e?.message || "Unknown error");
      } finally {
        setCopusLoading(false);
      }
    };

    fetchCopusSummary();
  }, []);

  // Also fetch Student Evaluations (SFF) by faculty and print debug logs
  useEffect(() => {
    const fetchSFF = async () => {
      try {
        const token = localStorage.getItem("token");
        const faculty_id = localStorage.getItem("faculty_id");
        const isSuperuser = localStorage.getItem("is_superuser") === "true";

        const endpointEvals = "/studentevaluation/studentevaluation/by-faculty";
        const endpointResponses = "/studentevaluationresponse/studentevaluationresponse/by-faculty";
        const params: any = {};

        if (isSuperuser && !faculty_id) {
          console.log("[DEBUG] SFF: superuser detected but no faculty_id provided; skipping fetch.");
          return;
        }
        if (!faculty_id) {
          console.log("[DEBUG] SFF: No faculty_id found for user; skipping fetch.");
          return;
        }
        params.faculty = faculty_id;

        console.log("[DEBUG] SFF API requests:", {
          evalsUrl: (api.defaults?.baseURL || "") + endpointEvals,
          responsesUrl: (api.defaults?.baseURL || "") + endpointResponses,
          params,
          headers: { Authorization: `Bearer ${token ? token.substring(0, 8) + '...' : ''}` },
        });

        // 1) Fetch all student evaluations for this faculty
        const evalsRes = await api.get(`${endpointEvals}`, { params });
        const evaluations = Array.isArray(evalsRes.data) ? evalsRes.data : [];
        const evaluationIds = evaluations.map((e: any) => e.id);
        console.log("[DEBUG] SFF StudentEvaluations count:", evaluations.length);
        console.log("[DEBUG] SFF StudentEvaluation IDs:", evaluationIds);

        // Optional: derive a professor mapping for SFF as well (for consistency with COPUS)
        const sffProfessorMap = evaluations.reduce((acc: Record<string, number[]>, e: any) => {
          const prof =
            e?.professor ||
            e?.professor_name ||
            e?.instructor ||
            e?.teacher ||
            "Unknown Professor";
          if (!acc[prof]) acc[prof] = [];
          acc[prof].push(e.id);
          return acc;
        }, {});
        console.log("[DEBUG] SFF Professor/Evaluation mapping:", sffProfessorMap);

        // 2) Fetch all questions for each evaluation
        const questionsResults = await Promise.all(
          evaluationIds.map((id: number) =>
            api.get(`/studentevaluationquestion/studentevaluationquestion/by-evaluation?student_evaluation=${id}`)
          )
        );
        const allQuestions = questionsResults.flatMap((res: any) => res.data || []);
        console.log("[DEBUG] SFF Questions total:", allQuestions.length);

        // 3) Fetch all responses for this faculty
        const responsesRes = await api.get(`${endpointResponses}`, { params });
        const responses = Array.isArray(responsesRes.data) ? responsesRes.data : [];
        console.log("[DEBUG] SFF Responses total:", responses.length);

        // 4) Sample logs
        if (evaluations.length) console.log("[DEBUG] SFF Sample Evaluation:", evaluations[0]);
        if (allQuestions.length) console.log("[DEBUG] SFF Sample Question:", allQuestions[0]);
        if (responses.length) console.log("[DEBUG] SFF Sample Response:", responses[0]);
      } catch (e: any) {
        console.error("[DEBUG] Error fetching SFF (Student Evaluations) data:", e?.message || e);
      }
    };
    fetchSFF();
  }, []);

  // Fetch Retention vs Responses regression (multi-series)
  useEffect(() => {
    const run = async () => {
      setRetentionLoading(true);
      setRetentionError(null);
      try {
        const res = await api.get('/analytics/retention-regression/');
        const series = Array.isArray(res.data?.series) ? res.data.series : [];
        // Flatten points for quick checks but keep full series for chart build
        setRetentionPoints(series);
        setRegression(null); // regression handled per-series now
      } catch (e: any) {
        console.error('[DEBUG] Retention regression error:', e?.message || e);
        setRetentionError(e?.message || 'Failed to load regression.');
      } finally {
        setRetentionLoading(false);
      }
    };
    run();
  }, []);

  // Fetch Sentiment Analysis Summary
  useEffect(() => {
    const fetchSentimentSummary = async () => {
      setSentimentLoading(true);
      setSentimentError(null);
      try {
        const token = localStorage.getItem("token");
        const faculty_id = localStorage.getItem("faculty_id");
        const isSuperuser = localStorage.getItem("is_superuser") === "true";

        const params: any = {};
        if (!isSuperuser && faculty_id) {
          params.faculty = faculty_id;
        }

        console.log("[DEBUG] Fetching sentiment summary with params:", params);

        // Fetch overall sentiment summary
        const summaryRes = await api.get('/studentevaluationresponse/studentevaluationresponse/sentiment-summary', { params });
        setSentimentSummary(summaryRes.data);
        console.log("[DEBUG] Sentiment summary:", summaryRes.data);

        // Fetch sentiment summary by semester
        const semesterRes = await api.get('/studentevaluationresponse/studentevaluationresponse/sentiment-summary-by-semester', { params });
        setSentimentBySemester(semesterRes.data);
        console.log("[DEBUG] Sentiment by semester:", semesterRes.data);

        // Fetch sentiment summary by year
        const yearRes = await api.get('/studentevaluationresponse/studentevaluationresponse/sentiment-summary-by-year', { params });
        setSentimentByYear(yearRes.data);
        console.log("[DEBUG] Sentiment by year:", yearRes.data);

      } catch (e: any) {
        console.error('[DEBUG] Sentiment summary error:', e?.message || e);
        setSentimentError(e?.message || 'Failed to load sentiment summary.');
      } finally {
        setSentimentLoading(false);
      }
    };
    fetchSentimentSummary();
  }, []);

  const colorPool = [
    'rgba(59,130,246,0.8)', // blue
    'rgba(34,197,94,0.8)',  // green
    'rgba(234,179,8,0.8)',  // amber
    'rgba(244,63,94,0.8)',  // rose
    'rgba(168,85,247,0.8)', // purple
    'rgba(20,184,166,0.8)', // teal
  ];

  const scatterData = useMemo(() => {
    if (!Array.isArray(retentionPoints)) return null;
    const datasets: any[] = [];
    const filtered = (retentionPoints as any[]).filter((series: any) =>
      (!series?.key?.year || visibleYearLevels.includes(series.key.year)) &&
      (!series?.key?.semester || visibleSemesters.includes(series.key.semester))
    );
    filtered.forEach((series: any, idx: number) => {
      const color = colorPool[idx % colorPool.length];
      datasets.push({
        label: series?.label || `Series ${idx + 1}`,
        data: (series?.points || []).map((p: any) => ({ x: Number(p.x), y: Number(p.y) })),
        backgroundColor: color,
        pointRadius: 4,
        pointHoverRadius: 6,
      });
      if (series?.regression && (series?.points || []).length) {
        const xs = series.points.map((p: any) => Number(p.x));
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const a = series.regression.intercept;
        const b = series.regression.slope;
        datasets.push({
          label: `${series.label} — Regression`,
          data: [{ x: minX, y: a + b * minX }, { x: maxX, y: a + b * maxX }],
          showLine: true,
          borderColor: color.replace('0.8', '1'),
          backgroundColor: 'rgba(0,0,0,0)',
          pointRadius: 0,
          borderWidth: 2,
        });
      }
    });
    return { datasets };
  }, [retentionPoints]);

  const scatterOptions: any = useMemo(() => ({
    responsive: true,
    plugins: {
      legend: { labels: { color: '#fff' } },
      title: {
        display: true,
        text: 'Retention vs Responses — per Year & Semester',
        color: '#fff',
      },
      tooltip: {
        callbacks: {
          label: (ctx: any) => `x=${ctx.raw.x.toFixed(3)}, y=${ctx.raw.y.toFixed(2)}%`,
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: 'Average Response Points', color: '#fff' },
        ticks: { color: '#fff' },
        grid: { color: 'rgba(255,255,255,0.1)' },
      },
      y: {
        title: { display: true, text: 'Retention Rate (%)', color: '#fff' },
        ticks: { color: '#fff' },
        grid: { color: 'rgba(255,255,255,0.1)' },
      },
    },
  }), []);

  const sankeyOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: "#fff"
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const d = context.dataset.data[context.dataIndex];
            return `${d.from} → ${d.to}: ${d.flow}`;
          }
        }
      }
    }
  };

  const lineData = {
    labels: ["January", "February", "March", "April", "May"],
    datasets: [
      {
        label: "Performance Over Time",
        data: [60, 70, 75, 80, 90],
        fill: false,
        borderColor: "rgba(59,130,246,1)",
        backgroundColor: "rgba(59,130,246,0.5)",
        tension: 0.3,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: "#fff",
        },
      },
      title: {
        display: true,
        text: "Trend Analysis",
        color: "#fff",
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#fff",
        },
        grid: {
          color: "rgba(255,255,255,0.1)",
        },
      },
      y: {
        ticks: {
          color: "#fff",
        },
        grid: {
          color: "rgba(255,255,255,0.1)",
        },
      },
    },
  };

  return (
    <div className="custom-container">
      {/* Breadcrumbs */}
      <BreadAndLogout
        setActiveView={setActiveView}
        breadcrumbs={[
          { label: "Home", view: "home" },
          { label: "Profile View" },
        ]}
      />
      <h2 className="mt-4 text-3xl font-bold text-white">
        Lean Six Sigma Statistics
      </h2>
      <span className="font-thin text-[#888888] block mb-6">
        This is where you can explore performance dashboards based on Lean Six Sigma practices, helping you identify gaps, reduce inefficiencies, and focus on continuous improvement.
      </span>
      <div className="mt-4 flex w-full flex-row items-center justify-center gap-4 border-b border-gray-600 pb-4 text-white shadow-2xl">
        Filter:
        <button className="btn btn-primary text-white">College</button>
        <button className="btn btn-primary text-white">Semester</button>
        <button className="btn btn-primary text-white">School Year</button>
        <button className="btn btn-secondary text-white" onClick={() => setShowRetentionDialog(true)}>Add Retention</button>
      </div>
      <div className="mt-6 flex h-full w-full flex-col gap-6 overflow-y-auto px-6">
        <div className="stats shrink-0 bg-[#1c402a]/20 p-0 shadow-2xl">
          <div className="stat">
            <div className="stat-figure text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block h-8 w-8 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
            <div className="stat-title text-gray-400">
              Total Professors
            </div>
            <div className="stat-value">{professorCount}</div>
          </div>

          <div className="stat">
            <div className="stat-figure text-gray=400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block h-8 w-8 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                ></path>
              </svg>
            </div>
            <div className="stat-title text-gray-400">
              Average Active Learning Percentage
            </div>
            <div className="stat-value">{avgActiveLearning !== null ? `${avgActiveLearning}%` : '—'}</div>
          </div>

          <div className="stat">
            <div className="stat-figure text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block h-8 w-8 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                ></path>
              </svg>
            </div>
            <div className="stat-title text-gray-400">
              Max count per Activity points
            </div>
            <div className="stat-value">{maxActivityPoints}</div>
          </div>

          <div className="stat">
            <div className="stat-figure text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block h-8 w-8 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
            <div className="stat-title text-gray-400">
              Average Sentiment Score
            </div>
            <div className="stat-value">
              {sentimentLoading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : sentimentError ? (
                <span className="text-red-400">Error</span>
              ) : sentimentSummary ? (
                <span className={`${sentimentSummary.average_sentiment_score > 0 ? 'text-green-400' :
                  sentimentSummary.average_sentiment_score < 0 ? 'text-red-400' :
                    'text-yellow-400'
                  }`}>
                  {sentimentSummary.average_sentiment_score > 0 ? '+' : ''}{sentimentSummary.average_sentiment_score}
                </span>
              ) : '—'}
            </div>
            <div className="stat-desc text-gray-500">
              {sentimentSummary && `${sentimentSummary.total_responses} responses analyzed`}
            </div>
          </div>
        </div>
        <div className="flex flex-row items-center justify-center gap-4 border-t border-gray-600 pt-4 text-white">
          Observation Summary:
          <button className="btn btn-primary text-white">
            Filter All
          </button>
        </div>
        <div className="flex h-full flex-row gap-6">
          <div className="flex h-full w-1/2 flex-col items-start justify-start overflow-y-auto rounded-lg p-6 shadow-2xl backdrop-blur-lg">
            <table className="mt-2 w-full table-auto border border-gray-600 text-left text-white">
              <thead>
                <tr className="border border-gray-600">
                  <th className="border border-gray-600 px-4 py-2">
                    Code
                  </th>
                  <th className="border border-gray-600 px-4 py-2">
                    Count
                  </th>
                  <th className="border border-gray-600 px-4 py-2">
                    Summary
                  </th>
                </tr>
              </thead>
              <tbody>
                {studentTallies.map((row) => (
                  <tr key={row.summary} className="border border-gray-600">
                    <td className="border border-gray-600 px-4 py-2">{row.code}</td>
                    <td className="border border-gray-600 px-4 py-2">{row.count}</td>
                    <td className="border border-gray-600 px-4 py-2">{row.summary}</td>
                  </tr>
                ))}
                {studentTallies.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-2 text-center text-gray-400">No student
                      activities found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex h-full w-1/2 flex-col items-start justify-start overflow-y-auto rounded-lg p-6 shadow-2xl backdrop-blur-lg">
            <table className="mt-2 w-full table-auto border border-gray-600 text-left text-white">
              <thead>
                <tr className="border border-gray-600">
                  <th className="border border-gray-600 px-4 py-2">
                    Code
                  </th>
                  <th className="border border-gray-600 px-4 py-2">
                    Count
                  </th>
                  <th className="border border-gray-600 px-4 py-2">
                    Summary
                  </th>
                </tr>
              </thead>
              <tbody>
                {teacherTallies.map((row) => (
                  <tr key={row.summary} className="border border-gray-600">
                    <td className="border border-gray-600 px-4 py-2">{row.code}</td>
                    <td className="border border-gray-600 px-4 py-2">{row.count}</td>
                    <td className="border border-gray-600 px-4 py-2">{row.summary}</td>
                  </tr>
                ))}
                {teacherTallies.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-2 text-center text-gray-400">No instructor
                      activities found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div
          className="flex h-full w-full items-center justify-center rounded-lg shadow-2xl backdrop-blur-lg p-4">
          <div className="w-full h-full">
            {sankeyData ? (
              <Chart type="sankey" data={sankeyData} options={sankeyOptions} />
            ) : (
              <p className="text-white">Loading chart...</p>
            )}
          </div>
        </div>
        <div className="mt-6 flex w-full items-center justify-center rounded-lg p-4 shadow-2xl backdrop-blur-lg">
          <div className="w-full">
            {/* Comparison filters */}
            <div className="mb-4 flex flex-wrap items-center gap-3 text-white">
              <span className="opacity-80">Compare Year Levels:</span>
              {yearLevelOptions.map((yl) => (
                <label key={yl} className="cursor-pointer flex items-center gap-1">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm"
                    checked={visibleYearLevels.includes(yl)}
                    onChange={() =>
                      setVisibleYearLevels((prev) =>
                        prev.includes(yl) ? prev.filter((v) => v !== yl) : [...prev, yl]
                      )
                    }
                  />
                  <span>{yl}</span>
                </label>
              ))}
              <span className="ml-4 opacity-80">Semesters:</span>
              {semesterOptions.map((s) => (
                <label key={s} className="cursor-pointer flex items-center gap-1">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm"
                    checked={visibleSemesters.includes(s)}
                    onChange={() =>
                      setVisibleSemesters((prev) =>
                        prev.includes(s) ? prev.filter((v) => v !== s) : [...prev, s]
                      )
                    }
                  />
                  <span>{s}</span>
                </label>
              ))}
            </div>

            {retentionLoading && <p className="text-white">Loading regression...</p>}
            {retentionError && <p className="text-red-400">{retentionError}</p>}
            {scatterData ? (
              <Scatter data={scatterData as any} options={scatterOptions} />
            ) : (
              <p className="text-white">No regression data available.</p>
            )}
          </div>
        </div>

        {/* Sentiment Analysis Summary Section */}
        <div className="mt-6 flex w-full flex-col gap-6">
          <div className="flex flex-row items-center justify-center gap-4 border-t border-gray-600 pt-4 text-white">
            <h3 className="text-xl font-semibold">Student Evaluation Sentiment Analysis</h3>
          </div>

          {sentimentLoading ? (
            <div className="flex justify-center items-center p-8">
              <span className="loading loading-spinner loading-lg text-white"></span>
              <span className="ml-2 text-white">Loading sentiment analysis...</span>
            </div>
          ) : sentimentError ? (
            <div className="alert alert-error">
              <span>Error loading sentiment data: {sentimentError}</span>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {/* Overall Sentiment Distribution */}
              {sentimentSummary && (
                <div className="rounded-lg bg-black/20 p-6 shadow-2xl backdrop-blur-lg">
                  <h4 className="mb-4 text-lg font-semibold text-white">Overall Sentiment Distribution</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="stat bg-green-900/20 rounded-lg">
                      <div className="stat-title text-green-300">Positive</div>
                      <div className="stat-value text-green-400">{sentimentSummary.sentiment_distribution?.POSITIVE || 0}</div>
                      <div className="stat-desc text-green-200">
                        {sentimentSummary.total_responses > 0 ?
                          Math.round((sentimentSummary.sentiment_distribution?.POSITIVE || 0) / sentimentSummary.total_responses * 100) : 0}%
                      </div>
                    </div>
                    <div className="stat bg-yellow-900/20 rounded-lg">
                      <div className="stat-title text-yellow-300">Neutral</div>
                      <div className="stat-value text-yellow-400">{sentimentSummary.sentiment_distribution?.NEUTRAL || 0}</div>
                      <div className="stat-desc text-yellow-200">
                        {sentimentSummary.total_responses > 0 ?
                          Math.round((sentimentSummary.sentiment_distribution?.NEUTRAL || 0) / sentimentSummary.total_responses * 100) : 0}%
                      </div>
                    </div>
                    <div className="stat bg-red-900/20 rounded-lg">
                      <div className="stat-title text-red-300">Negative</div>
                      <div className="stat-value text-red-400">{sentimentSummary.sentiment_distribution?.NEGATIVE || 0}</div>
                      <div className="stat-desc text-red-200">
                        {sentimentSummary.total_responses > 0 ?
                          Math.round((sentimentSummary.sentiment_distribution?.NEGATIVE || 0) / sentimentSummary.total_responses * 100) : 0}%
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-gray-300">
                    <p>Question Types: MCQ ({sentimentSummary.question_type_breakdown?.mcq || 0}),
                      Text ({sentimentSummary.question_type_breakdown?.text || 0}),
                      Rating ({sentimentSummary.question_type_breakdown?.rating || 0})</p>
                  </div>
                </div>
              )}

              {/* Sentiment by Semester and Year */}
              <div className="flex flex-col lg:flex-row gap-6">
                {/* By Semester */}
                {sentimentBySemester && (
                  <div className="flex-1 rounded-lg bg-black/20 p-6 shadow-2xl backdrop-blur-lg">
                    <h4 className="mb-4 text-lg font-semibold text-white">Sentiment by Semester</h4>
                    <div className="overflow-x-auto">
                      <table className="table w-full text-white">
                        <thead>
                          <tr className="border-gray-600">
                            <th className="text-gray-300">Semester</th>
                            <th className="text-gray-300">Avg Score</th>
                            <th className="text-gray-300">Responses</th>
                            <th className="text-gray-300">Positive</th>
                            <th className="text-gray-300">Negative</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(sentimentBySemester.semester_summary || {}).map(([semester, data]: [string, any]) => (
                            <tr key={semester} className="border-gray-600">
                              <td className="font-medium">{semester}</td>
                              <td className={`font-bold ${data.average_sentiment_score > 0 ? 'text-green-400' :
                                data.average_sentiment_score < 0 ? 'text-red-400' :
                                  'text-yellow-400'
                                }`}>
                                {data.average_sentiment_score > 0 ? '+' : ''}{data.average_sentiment_score}
                              </td>
                              <td>{data.total_responses}</td>
                              <td className="text-green-400">{data.sentiment_distribution?.POSITIVE || 0}</td>
                              <td className="text-red-400">{data.sentiment_distribution?.NEGATIVE || 0}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* By Year */}
                {sentimentByYear && (
                  <div className="flex-1 rounded-lg bg-black/20 p-6 shadow-2xl backdrop-blur-lg">
                    <h4 className="mb-4 text-lg font-semibold text-white">Sentiment by Year</h4>
                    <div className="overflow-x-auto">
                      <table className="table w-full text-white">
                        <thead>
                          <tr className="border-gray-600">
                            <th className="text-gray-300">Year</th>
                            <th className="text-gray-300">Avg Score</th>
                            <th className="text-gray-300">Responses</th>
                            <th className="text-gray-300">Positive</th>
                            <th className="text-gray-300">Negative</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(sentimentByYear.year_summary || {}).map(([year, data]: [string, any]) => (
                            <tr key={year} className="border-gray-600">
                              <td className="font-medium">{year}</td>
                              <td className={`font-bold ${data.average_sentiment_score > 0 ? 'text-green-400' :
                                data.average_sentiment_score < 0 ? 'text-red-400' :
                                  'text-yellow-400'
                                }`}>
                                {data.average_sentiment_score > 0 ? '+' : ''}{data.average_sentiment_score}
                              </td>
                              <td>{data.total_responses}</td>
                              <td className="text-green-400">{data.sentiment_distribution?.POSITIVE || 0}</td>
                              <td className="text-red-400">{data.sentiment_distribution?.NEGATIVE || 0}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Retention Input Dialog */}
      {showRetentionDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-md rounded-lg bg-[#1f2937] p-6 text-white shadow-2xl">
            <h3 className="mb-4 text-xl font-semibold">Add Retention Entry</h3>
            <div className="mb-3">
              <label className="mb-1 block text-sm text-gray-300">Year</label>
              <select className="select select-bordered w-full"
                value={formYear}
                onChange={(e) => setFormYear(e.target.value as any)}>
                <option value="1st">1st Year</option>
                <option value="2nd">2nd Year</option>
                <option value="3rd">3rd Year</option>
                <option value="4th">4th Year</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="mb-1 block text-sm text-gray-300">Semesters</label>
              <div className="flex flex-wrap gap-3">
                {['1st','2nd','Summer'].map((s) => (
                  <label key={s} className="cursor-pointer flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      checked={formSemesters.includes(s)}
                      onChange={() =>
                        setFormSemesters((prev) =>
                          prev.includes(s) ? prev.filter((v) => v !== s) : [...prev, s]
                        )
                      }
                    />
                    <span>{s}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="mb-1 block text-sm text-gray-300">Retention Rate (%)</label>
              <input
                type="number"
                className="input input-bordered w-full"
                placeholder="e.g., 75"
                value={formRetention}
                onChange={(e) => setFormRetention(e.target.value)}
              />
            </div>
            {retentionSaveError && (
              <div className="text-red-400 text-sm mb-2">{retentionSaveError}</div>
            )}
            <div className="flex justify-end gap-2">
              <button className="btn" onClick={() => setShowRetentionDialog(false)} disabled={savingRetention}>Cancel</button>
              <button className="btn btn-primary" disabled={savingRetention} onClick={async () => {
                setRetentionSaveError(null);
                const rr = Number(formRetention);
                if (isNaN(rr) || rr < 0 || rr > 100) {
                  setRetentionSaveError('Retention rate must be a number between 0 and 100');
                  return;
                }
                if (!formSemesters.length) {
                  setRetentionSaveError('Select at least one semester');
                  return;
                }
                setSavingRetention(true);
                try {
                  const payload: any = { year: formYear, semesters: formSemesters, retention_rate: rr };
                  await api.post('/analytics/scatterplot-analytics/', payload);
                  // Reload series
                  const res = await api.get('/analytics/retention-regression/');
                  const series = Array.isArray(res.data?.series) ? res.data.series : [];
                  setRetentionPoints(series);
                  setShowRetentionDialog(false);
                  setFormRetention("");
                  setFormSemesters(['1st','2nd']);
                } catch (e: any) {
                  const msg = e?.response?.data?.error || e?.message || 'Failed to save';
                  setRetentionSaveError(String(msg));
                } finally {
                  setSavingRetention(false);
                }
              }}>{savingRetention ? <span className="loading loading-spinner loading-sm"></span> : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LeanSixSigma;
