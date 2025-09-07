// Components/Evaluation Components/Copus Matrix Read Only.tsx
import { useEffect, useState } from "react";
import api from "../../utils/api";
import { motion } from "framer-motion";

type ToggleBoxProps = { label: string; active: boolean };
function ToggleBox({ label, active }: ToggleBoxProps) {
  return (
    <motion.div
      className={`min-w-[140px] rounded-xl px-6 py-3 text-center text-base ${active ? "bg-[#1c402a] text-white" : "bg-gray-200 text-black"
        }`}
      animate={{ y: [2, -1, 2], scale: [1, 1.01, 1] }}
      transition={{ duration: 6, repeat: Infinity, repeatType: "loop" }}
    >
      {label}
    </motion.div>
  );
}

interface CopusMatrixReadOnlyProps {
  evaluationId: number;
  tallyData?: Record<string, any>;
}

interface TimestampData {
  id: number;
  evaluation: number;
  student_activities: Record<string, boolean> | string[] | null;
  instructor_activities: Record<string, boolean> | string[] | null;
  student_comments?: Record<string, string> | null;
  instructor_comments?: Record<string, string> | null;
  time_record: string;
}

export default function CopusMatrixReadOnly({ evaluationId }: CopusMatrixReadOnlyProps) {
  const MIN_MINUTE = 0;
  const MAX_MINUTE = 58;
  const INCREMENT = 2;

  const [loading, setLoading] = useState<boolean>(true);
  const [minute, setMinute] = useState<number>(MIN_MINUTE);
  const [error, setError] = useState<string | null>(null);

  const [selectionsByMinute, setSelectionsByMinute] = useState<
    Record<number, { student: string[]; teacher: string[]; studentComments: string; teacherComments: string }>
  >({});

  const minuteBoxes = Array.from(
    { length: (MAX_MINUTE - MIN_MINUTE) / INCREMENT + 1 },
    (_, i) => MIN_MINUTE + i * INCREMENT,
  );

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

  const keyToStudentLabel = (key: string) =>
    Object.keys(studentActivityMap).find((lbl) => studentActivityMap[lbl] === key) || key;
  const keyToTeacherLabel = (key: string) =>
    Object.keys(teacherActivityMap).find((lbl) => teacherActivityMap[lbl] === key) || key;

  useEffect(() => {
    if (!evaluationId) return;

    const timeToMinutes = (t: string) => {
      const [hh, mm] = (t || "00:00:00").split(":").map((s) => parseInt(s || "0", 10));
      return (Number.isFinite(hh) ? hh : 0) * 60 + (Number.isFinite(mm) ? mm : 0);
    };

    const toLabels = (
      acts: Record<string, boolean> | string[] | null | undefined,
      toLabel: (k: string) => string,
    ): string[] => {
      if (!acts) return [];
      if (Array.isArray(acts)) return acts.map(toLabel);
      return Object.entries(acts)
        .filter(([, v]) => !!v)
        .map(([k]) => toLabel(k));
    };

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/timestamp/timestamps/`, { params: { evaluation: evaluationId } });
        const rows: TimestampData[] = Array.isArray(res.data) ? res.data : res.data?.results || [];

        const next: Record<number, { student: string[]; teacher: string[]; studentComments: string; teacherComments: string }> =
          {};

        rows.forEach((ts) => {
          const m = timeToMinutes(ts.time_record);
          if (m < MIN_MINUTE || m > MAX_MINUTE || m % INCREMENT !== 0) return;

          next[m] = {
            student: toLabels(ts.student_activities, keyToStudentLabel),
            teacher: toLabels(ts.instructor_activities, keyToTeacherLabel),
            studentComments: (ts.student_comments?.comment ?? ts.student_comments?.notes ?? "") || "",
            teacherComments: (ts.instructor_comments?.comment ?? ts.instructor_comments?.notes ?? "") || "",
          };
        });

        setSelectionsByMinute(next);

        if (!next[minute]) {
          const firstWithData = minuteBoxes.find((m) => {
            const s = next[m];
            return s && (s.student.length > 0 || s.teacher.length > 0);
          });
          if (typeof firstWithData === "number") setMinute(firstWithData);
        }
      } catch (e) {
        console.error("Failed to load timestamps:", e);
        setError("Failed to load COPUS timestamps.");
      } finally {
        setLoading(false);
      }
    })();
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
      {error && (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
        </div>
      )}

      {/* Centered minute range */}
      <div className="mb-4 flex flex-col items-center">
        <h2 className="text-xl font-bold text-gray-800">{`Minutes ${minute}-${minute + INCREMENT}`}</h2>
        <p className="mt-1 text-sm text-gray-500 text-center">
          Select a minute box below to review recorded classroom activities and comments for that time segment.
        </p>
        <div className="mt-3 text-base font-semibold text-gray-600 flex gap-6">
          <div className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded" style={{ background: "#2f6b49" }} />
            Selected
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded" style={{ background: "#1c402a" }} />
            Has data
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded bg-gray-300" />
            No data
          </div>
        </div>
      </div>

      {/* Minute grid */}
      <div className="mb-4 flex items-center justify-center">
        <div className="grid grid-cols-5 gap-2 md:grid-cols-15">
          {minuteBoxes.map((m) => {
            const active = m === minute;
            const filled = hasData(m);
            const label = m + INCREMENT; // show end number
            const baseClass =
              "h-10 w-10 rounded-md text-sm font-semibold transition-transform hover:scale-105 focus:outline-none";
            const style = filled
              ? { background: active ? "#2f6b49" : "#1c402a", color: "#fff" }
              : { background: "#e5e7eb", color: "#374151" };

            return (
              <motion.button
                key={m}
                type="button"
                onClick={() => setMinute(m)}
                className={baseClass}
                style={style}
                animate={{ y: [1, -1, 1], scale: [1, 1.01, 1] }}
                transition={{ duration: 7, repeat: Infinity, repeatType: "loop", ease: [0.42, 0, 0.58, 1] }}
                title={filled ? "Has data" : "No data"}
              >
                {label}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Students */}
      <div className="mb-6 text-center text-lg font-semibold text-gray-700">Students Doing</div>
      <div className="mb-6 flex flex-wrap justify-center gap-2">
        {studentOptions.map((label) => (
          <ToggleBox key={label} label={label} active={selectedStudent.includes(label)} />
        ))}
      </div>

      {/* Teachers */}
      <div className="mb-6 text-center text-lg font-semibold text-gray-700">Teacher Doing</div>
      <div className="mb-4 flex flex-wrap justify-center gap-2">
        {teacherOptions.map((label) => (
          <ToggleBox key={label} label={label} active={selectedTeacher.includes(label)} />
        ))}
      </div>

      {/* Comments */}
      <div className="collapse-arrow collapse mt-4 border border-gray-300">
        <input type="checkbox" />
        <div className="collapse-title text-lg font-semibold">Observation Comments</div>
        <div className="collapse-content">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium text-gray-700">Comments for the Professor</label>
              <textarea className="w-full rounded border border-gray-300 p-2" value={teacherComments} readOnly />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium text-gray-700">Comments for the Students</label>
              <textarea className="w-full rounded border border-gray-300 p-2" value={studentComments} readOnly />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
