import React from "react";
import { ActivityData } from "./Copus Matrix";
import GaugeChart from "./GaugeChart";

interface Evaluation {
  id: number;
  schedule: number;
  observation_date: string;
  evaluation_label: string;
  additional_comments?: string;
  instructor?: string;
  evaluation_type: string;
}

interface CopusSummaryTableProps {
  evaluations: Evaluation[];
  evaluationTallies: {
    [evaluationId: number]: {
      studentTallies: Record<string, ActivityData>;
      teacherTallies: Record<string, ActivityData>;
      activeLearningPercentage?: number;
    };
  };
  studentOptions: string[];
  teacherOptions: string[];
}

/** Helpers */
function averageActivityTallies(
  evals: Evaluation[],
  evaluationTallies: CopusSummaryTableProps["evaluationTallies"],
  activityChoices: string[],
  role: "studentTallies" | "teacherTallies"
) {
  const result: Record<string, number> = {};
  activityChoices.forEach((activity) => {
    let sum = 0;
    let count = 0;
    evals.forEach((ev) => {
      const tallies = evaluationTallies[ev.id]?.[role];
      if (tallies && typeof tallies[activity]?.count === "number") {
        sum += tallies[activity].count;
        count++;
      }
    });
    result[activity] = count > 0 ? sum / count : 0;
  });
  return result;
}

function averageActiveLearningPercentage(
  evals: Evaluation[],
  evaluationTallies: CopusSummaryTableProps["evaluationTallies"]
) {
  let sum = 0;
  let count = 0;
  evals.forEach((ev) => {
    const perc = evaluationTallies[ev.id]?.activeLearningPercentage;
    if (typeof perc === "number") {
      sum += perc;
      count++;
    }
  });
  return count > 0 ? sum / count : 0;
}

/** Fixed, explicit colors so they never “disappear” with theme switches */
const COLORS = {
  green: "#16a34a",   // success
  yellow: "#f59e0b",  // warning
  red: "#ef4444",     // error
  blueHeader:"bg-blue-600" // table header background

};

const CopusSummaryTable: React.FC<CopusSummaryTableProps> = ({
  evaluations,
  evaluationTallies,
  studentOptions,
  teacherOptions,
}) => {
  // Only use the 3 COPUS evaluations
  const copusEvals = evaluations.filter((e) =>
    ["copus_1", "copus_2", "copus_3"].includes(e.evaluation_type)
  );

  const avgStudent = averageActivityTallies(
    copusEvals,
    evaluationTallies,
    studentOptions,
    "studentTallies"
  );
  const avgTeacher = averageActivityTallies(
    copusEvals,
    evaluationTallies,
    teacherOptions,
    "teacherTallies"
  );
  const avgActiveLearning = averageActiveLearningPercentage(
    copusEvals,
    evaluationTallies
  );

  // Gauge color (explicit hex)
  let avgGaugeColor = COLORS.green;
  if (avgActiveLearning < 40) avgGaugeColor = COLORS.red;
  else if (avgActiveLearning < 70) avgGaugeColor = COLORS.yellow;

  return (
    <div className="space-y-6">
      {/* Card: Overall Active Learning (TRULY WHITE) */}
      <div className="card bg-white border border-gray-200 shadow-lg">
        <div className="card-body md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center justify-center">
            <GaugeChart
              value={avgActiveLearning}
              label="Active Learning % (Avg)"
              color={avgGaugeColor}      // keep the colored arc
            />
          </div>

          <div className="flex-1">
            <h4 className="text-lg font-bold text-gray-900 mb-2">
              Active Learning Summary
            </h4>

            <p className="text-gray-800 text-md mb-2">
              <span className="font-semibold">Active Learning % (Avg): </span>
              <span
                className="text-2xl font-extrabold align-middle"
                style={{ color: avgGaugeColor }}
              >
                {avgActiveLearning.toFixed(2)}%
              </span>
            </p>

            <div className="mt-2 rounded-lg bg-white border border-gray-200 p-3">
              <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                <li>
                  Computed as the percent of timestamps with active teacher or
                  student activities.
                </li>
                <li>
                  Active learning includes group work, discussions, questions,
                  presentations, and related interactions.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Card: Per‑COPUS Gauges (TRULY WHITE) */}
      <div className="card bg-white border border-gray-200 shadow-lg">
        <div className="card-body">
          <h4 className="text-lg font-bold text-gray-900">
            Active Learning Percentage for Each COPUS
          </h4>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-6">
            {copusEvals.map((copuseval, idx) => {
              const perc =
                evaluationTallies[copuseval.id]?.activeLearningPercentage ?? 0;

              let gaugeColor = COLORS.green;
              if (perc < 40) gaugeColor = COLORS.red;
              else if (perc < 70) gaugeColor = COLORS.yellow;

              return (
                <GaugeChart
                  key={copuseval.id}
                  value={perc}
                  label={`COPUS ${idx + 1}: ${perc.toFixed(2)}%`}
                  color={gaugeColor}    // keep explicit colored arc
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Student Activities (TRULY WHITE, BLUE HEADERS) */}
      <div className="card bg-white border border-gray-200 shadow-lg">
        <div className="card-body">
          <h4 className="font-bold text-gray-900 mb-2">
            Student Activities (Average across 3 COPUS Evaluations)
          </h4>

          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="table">
              <thead className={`${COLORS.blueHeader} text-white`}>
                <tr>
                  <th className="font-bold">Activity</th>
                  <th className="font-bold text-right">Student Avg</th>
                </tr>
              </thead>
              <tbody className="text-gray-900">
                {studentOptions.map((activity) => (
                  <tr
                    key={activity}
                    className="hover:bg-blue-50 transition-colors"
                  >
                    <td className="whitespace-pre-line">{activity}</td>
                    <td className="text-right">
                      {avgStudent[activity]?.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Teacher Activities (TRULY WHITE, BLUE HEADERS) */}
      <div className="card bg-white border border-gray-200 shadow-lg">
        <div className="card-body">
          <h4 className="font-bold text-gray-900 mb-2">
            Teacher Activities (Average across 3 COPUS Evaluations)
          </h4>

          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="table">
              <thead className={`${COLORS.blueHeader} text-white`}>
                <tr>
                  <th className="font-bold">Activity</th>
                  <th className="font-bold text-right">Teacher Avg</th>
                </tr>
              </thead>
              <tbody className="text-gray-900">
                {teacherOptions.map((activity) => (
                  <tr
                    key={activity}
                    className="hover:bg-blue-50 transition-colors"
                  >
                    <td className="whitespace-pre-line">{activity}</td>
                    <td className="text-right">
                      {avgTeacher[activity]?.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CopusSummaryTable;
