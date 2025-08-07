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

const CopusSummaryTable: React.FC<CopusSummaryTableProps> = ({
  evaluations,
  evaluationTallies,
  studentOptions,
  teacherOptions,
}) => {
  // Only use the 3 copus evaluations
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
  const avgActiveLearning = averageActiveLearningPercentage(copusEvals, evaluationTallies);

  return (
    <div>

      {/* Gauge Chart and Summary */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg border border-blue-500/30">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center justify-center">
            <GaugeChart value={avgActiveLearning} label="Active Learning % (Avg)" color="#4ECDC4"/>
          </div>
          <div className="flex-1 flex flex-col items-center md:items-start justify-center">
            <h4 className="text-lg font-bold text-black mb-2">Active Learning Summary</h4>
            <p className="text-gray-800 text-md mb-1">
              <span className="font-semibold">Active Learning % (Avg):</span> <span
                className="text-2xl font-bold text-[#4ECDC4]">{avgActiveLearning.toFixed(2)}%</span>
            </p>
            <ul className="text-gray-700 text-sm list-disc pl-5">
              <li>Calculated as the % of timestamps with active teacher or student activities.</li>
              <li>Active learning includes: group work, discussions, questions, presentations, etc.</li>
            </ul>
          </div>
        </div>
      </div>
      {/* Student Activities Table */}
      <div className="mb-6">
        <h4 className="font-bold mb-2 text-black">Student Activities (Average across 3 COPUS Evaluations)</h4>
        <table
            className="table w-full border rounded-lg overflow-hidden bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-black">
          <thead className="bg-gradient-to-r from-blue-600/40 to-purple-600/40">
          <tr>
            <th>Activity</th>
            <th>Student Avg</th>
          </tr>
          </thead>
          <tbody>
          {studentOptions.map((activity) => (
              <tr key={activity} className="hover:bg-blue-100/40">
                <td>{activity}</td>
                <td>{avgStudent[activity]?.toFixed(2)}</td>
              </tr>
          ))}
          </tbody>
        </table>
      </div>
      {/* Teacher Activities Table */}
      <div>
        <h4 className="font-bold mb-2 text-black">Teacher Activities (Average across 3 COPUS Evaluations)</h4>
        <table
            className="table w-full border rounded-lg overflow-hidden bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-black">
          <thead className="bg-gradient-to-r from-blue-600/40 to-purple-600/40">
          <tr>
            <th>Activity</th>
            <th>Teacher Avg</th>
          </tr>
          </thead>
          <tbody>
          {teacherOptions.map((activity) => (
              <tr key={activity} className="hover:bg-blue-100/40">
                <td>{activity}</td>
                <td>{avgTeacher[activity]?.toFixed(2)}</td>
              </tr>
          ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CopusSummaryTable;
