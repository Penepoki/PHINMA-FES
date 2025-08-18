import { useState, useEffect } from "react";
import api from "../../utils/api";
import { motion } from "framer-motion";

type ToggleBoxProps = {
  label: string;
  active: boolean;
};

function ToggleBox({ label, active }: ToggleBoxProps) {
  return (
    <motion.div
      className={`min-w-[140px] rounded-xl px-6 py-3 text-center text-base transition-colors ${active ? "bg-[#1c402a] text-white" : "bg-gray-200 text-black"
        }`}
    >
      {label}
    </motion.div>
  );
}

interface CopusMatrixReadOnlyProps {
  evaluationId: number;
  tallyData?: {
    studentTallies: Record<string, { count: number; percentage: number }>;
    teacherTallies: Record<string, { count: number; percentage: number }>;
    activeLearningPercentage?: number;
  };
}

interface TimestampData {
  id: number;
  evaluation: number;
  student_activities: Record<string, boolean>;
  instructor_activities: Record<string, boolean>;
  student_comments?: Record<string, string>;
  instructor_comments?: Record<string, string>;
  time_record: string;
}

export default function CopusMatrixReadOnly({ evaluationId }: CopusMatrixReadOnlyProps) {
  const MIN_MINUTE = 0;
  const MAX_MINUTE = 58;
  const INCREMENT = 2;

  const [minute, setMinute] = useState(MIN_MINUTE);
  const [selectionsByMinute, setSelectionsByMinute] = useState<
    Record<number, {
      student: string[];
      teacher: string[];
      studentComments: string;
      teacherComments: string;
    }>
  >({});

  const minuteBoxes = Array.from(
    { length: (MAX_MINUTE - MIN_MINUTE) / INCREMENT + 1 },
    (_, index) => MIN_MINUTE + index * INCREMENT,
  );

  const studentOptions = [
    "Listening", "Individual Thinking", "Group", "Answer Question",
    "Ask Question", "Whole Class Discussion", "Student Presentations",
    "Test/Quiz", "Waiting", "Other",
  ];

  const teacherOptions = [
    "Lecture", "Realtime Writing", "Moving/Guiding", "Answer Questions",
    "Pose Question", "Follow-up Question", "1-on-1 discussion",
    "Demonstrative", "Administrative", "Waiting", "Other",
  ];

  const studentActivityMap: Record<string, string> = {
    Listening: "listening",
    "Individual Thinking": "individual_thinking",
    Group: "group",
    "Answer Question": "answer_question",
    "Ask Question": "ask_question",
    "Whole Class Discussion": "whole_class_discussion",
    "Student Presentations": "student_presentations",
    "Test/Quiz": "test/quiz",
    Waiting: "waiting",
    Other: "other",
  };

  const teacherActivityMap: Record<string, string> = {
    Lecture: "lecture",
    "Realtime Writing": "realtime_writing",
    "Moving/Guiding": "moving/guiding",
    "Answer Questions": "answer_questions",
    "Pose Question": "pose_question",
    "Follow-up Question": "follow_up_question",
    "1-on-1 discussion": "1_on_1_discussion",
    Demonstrative: "demonstrative",
    Administrative: "administrative",
    Waiting: "waiting",
    Other: "other",
  };

  useEffect(() => {
    const loadTimestamps = async () => {
      try {
        const response = await api.get(`/timestamp/timestamps/?evaluation=${evaluationId}`);
        const timestamps: TimestampData[] = response.data;

        const dataByMinute: Record<number, {
          student: string[];
          teacher: string[];
          studentComments: string;
          teacherComments: string;
        }> = {};

        timestamps.forEach((t) => {
          const [hh, mm] = t.time_record.split(":");
          const minuteValue = parseInt(mm, 10);

          const studentSelections = Object.entries(t.student_activities || {})
            .filter(([_, isSelected]) => isSelected)
            .map(([key]) => Object.keys(studentActivityMap).find(lbl => studentActivityMap[lbl] === key) || key);

          const teacherSelections = Object.entries(t.instructor_activities || {})
            .filter(([_, isSelected]) => isSelected)
            .map(([key]) => Object.keys(teacherActivityMap).find(lbl => teacherActivityMap[lbl] === key) || key);

          dataByMinute[minuteValue] = {
            student: studentSelections,
            teacher: teacherSelections,
            studentComments: t.student_comments?.comment || t.student_comments?.notes || "",
            teacherComments: t.instructor_comments?.comment || t.instructor_comments?.notes || "",
          };
        });

        setSelectionsByMinute(dataByMinute);

        // default to first available minute
        const availableMinutes = Object.keys(dataByMinute).map(Number).sort((a, b) => a - b);
        if (availableMinutes.length > 0) {
          setMinute(availableMinutes[0]);
        }
      } catch (err) {
        console.error("Failed to load timestamps", err);
      }
    };

    loadTimestamps();
  }, [evaluationId]);

  const currentData = selectionsByMinute[minute] || { student: [], teacher: [], studentComments: "", teacherComments: "" };

  return (
    <div className="mb-4 rounded-lg border border-gray-300 p-4">
      {/* Minute Navigation */}
      <div className="mb-4 flex items-center justify-center gap-4 flex-wrap">
        {minuteBoxes.map((m) => {
          const answered = selectionsByMinute[m]?.student.length > 0 || selectionsByMinute[m]?.teacher.length > 0;
          return (
            <button
              key={m}
              onClick={() => setMinute(m)}
              className={`h-10 w-10 rounded-md text-sm font-semibold ${minute === m
                ? "bg-[#1c402a] text-white"
                : answered
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-700"
                }`}
            >
              {m}
            </button>
          );
        })}
      </div>

      {/* Student Activities */}
      <div className="mb-6 text-center text-lg font-semibold text-gray-700">Students Doing</div>
      <div className="mb-4 flex flex-wrap justify-center gap-2">
        {studentOptions.map((label) => (
          <ToggleBox key={label} label={label} active={currentData.student.includes(label)} />
        ))}
      </div>

      {/* Teacher Activities */}
      <div className="mb-6 text-center text-lg font-semibold text-gray-700">Teacher Doing</div>
      <div className="flex flex-wrap justify-center gap-2">
        {teacherOptions.map((label) => (
          <ToggleBox key={label} label={label} active={currentData.teacher.includes(label)} />
        ))}
      </div>

      {/* Comments */}
      <div className="mt-6">
        <div className="mb-2">
          <strong>Comments for the Professor:</strong>
          <p className="mt-1 whitespace-pre-wrap">{currentData.teacherComments || "No comments."}</p>
        </div>
        <div>
          <strong>Comments for the Students:</strong>
          <p className="mt-1 whitespace-pre-wrap">{currentData.studentComments || "No comments."}</p>
        </div>
      </div>
    </div>
  );
}
