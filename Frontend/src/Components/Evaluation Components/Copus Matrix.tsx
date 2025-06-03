import { useState, useEffect } from "react";
import api from "../../utils/api";
import { motion } from "framer-motion";

type ToggleBoxProps = {
  label: string;
  active: boolean;
  onToggle: (label: string) => void;
};

function ToggleBox({ label, active, onToggle }: ToggleBoxProps) {
  return (
    <motion.button
      className={`min-w-[140px] rounded-xl px-6 py-3 text-center text-base transition-colors hover:scale-105 hover:bg-gray-300 ${
        active ? "bg-[#1c402a] text-white" : "bg-gray-200 text-black"
      }`}
      onClick={() => onToggle(label)}
      animate={{
        y: [3, -1, 3],
        x: [-5, 3, -5],
        scale: [1, 1.01, 1],
      }}
      transition={{
        duration: 7,
        repeat: Infinity,
        repeatType: "loop",
        ease: [0.42, 0, 0.58, 1],
      }}
    >
      {label}
    </motion.button>
  );
}

export type ActivityData = {
  count: number;
  percentage: number;
};

interface CopusMatrixProps {
  scheduleId: number;
  evaluationType: string;
  instructorId?: number;
  onTalliesUpdate?: (
    studentTallies: Record<string, ActivityData>,
    teacherTallies: Record<string, ActivityData>
  ) => void;
}

interface TimestampData {
  id?: number;
  evaluation: number;
  student_activities: Record<string, boolean>;
  instructor_activities: Record<string, boolean>;
  student_comments?: Record<string, string>;
  instructor_comments?: Record<string, string>;
  time_record: string;
}

