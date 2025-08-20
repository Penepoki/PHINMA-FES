// Components/Evaluation Components/Copus Matrix Read Only.tsx
import {useEffect, useState} from "react";
import api from "../../utils/api";
import { motion } from "framer-motion";

type ToggleBoxProps = { label: string; active: boolean };
function ToggleBox({ label, active }: ToggleBoxProps) {
  return (
    <motion.div
        className={`min-w-[140px] rounded-xl px-6 py-3 text-center text-base transition-colors ${
            active ? "bg-[#1c402a] text-white" : "bg-gray-200 text-black"
        }`}
    >
      {label}
    </motion.div>
  );
}

interface CopusMatrixReadOnlyProps {
  evaluationId: number;
}

type Tallied = Record<string, { count: number; percentage: number }>;

interface TimestampData {
  id: number;
  evaluation: number;
  student_activities: Record<string, boolean> | string[] | null;
  instructor_activities: Record<string, boolean> | string[] | null;
  student_comments?: Record<string, string> | null;
  instructor_comments?: Record<string, string> | null;
  time_record: string; // "HH:MM:SS"
}

export default function CopusMatrixReadOnly({ evaluationId }: CopusMatrixReadOnlyProps) {
  // Use 0–60 to cover legacy 00:00:00 and 01:00:00
  const MIN_MINUTE = 0;
  const MAX_MINUTE = 60;
  const INCREMENT = 2;

  const [minute, setMinute] = useState<number>(MIN_MINUTE);
  const [selectionsByMinute, setSelectionsByMinute] = useState<
      Record<
          number,
          { student: string[]; teacher: string[]; studentComments: string; teacherComments: string }
      >
  >({});

  const minuteBoxes = Array.from(
    { length: (MAX_MINUTE - MIN_MINUTE) / INCREMENT + 1 },
      (_, i) => MIN_MINUTE + i * INCREMENT
  );

  // Display labels used everywhere in UI
  const studentOptions = [
    "Listening",
    "Individual Thinking",
    "Group",
    "Answer Question",
    "Ask Question",
    "Whole Class Discussion",
    "Student Presentations",
    "Test/Quiz",
    "Waiting",
    "Other",
  ];
  const teacherOptions = [
    "Lecture",
    "Realtime Writing",
    "Moving/Guiding",
    "Answer Questions",
    "Pose Question",
    "Follow-up Question",
    "1-on-1 discussion",
    "Demonstrative",
    "Administrative",
    "Waiting",
    "Other",
  ];

  // Frontend label -> backend key
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

  // Reverse: backend key -> display label
  const keyToStudentLabel = (key: string) =>
      Object.keys(studentActivityMap).find((lbl) => studentActivityMap[lbl] === key) || key;
  const keyToTeacherLabel = (key: string) =>
      Object.keys(teacherActivityMap).find((lbl) => teacherActivityMap[lbl] === key) || key;
  useEffect(() => {
    if (!evaluationId) return;

    const timeToMinutes = (t: string) => {
      const [hh, mm] = (t || "00:00:00").split(":").map(s => parseInt(s || "0", 10));
      return (Number.isFinite(hh) ? hh : 0) * 60 + (Number.isFinite(mm) ? mm : 0);
    };

    const toLabels = (
        acts: Record<string, boolean> | string[] | null | undefined,
        toLabel: (k: string) => string
    ): string[] => {
      if (!acts) return [];
      if (Array.isArray(acts)) return acts.map(toLabel);
      return Object.entries(acts).filter(([, v]) => !!v).map(([k]) => toLabel(k));
    };

    const loadTimestamps = async () => {
      try {
        const url = `/timestamp/timestamps/`;
        const res = await api.get(url, {params: {evaluation: evaluationId}});

        // 🔍 Debug entire response
        console.log("Fetched raw timestamps for evaluation", evaluationId, res.data);

        const rows = Array.isArray(res.data) ? res.data : res.data?.results || [];

        const next: Record<number, {
          student: string[];
          teacher: string[];
          studentComments: string;
          teacherComments: string;
        }> = {};

        rows.forEach((ts: any) => {
          const m = timeToMinutes(ts.time_record);
          console.log("Processing timestamp:", ts, "→ minute =", m);

          if (m < MIN_MINUTE || m > MAX_MINUTE || m % INCREMENT !== 0) {
            console.warn("Skipping timestamp, not aligned with grid:", ts.time_record, "=>", m);
            return;
          }

          next[m] = {
            student: toLabels(ts.student_activities, keyToStudentLabel),
            teacher: toLabels(ts.instructor_activities, keyToTeacherLabel),
            studentComments: (ts.student_comments?.comment ?? ts.student_comments?.notes ?? "") || "",
            teacherComments: (ts.instructor_comments?.comment ?? ts.instructor_comments?.notes ?? "") || "",
          };

          // 🔍 Debug mapping result
          console.log("Minute", m, "mapped selections:", next[m]);
        });

        console.log("Final selectionsByMinute:", next);
        setSelectionsByMinute(next);

        if (!next[minute]) {
          const firstWithData = minuteBoxes.find(m => {
            const s = next[m];
            return s && (s.student.length > 0 || s.teacher.length > 0);
          });
          if (typeof firstWithData === "number") {
            console.log("Jumping to first minute with data:", firstWithData);
            setMinute(firstWithData);
          }
        }
      } catch (e) {
        console.error("Failed to load timestamps:", e);
      }
    };

    void loadTimestamps();
  }, [evaluationId]);

  const hasData = (m: number) => {
    const sel = selectionsByMinute[m];
    return !!sel && (sel.student.length > 0 || sel.teacher.length > 0);
  };

  const selectedStudent = selectionsByMinute[minute]?.student ?? [];
  const selectedTeacher = selectionsByMinute[minute]?.teacher ?? [];
  const studentComments = selectionsByMinute[minute]?.studentComments ?? "";
  const teacherComments = selectionsByMinute[minute]?.teacherComments ?? "";

  return (
    <div className="mb-4 rounded-lg border border-gray-300 p-4">
      {/* Minute navigation */}
      <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
        {minuteBoxes.map((m) => {
          const active = m === minute;
          const filled = hasData(m);
          return (
            <button
              key={m}
              type="button"
              onClick={() => setMinute(m)}
              className={[
                "h-10 w-12 rounded-md text-sm font-semibold shadow",
                active
                    ? "bg-[#1c402a] text-white"
                    : filled
                        ? "bg-gray-300"
                        : "bg-gray-200 text-gray-700",
              ].join(" ")}
              title={filled ? "Has data" : "No data"}
            >
              {m}
            </button>
          );
        })}
      </div>

      {/* Student */}
      <div className="mb-3">
        <div className="mb-2 font-semibold">Student Activities</div>
        <div className="flex flex-wrap gap-2">
          {studentOptions.map((label) => (
              <ToggleBox key={label} label={label} active={selectedStudent.includes(label)}/>
          ))}
        </div>
        {studentComments && (
            <div className="mt-2 text-sm italic text-gray-700">Notes: {studentComments}</div>
        )}
      </div>

      {/* Teacher */}
      <div className="mb-3">
        <div className="mb-2 font-semibold">Teacher Activities</div>
        <div className="flex flex-wrap gap-2">
          {teacherOptions.map((label) => (
              <ToggleBox key={label} label={label} active={selectedTeacher.includes(label)}/>
          ))}
        </div>
        {teacherComments && (
            <div className="mt-2 text-sm italic text-gray-700">Notes: {teacherComments}</div>
        )}
      </div>
    </div>
  );
}
