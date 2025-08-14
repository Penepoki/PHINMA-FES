import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { LineElement, PointElement, LineController } from "chart.js";
import { Line } from "react-chartjs-2";
import {SankeyController, Flow} from "chartjs-chart-sankey";
import {Chart} from "react-chartjs-2";
import React, {useEffect, useMemo, useState} from "react";
import api from "../../utils/api.ts";

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
		if (!target[label]) target[label] = {count: 0};
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

	return {professorAggregates, totalActiveLearningPercentage};
};

// Fetch all evaluations by faculty and build a map: evaluation id → professor name
// Adjust endpoint/params if your API differs.
const fetchEvaluationProfessorMapByFaculty = async (facultyId: string): Promise<Record<string, string>> => {
	const map: Record<string, string> = {};
	try {
		// If you already have a function to fetch all evaluations by faculty (including AALP),
		// use that same endpoint here to get evaluation metadata with professor names.
		const endpoint = "/evaluation/evaluations/by-faculty";
		const params: any = {faculty: facultyId}; // If your API expects `faculty_id`, change key accordingly.

		const res = await api.get(endpoint, {params});
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
	const [copusData, setCopusData] = useState<any>(null);
	const [copusLoading, setCopusLoading] = useState(false);
	const [copusError, setCopusError] = useState<string | null>(null);
	const [studentTallies, setStudentTallies] = useState<{ code: string; count: number; summary: string }[]>([]);
	const [teacherTallies, setTeacherTallies] = useState<{ code: string; count: number; summary: string }[]>([]);
	const [professorCount, setProfessorCount] = useState(0);
	const [avgActiveLearning, setAvgActiveLearning] = useState<number | null>(null);
	const [maxActivityPoints, setMaxActivityPoints] = useState(0);
	const [sankeyData, setSankeyData] = useState<any>(null);

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
				let params: any = {};

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
					headers: {Authorization: `Bearer ${token ? token.substring(0, 8) + '...' : ''}`},
				});

				const response = await api.get(endpoint, {params});
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
							colorFrom: "blue",
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

				let endpointEvals = "/studentevaluation/studentevaluation/by-faculty";
				let endpointResponses = "/studentevaluationresponse/studentevaluationresponse/by-faculty";
				let params: any = {};

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
					headers: {Authorization: `Bearer ${token ? token.substring(0, 8) + '...' : ''}`},
				});

				// 1) Fetch all student evaluations for this faculty
				const evalsRes = await api.get(`${endpointEvals}`, {params});
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
				const responsesRes = await api.get(`${endpointResponses}`, {params});
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
					label: function (context: any) {
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
			<div className="breadcrumbs">
				<ul>
					<li>
						<a onClick={() => setActiveView("home")}>Home</a>
					</li>
					<li>Resource Group</li>
				</ul>
			</div>
			<h2 className="mt-4 text-3xl font-bold text-white">
				Lean Six Sigma Statistics
			</h2>
			<div className="mt-4 flex w-full flex-row items-center justify-center gap-4 border-b border-gray-600 pb-4 text-white shadow-2xl">
				Filter:
				<button className="btn btn-primary text-white">College</button>
				<button className="btn btn-primary text-white">Semester</button>
				<button className="btn btn-primary text-white">
					School Year
				</button>
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
							<Chart type="sankey" data={sankeyData} options={sankeyOptions}/>
						) : (
							<p className="text-white">Loading chart...</p>
						)}
					</div>
				</div>
				<div className="mt-6 flex w-full items-center justify-center rounded-lg p-4 shadow-2xl backdrop-blur-lg">
					<div className="w-full">
						<Line data={lineData} options={lineOptions} />
					</div>
				</div>
			</div>
		</div>
	);
}

export default LeanSixSigma;