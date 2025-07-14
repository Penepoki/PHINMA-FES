import React from "react";
import { ActivityData } from "./Copus Matrix";

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

  console.log("CopusSummaryTable: ", evaluations);
  console.log("Copus Evaluation: ", evaluationTallies);

  return (
    <div>
      <h4 className="font-bold mb-2">Student Activities (Average across 3 Copus Evaluations)</h4>
      <table className="table w-full border mb-6">
        <thead>
          <tr>
            <th>Activity</th>
            <th>Student Avg</th>
          </tr>
        </thead>
        <tbody>
          {studentOptions.map((activity) => (
            <tr key={activity}>
              <td>{activity}</td>
              <td>{avgStudent[activity]?.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h4 className="font-bold mb-2">Teacher Activities (Average across 3 Copus Evaluations)</h4>
      <table className="table w-full border">
        <thead>
          <tr>
            <th>Activity</th>
            <th>Teacher Avg</th>
          </tr>
        </thead>
        <tbody>
          {teacherOptions.map((activity) => (
            <tr key={activity}>
              <td>{activity}</td>
              <td>{avgTeacher[activity]?.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CopusSummaryTable;