const CopusMatrix: React.FC<CopusMatrixProps> = ({
  scheduleId,
  evaluationType,
  instructorId,
  onTalliesUpdate,
}) => {
  const MIN_MINUTE = 2;
  const MAX_MINUTE = 60;
  const INCREMENT = 2;

  const [studentTallies, setStudentTallies] = useState<{ [key: string]: ActivityData }>({});
  const [teacherTallies, setTeacherTallies] = useState<{ [key: string]: ActivityData }>({});
  const [minute, setMinute] = useState(MIN_MINUTE);
  const [currentTime, setCurrentTime] = useState<string>("");
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState<string>("00");
  const [isTimerStarted, setIsTimerStarted] = useState(false);
  const [evaluationId, setEvaluationId] = useState<number | null>(null);
  const [activeMinute, setActiveMinute] = useState<number>(0);
  const [countdown, setCountdown] = useState<number>(120);
  const [navigationDisabled, setNavigationDisabled] = useState(true);
  const [selectionsByMinute, setSelectionsByMinute] = useState<{
    [key: number]: { student: string[]; teacher: string[]; studentComments: string; teacherComments: string };
  }>({});
  const [currentStudentSelections, setCurrentStudentSelections] = useState<string[]>([]);
  const [currentTeacherSelections, setCurrentTeacherSelections] = useState<string[]>([]);
  const [currentStudentComments, setCurrentStudentComments] = useState<string>("");
  const [currentTeacherComments, setCurrentTeacherComments] = useState<string>("");
  const [timestampIds, setTimestampIds] = useState<{ [key: number]: number }>({});
  const [timestamps, setTimestamps] = useState<TimestampData[]>([]);

  const minuteBoxes = Array.from(
    { length: (MAX_MINUTE - MIN_MINUTE) / INCREMENT + 1 },
    (_, index) => MIN_MINUTE + index * INCREMENT
  );

  const studentOptions = [
    "Listening",
    "Individual Thinking",
    "Group Activity",
    "Answering Questions",
    "Asking Questions",
    "Whole Class Discussion",
    "Student Presentations",
    "Test/Quiz",
    "Waiting",
    "Other",
  ];

  const teacherOptions = [
    "Lecture",
    "Real-time Writing",
    "Moving/Guiding",
    "Answering Questions",
    "Posing Questions",
    "Follow-up",
    "1-on-1 Discussion",
    "Demonstrate/Video",
    "Administrative Tasks",
    "Waiting",
    "Other",
  ];

  const studentActivityMap: Record<string, string> = {
    "Listening": "listening",
    "Individual Thinking": "individual_thinking",
    "Group Activity": "group",
    "Answering Questions": "answer_question",
    "Asking Questions": "ask_question",
    "Whole Class Discussion": "whole_class_discussion",
    "Student Presentations": "student_presentations",
    "Test/Quiz": "test/quiz",
    "Waiting": "waiting",
    "Other": "other",
  };

  const teacherActivityMap: Record<string, string> = {
    "Lecture": "lecture",
    "Real-time Writing": "realtime_writing",
    "Moving/Guiding": "moving/guiding",
    "Answering Questions": "answer_questions",
    "Posing Questions": "pose_question",
    "Follow-up": "follow_up_question",
    "1-on-1 Discussion": "1_on_1_discussion",
    "Demonstrate/Video": "demonstrative",
    "Administrative Tasks": "administrative",
    "Waiting": "waiting",
    "Other": "other",
  };

  // API helpers
  const timestampApi = {
    createTimestamp: async (data: TimestampData) => {
      const response = await api.post('/api/timestamps/', data);
      return response.data;
    },
    updateTimestamp: async (id: number, data: Partial<TimestampData>) => {
      const response = await api.patch(`/api/timestamps/${id}/`, data);
      return response.data;
    },
    getTimestamps: async (evaluationId: number) => {
      const response = await api.get(`/api/timestamps/?evaluation=${evaluationId}`);
      return response.data;
    }
  };

  // Helper to format time for a given minute
  const formatTimeForMinute = (minuteValue: number): string => {
    if (!startTime) return new Date().toISOString().split('T')[1].substring(0, 8);
    const time = new Date(startTime);
    time.setMinutes(time.getMinutes() + minuteValue);
    return time.toISOString().split('T')[1].substring(0, 8);
  };

  // Load all timestamps for the evaluation
  const loadExistingTimestamps = async (evalId: number) => {
    try {
      const timestamps = await timestampApi.getTimestamps(evalId);
      setTimestamps(timestamps);
      const selections: { [key: number]: { student: string[], teacher: string[], studentComments: string, teacherComments: string } } = {};
      const ids: { [key: number]: number } = {};
      timestamps.forEach(timestamp => {
        const timeParts = timestamp.time_record.split(':');
        const minuteVal = parseInt(timeParts[1]);
        const minuteBlock = Math.ceil(minuteVal / 2) * 2;
        const studentActivities = Object.entries(timestamp.student_activities || {})
          .filter(([_, value]) => value)
          .map(([key, _]) => Object.entries(studentActivityMap).find(([display, k]) => k === key)?.[0] || key);
        const teacherActivities = Object.entries(timestamp.instructor_activities || {})
          .filter(([_, value]) => value)
          .map(([key, _]) => Object.entries(teacherActivityMap).find(([display, k]) => k === key)?.[0] || key);
        selections[minuteBlock] = {
          student: studentActivities,
          teacher: teacherActivities,
          studentComments: timestamp.student_comments?.comment || "",
          teacherComments: timestamp.instructor_comments?.comment || ""
        };
        ids[minuteBlock] = timestamp.id!;
      });
      setSelectionsByMinute(selections);
      setTimestampIds(ids);
    } catch (error) {
      console.error("Failed to load existing timestamps", error);
    }
  };

  // Fetch timestamps when evaluationId changes
  useEffect(() => {
    if (evaluationId) {
      loadExistingTimestamps(evaluationId);
    }
  }, [evaluationId]);

  // When updating a minute's data:
  const handleMinuteUpdate = (minuteIndex: number, studentData: Record<string, boolean>, teacherData: Record<string, boolean>) => {
    const timestamp = timestamps.find(ts => {
      const timeParts = ts.time_record.split(':');
      const minuteVal = parseInt(timeParts[1]);
      return Math.ceil(minuteVal / 2) * 2 === minuteIndex;
    });
    if (!timestamp) return;
    api.patch(`/api/timestamps/${timestamp.id}/`, {
      student_activities: studentData,
      instructor_activities: teacherData,
    }).then(updated => {
      setTimestamps(ts =>
        ts.map((t) => t.id === timestamp.id ? { ...t, ...updated } : t)
      );
    });
  };

  useEffect(() => {
    const saved = selectionsByMinute[minute] || { student: [], teacher: [], studentComments: "", teacherComments: "" };
    setCurrentStudentSelections(saved.student);
    setCurrentTeacherSelections(saved.teacher);
    setCurrentStudentComments(saved.studentComments);
    setCurrentTeacherComments(saved.teacherComments);
  }, [minute, selectionsByMinute]);

  const getTotalMinutesObserved = () => {
    return Object.values(selectionsByMinute).filter(
      (selection) => selection.student.length > 0 && selection.teacher.length > 0
    ).length;
  };

  const calculateTallies = () => {
    let totalStudentSelections = 0;
    let totalTeacherSelections = 0;
    const newStudentTallies: { [key: string]: ActivityData } = {};
    const newTeacherTallies: { [key: string]: ActivityData } = {};

    studentOptions.forEach((option) => {
      newStudentTallies[option] = { count: 0, percentage: 0 };
    });

    teacherOptions.forEach((option) => {
      newTeacherTallies[option] = { count: 0, percentage: 0 };
    });

    Object.values(selectionsByMinute).forEach((selection) => {
      selection.student.forEach((activity) => {
        newStudentTallies[activity].count++;
        totalStudentSelections++;
      });

      selection.teacher.forEach((activity) => {
        newTeacherTallies[activity].count++;
        totalTeacherSelections++;
      });
    });

    if (totalStudentSelections > 0) {
      studentOptions.forEach((option) => {
        newStudentTallies[option].percentage =
          (newStudentTallies[option].count / totalStudentSelections) * 100;
      });
    }

    if (totalTeacherSelections > 0) {
      teacherOptions.forEach((option) => {
        newTeacherTallies[option].percentage =
          (newTeacherTallies[option].count / totalTeacherSelections) * 100;
      });
    }

    setStudentTallies(newStudentTallies);
    setTeacherTallies(newTeacherTallies);

    if (onTalliesUpdate) {
      onTalliesUpdate(newStudentTallies, newTeacherTallies);
    }
  };

  useEffect(() => {
    calculateTallies();
  }, [selectionsByMinute]);

  // Update your updateSelections function to use the timestamp API
  const updateSelections = async (
    type: "student" | "teacher",
    selections: string[],
    studentComments: string = currentStudentComments,
    teacherComments: string = currentTeacherComments
  ) => {
    setSelectionsByMinute((prev) => {
      const prevForMinute = prev[minute] || { student: [], teacher: [], studentComments: "", teacherComments: "" };
      const updated = {
        ...prev,
        [minute]: {
          ...prevForMinute,
          [type]: selections,
          studentComments: studentComments,
          teacherComments: teacherComments
        },
      };
      return updated;
    });

    if (type === "student") setCurrentStudentSelections(selections);
    else setCurrentTeacherSelections(selections);

    if (!evaluationId) return;

    // Get the current selections for both student and teacher
    const currentSelections = selectionsByMinute[minute] || { student: [], teacher: [], studentComments: "", teacherComments: "" };
    const studentSelections = type === "student" ? selections : currentSelections.student;
    const teacherSelections = type === "teacher" ? selections : currentSelections.teacher;

    const timestampData: TimestampData = {
      evaluation: evaluationId,
      student_activities: Object.fromEntries(
        Object.entries(studentActivityMap).map(([display, key]) => [
          key,
          studentSelections.includes(display)
        ])
      ),
      instructor_activities: Object.fromEntries(
        Object.entries(teacherActivityMap).map(([display, key]) => [
          key,
          teacherSelections.includes(display)
        ])
      ),
      time_record: formatTimeForMinute(minute),
      student_comments: { comment: studentComments },
      instructor_comments: { comment: teacherComments }
    };

    try {
      if (timestampIds[minute]) {
        await timestampApi.updateTimestamp(timestampIds[minute], timestampData);
      } else {
        const response = await timestampApi.createTimestamp(timestampData);
        setTimestampIds((prev) => ({
          ...prev,
          [minute]: response.id,
        }));
      }
    } catch (error) {
      console.error("Failed to update timestamp", error);
    }
  };

  const handleStudentToggle = (label: string) => {
    startTimer();
    const newSelections = currentStudentSelections.includes(label)
      ? currentStudentSelections.filter((item) => item !== label)
      : [...currentStudentSelections, label];
    updateSelections("student", newSelections, currentStudentComments, currentTeacherComments);
  };

  const handleTeacherToggle = (label: string) => {
    startTimer();
    const newSelections = currentTeacherSelections.includes(label)
      ? currentTeacherSelections.filter((item) => item !== label)
      : [...currentTeacherSelections, label];
    updateSelections("teacher", newSelections, currentStudentComments, currentTeacherComments);
  };

  const handleStudentCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentStudentComments(e.target.value);
    updateSelections("student", currentStudentSelections, e.target.value, currentTeacherComments);
  };

  const handleTeacherCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentTeacherComments(e.target.value);
    updateSelections("teacher", currentTeacherSelections, currentStudentComments, e.target.value);
  };

  // Dynamic evaluation creation
  const startTimer = async () => {
    if (!isTimerStarted) {
      const startTimeValue = new Date();
      setStartTime(startTimeValue);
      setIsTimerStarted(true);

      try {
        if (!evaluationId) {
          const payload: any = {
            schedule: scheduleId,
            observation_date: startTimeValue.toISOString().split('T')[0],
            evaluation_type: evaluationType,
          };
          if (instructorId) payload.instructor = instructorId;

          const response = await api.post("/api/evaluations/", payload);
          const newEvalId = response.data.id || response.data.data?.id;
          setEvaluationId(newEvalId);
        }
      } catch (error) {
        console.error("Failed to start evaluation", error);
        setIsTimerStarted(false);
        setStartTime(null);
        alert("Failed to start evaluation. Please try again.");
      }
    }
  };

  useEffect(() => {
    if (!isTimerStarted) {
      setCurrentTime(
        new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
      return;
    }

    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );

      if (startTime) {
        const elapsed = now.getTime() - startTime.getTime();
        const totalMinutes = Math.floor(elapsed / (1000 * 60));
        setElapsedTime(totalMinutes.toString().padStart(2, "0"));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime, isTimerStarted]);

  useEffect(() => {
    if (!isTimerStarted) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          setActiveMinute((prevMinute) => {
            if (prevMinute < MAX_MINUTE - 1) {
              return prevMinute + 1;
            } else {
              clearInterval(interval);
              return prevMinute;
            }
          });
          return 120;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerStarted]);

  const handlePrev = () => {
    setMinute((prev) => Math.max(prev - INCREMENT, MIN_MINUTE));
  };

  const handleNext = () => {
    setMinute((prev) => Math.min(prev + INCREMENT, MAX_MINUTE));
  };

  useEffect(() => {
    setMinute(activeMinute + 2);
  }, [activeMinute]);

  const hasStudentAndTeacherSelected =
    currentStudentSelections.length > 0 && currentTeacherSelections.length > 0;

  const handleSaveEvaluation = async () => {
    const scoringData = {
      student_activities: studentOptions.reduce(
        (acc, option) => {
          acc[option] = {
            count: studentTallies[option]?.count || 0,
            percentage: studentTallies[option]?.percentage || 0,
          };
          return acc;
        },
        {} as Record<string, ActivityData>
      ),
      instructor_activities: teacherOptions.reduce(
        (acc, option) => {
          acc[option] = {
            count: teacherTallies[option]?.count || 0,
            percentage: teacherTallies[option]?.percentage || 0,
          };
          return acc;
        },
        {} as Record<string, ActivityData>
      ),
      totalMinutesObserved: getTotalMinutesObserved() * 2,
      startTime: startTime?.toISOString(),
      elapsedTime: elapsedTime,
    };

    try {
      await api.patch(`/api/evaluations/${evaluationId}/`, {
        additional_comments: JSON.stringify(scoringData)
      });

      alert("Evaluation saved successfully!");
    } catch (error) {
      console.error("Failed to save evaluation", error);
    }
  };

  return (
    <div className="mb-4 rounded-lg border border-gray-300 p-4">
      <div className="mb-4 text-center text-sm font-semibold text-gray-700">
        <div className="flex w-full flex-row justify-between">
          <span>Current Time: {currentTime}</span>
          <span>|</span>
          <span>
            Time Started:{" "}
            {startTime?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}{" "}
          </span>
          <span>|</span>
          <span>Time Elapsed: {elapsedTime} Minutes</span>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-center gap-3">
        <div className="flex flex-col items-center gap-4">
          <div className="text-center text-sm text-gray-400">
            The Observer must select at least one option for both the student and teacher to complete the
            minute.
            <br />
            Timer will start after selecting an option.
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              className="tooltip hidden text-xl font-bold disabled:opacity-30"
              onClick={handlePrev}
              disabled={minute === MIN_MINUTE || navigationDisabled}
              data-tip="Click to go back to the previous minutes"
            >
              &larr;
            </button>
            <h2 className="text-xl font-bold">{`Minutes ${minute - 2} - ${minute}`}</h2>
            <button
              className="tooltip hidden text-xl font-bold disabled:opacity-30"
              onClick={handleNext}
              disabled={minute === MAX_MINUTE || navigationDisabled}
              data-tip="Click to go to the next minutes"
            >
              &rarr;
            </button>
          </div>

          <p>
            Next minute in: {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, "0")}
          </p>

          <div className="grid grid-cols-5 gap-2 md:grid-cols-15">
            {minuteBoxes.map((m) => {
              const selections = selectionsByMinute[m] || { student: [], teacher: [] };
              const answered = selections.student.length > 0 && selections.teacher.length > 0;

              return (
                <button
                  key={m}
                  onClick={() => {
                    if (!navigationDisabled) {
                      startTimer();
                      setMinute(m);
                    }
                  }}
                  disabled={navigationDisabled}
                  className={`h-10 w-10 rounded-md text-sm font-semibold ${
                    minute === m
                      ? hasStudentAndTeacherSelected
                        ? "bg-[#1c402a] text-white"
                        : "bg-gray-400 text-white"
                      : answered
                        ? "bg-[#1c402a] text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mb-6 text-center text-lg font-semibold text-gray-700">
        Students Doing
      </div>
      <div className="mb-4 flex flex-wrap justify-center gap-2">
        {studentOptions.map((label, index) => (
          <ToggleBox
            key={index}
            label={label}
            active={currentStudentSelections.includes(label)}
            onToggle={handleStudentToggle}
          />
        ))}
      </div>
      <div className="mb-2 flex flex-col items-center">
        <label className="mb-1 text-sm font-medium text-gray-700">Student Comments</label>
        <textarea
          className="w-full max-w-md rounded border border-gray-300 p-2"
          value={currentStudentComments}
          onChange={handleStudentCommentChange}
        />
      </div>
      <div className="mb-6 text-center text-lg font-semibold text-gray-700">
        Teacher Doing
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {teacherOptions.map((label, index) => (
          <ToggleBox
            key={index}
            label={label}
            active={currentTeacherSelections.includes(label)}
            onToggle={handleTeacherToggle}
          />
        ))}
      </div>
      <div className="mb-2 flex flex-col items-center">
        <label className="mb-1 text-sm font-medium text-gray-700">Teacher Comments</label>
        <textarea
          className="w-full max-w-md rounded border border-gray-300 p-2"
          value={currentTeacherComments}
          onChange={handleTeacherCommentChange}
        />
      </div>

      <div className="collapse-arrow collapse mt-8 rounded-xl border border-gray-300">
        <input type="checkbox" />
        <div className="collapse-title text-center text-lg font-semibold">
          Activity Summary
        </div>
        <div className="collapse-content">
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h4 className="mb-2 text-center font-semibold">
                Student Activities
              </h4>
              <div className="space-y-2">
                {studentOptions.map((activity) => (
                  <div key={activity} className="flex justify-between">
                    <span>{activity}:</span>
                    <span>
                      {studentTallies[activity]?.count || 0}{" "}
                      times ({studentTallies[activity]?.percentage.toFixed(2) || "0.00"}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="mb-2 text-center font-semibold">
                Teacher Activities
              </h4>
              <div className="space-y-2">
                {teacherOptions.map((activity) => (
                  <div key={activity} className="flex justify-between">
                    <span>{activity}:</span>
                    <span>
                      {teacherTallies[activity]?.count || 0}{" "}
                      times ({teacherTallies[activity]?.percentage.toFixed(2) || "0.00"}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4 text-center text-sm text-gray-600">
            Total Minutes Observed: {getTotalMinutesObserved() * 2}
          </div>
          <div className="mt-4 flex justify-center">
            <button
              onClick={handleSaveEvaluation}
              className="rounded-lg bg-[#1c402a] px-6 py-2 text-white transition-colors hover:bg-[#2c503a]"
              disabled={getTotalMinutesObserved() === 0}
            >
              Save Evaluation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CopusMatrix;