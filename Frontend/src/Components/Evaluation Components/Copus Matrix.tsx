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
  evaluationId: number;
  onTalliesUpdate?: (
    studentTallies: Record<string, ActivityData>,
    teacherTallies: Record<string, ActivityData>,
  ) => void;
}

// Define the TimestampData interface
interface TimestampData {
  id: number;
  evaluation: number;
  student_activities: Record<string, boolean>;
  instructor_activities: Record<string, boolean>;
  student_comments?: Record<string, string>;
  instructor_comments?: Record<string, string>;
  time_record: string;
}

const CopusMatrix: React.FC<CopusMatrixProps> = ({ evaluationId, onTalliesUpdate }) => {
  const MIN_MINUTE = 0;
  const MAX_MINUTE = 58;
  const INCREMENT = 2;

  // Your existing state variables
  const [studentTallies, setStudentTallies] = useState<{
    [key: string]: ActivityData;
  }>({});
  const [teacherTallies, setTeacherTallies] = useState<{
    [key: string]: ActivityData;
  }>({});
  const [minute, setMinute] = useState(MIN_MINUTE);
  const [currentTime, setCurrentTime] = useState<string>("");
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState<string>("00");
  const [isTimerStarted, setIsTimerStarted] = useState(false);
  // evaluationId is now a prop, not local state
  const [activeMinute, setActiveMinute] = useState<number>(0);
  const [countdown, setCountdown] = useState<number>(120);
  const [navigationDisabled, setNavigationDisabled] = useState(true);
  const [selectionsByMinute, setSelectionsByMinute] = useState<{
    [key: number]: {
      student: string[];
      teacher: string[];
      studentComments: string;
      teacherComments: string;
    };
  }>({});
  const [currentStudentSelections, setCurrentStudentSelections] = useState<string[]>([]);
  const [currentTeacherSelections, setCurrentTeacherSelections] = useState<string[]>([]);
  const [currentStudentComments, setCurrentStudentComments] = useState<string>("");
  const [currentTeacherComments, setCurrentTeacherComments] = useState<string>("");
  const [timestampIds, setTimestampIds] = useState<{ [key: number]: number }>({});
  const [isWithinScheduleTime, setIsWithinScheduleTime] = useState(true);
  const [canEditEvaluation, setCanEditEvaluation] = useState(false);
  const [setSchedule] = useState<any>(null);

  const minuteBoxes = Array.from(
    { length: (MAX_MINUTE - MIN_MINUTE) / INCREMENT + 1 },
    (_, index) => MIN_MINUTE + index * INCREMENT,
  );

  // Use backend display names and keys exactly
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

  // Define the mapping between frontend labels and backend keys (1:1 now)
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

  // Define the timestamp API functions
  const timestampApi = {
    createTimestamp: async (data: Omit<TimestampData, "id">) => {
      const response = await api.post("/timestamp/timestamps/", data);
      return response.data;
    },
    updateTimestamp: async (id: number, data: Partial<TimestampData>) => {
      const response = await api.patch(`/timestamp/timestamps/${id}/`, data);
      return response.data;
    },
    getTimestamps: async (evaluationId: number) => {
      const response = await api.get(`/timestamp/timestamps/?evaluation=${evaluationId}`);
      return response.data;
    },
  };

  // Add or update this function in CopusMatrix.tsx
  const saveCurrentSelections = async () => {
    if (!evaluationId) return;

    try {
      const timestampId = timestampIds[activeMinute];
      const timestampData = {
        evaluation: evaluationId,
        student_activities: currentStudentSelections.reduce(
          (acc, key) => {
            acc[key] = true;
            return acc;
          },
          {} as Record<string, boolean>,
        ),
        instructor_activities: currentTeacherSelections.reduce(
          (acc, key) => {
            acc[key] = true;
            return acc;
          },
          {} as Record<string, boolean>,
        ),
        student_comments: { notes: currentStudentComments },
        instructor_comments: { notes: currentTeacherComments },
        time_record: formatTimeRecord(activeMinute),
      };

      if (timestampId) {
        // Update existing timestamp
        await api.put(`/timestamp/timestamps/${timestampId}/`, timestampData);
      } else {
        // Create new timestamp (shouldn't normally happen with bulk creation)
        const response = await api.post("/timestamp/timestamps/", timestampData);
        // Update the timestamp IDs mapping
        setTimestampIds({
          ...timestampIds,
          [activeMinute]: response.data.id,
        });
      }

      // Update the selections by minute
      setSelectionsByMinute({
        ...selectionsByMinute,
        [activeMinute]: {
          student: currentStudentSelections,
          teacher: currentTeacherSelections,
          studentComments: currentStudentComments,
          teacherComments: currentTeacherComments,
        },
      });

      // Show success message
      console.log("Timestamp saved successfully");
    } catch (error) {
      console.error("Error saving timestamp:", error);
    }
  };

  // Helper function to format time record
  const formatTimeRecord = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:00`;
  };

  const checkTimeConstraints = async (evalId: number) => {
    try {
      // Get the evaluation to find its schedule
      const evaluation = await api.get(`/evaluation/evaluations/${evalId}/`);
      const scheduleId = evaluation.data.schedule;

      // Get the schedule
      const scheduleData = await api.get(`/schedule/schedules/${scheduleId}/`);
      setSchedule(scheduleData.data);

      // Check if current time is within schedule time
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes(); // Convert to minutes

      // Parse schedule times (assuming format like "14:30:00")
      const startParts = scheduleData.data.start_time.split(":");
      const endParts = scheduleData.data.end_time.split(":");

      const startMinutes = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
      const endMinutes = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);

      // Check if current time is within schedule
      const isWithin = currentTime >= startMinutes && currentTime <= endMinutes;
      setIsWithinScheduleTime(isWithin);

      // Check if user has permission to edit outside schedule time
      try {
        const permissionCheck = await api.get(`/evaluation/evaluations/${evalId}/can-edit/`);
        setCanEditEvaluation(permissionCheck.data.can_edit);
      } catch (error) {
        // If the endpoint doesn't exist, default to false
        setCanEditEvaluation(false);
        console.error("Failed to check edit permissions", error);
      }
    } catch (error) {
      console.error("Failed to check time constraints", error);
    }
  };

  // Helper function to format time for a given minute
  const formatTimeForMinute = (minuteValue: number): string => {
    if (!startTime) return new Date().toISOString().split("T")[1].substring(0, 8);

    const time = new Date(startTime);
    time.setMinutes(time.getMinutes() + minuteValue);
    return time.toISOString().split("T")[1].substring(0, 8);
  };

  // Enhance the loadExistingTimestamps function in CopusMatrix.tsx
  const loadExistingTimestamps = async (evalId: number) => {
    try {
      // Fetch all timestamps for this evaluation
      const response = await api.get(`/timestamp/timestamps/?evaluation=${evalId}`);
      const timestamps: TimestampData[] = response.data;

      // Initialize the selections by minute
      const newSelectionsByMinute: {
        [key: number]: {
          student: string[];
          teacher: string[];
          studentComments: string;
          teacherComments: string;
        };
      } = {};

      // Initialize the timestamp IDs mapping
      const newTimestampIds: { [key: number]: number } = {};

      // Process each timestamp
      timestamps.forEach((timestamp) => {
        // Extract the minute from the time_record ("00:MM:00")
        const [hh, mm] = timestamp.time_record.split(":");
        const minuteValue = parseInt(mm, 10);

        // Store the timestamp ID
        newTimestampIds[minuteValue] = timestamp.id;

        // Convert student_activities and instructor_activities to arrays of selected display labels
        const studentSelections = Object.entries(timestamp.student_activities || {})
          .filter(([_, isSelected]) => isSelected)
          .map(([key]) => {
            // Map backend key to display label
            const displayLabel = Object.keys(studentActivityMap).find(
              (label) => studentActivityMap[label] === key,
            );
            return displayLabel || key;
          });

        const teacherSelections = Object.entries(timestamp.instructor_activities || {})
          .filter(([_, isSelected]) => isSelected)
          .map(([key]) => {
            const displayLabel = Object.keys(teacherActivityMap).find(
              (label) => teacherActivityMap[label] === key,
            );
            return displayLabel || key;
          });

        // Store the selections for this minute
        newSelectionsByMinute[minuteValue] = {
          student: studentSelections,
          teacher: teacherSelections,
          studentComments:
            timestamp.student_comments?.comment || timestamp.student_comments?.notes || "",
          teacherComments:
            timestamp.instructor_comments?.comment || timestamp.instructor_comments?.notes || "",
        };
      });

      // Add or update these functions in CopusMatrix.tsx
      const handleMinuteChange = (newMinute: number) => {
        // Save current selections before changing
        saveCurrentSelections();

        // Update the active minute
        setActiveMinute(newMinute);
        setMinute(newMinute);

        // Load the selections for the new minute
        const newSelections = selectionsByMinute[newMinute];
        if (newSelections) {
          setCurrentStudentSelections(newSelections.student);
          setCurrentTeacherSelections(newSelections.teacher);
          setCurrentStudentComments(newSelections.studentComments);
          setCurrentTeacherComments(newSelections.teacherComments);
        } else {
          // Initialize empty selections if none exist
          setCurrentStudentSelections([]);
          setCurrentTeacherSelections([]);
          setCurrentStudentComments("");
          setCurrentTeacherComments("");
        }
      };

      // Update state
      setSelectionsByMinute(newSelectionsByMinute);
      setTimestampIds(newTimestampIds);

      // If there are timestamps, set the active minute to the first one
      if (timestamps.length > 0) {
        // Find the first minute that has any student or teacher activity
        const evaluatedMinutes = Object.entries(newSelectionsByMinute)
          .filter(([_, sel]) => sel.student.length > 0 || sel.teacher.length > 0)
          .map(([minute]) => Number(minute));
        const firstEvaluatedMinute =
          evaluatedMinutes.length > 0
            ? evaluatedMinutes[0]
            : Math.min(...Object.keys(newSelectionsByMinute).map(Number));
        setActiveMinute(firstEvaluatedMinute);
        setMinute(firstEvaluatedMinute);

        // Load the selections for the active minute
        const activeSelections = newSelectionsByMinute[firstEvaluatedMinute];
        if (activeSelections) {
          setCurrentStudentSelections(activeSelections.student);
          setCurrentTeacherSelections(activeSelections.teacher);
          setCurrentStudentComments(activeSelections.studentComments);
          setCurrentTeacherComments(activeSelections.teacherComments);
        }
      }

      // Enable navigation since we've loaded existing data
      setNavigationDisabled(false);
    } catch (error) {
      console.error("Error loading timestamps:", error);
    }
  };
  useEffect(() => {
    if (evaluationId) {
      loadExistingTimestamps(evaluationId);
    }
  }, [evaluationId]);

  // Keep your existing useEffect hooks
  useEffect(() => {
    const saved = selectionsByMinute[minute] || {
      student: [],
      teacher: [],
      studentComments: "",
      teacherComments: "",
    };
    setCurrentStudentSelections(saved.student);
    setCurrentTeacherSelections(saved.teacher);
    setCurrentStudentComments(saved.studentComments);
    setCurrentTeacherComments(saved.teacherComments);
  }, [minute, selectionsByMinute]);

  // Your existing getTotalMinutesObserved function
  const getTotalMinutesObserved = () => {
    return Object.values(selectionsByMinute).filter(
      (selection) => selection.student.length > 0 && selection.teacher.length > 0,
    ).length;
  };

  // Your existing calculateTallies function
  const calculateTallies = () => {
    let totalStudentSelections = 0;
    let totalTeacherSelections = 0;
    const newStudentTallies: { [key: string]: ActivityData } = {};
    const newTeacherTallies: { [key: string]: ActivityData } = {};

    // Initialize all options
    studentOptions.forEach((option) => {
      newStudentTallies[option] = { count: 0, percentage: 0 };
    });

    teacherOptions.forEach((option) => {
      newTeacherTallies[option] = { count: 0, percentage: 0 };
    });

    // Count all selections
    Object.values(selectionsByMinute).forEach((selection) => {
      selection.student.forEach((activity) => {
        const displayName =
          Object.keys(studentActivityMap).find((key) => studentActivityMap[key] === activity) ||
          activity;
        if (newStudentTallies[displayName]) {
          newStudentTallies[displayName].count++;
          totalStudentSelections++;
        }
      });

      selection.teacher.forEach((activity) => {
        const displayName =
          Object.keys(teacherActivityMap).find((key) => teacherActivityMap[key] === activity) ||
          activity;
        if (newTeacherTallies[displayName]) {
          newTeacherTallies[displayName].count++;
          totalTeacherSelections++;
        }
      });
    }); // <-- This closing brace was missing

    // Calculate percentages
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
    teacherComments: string = currentTeacherComments,
  ) => {
    // Update local state first (same as your existing code)
    setSelectionsByMinute((prev) => {
      const prevForMinute = prev[minute] || {
        student: [],
        teacher: [],
        studentComments: "",
        teacherComments: "",
      };
      const updated = {
        ...prev,
        [minute]: {
          ...prevForMinute,
          [type]: selections,
          studentComments: studentComments,
          teacherComments: teacherComments,
        },
      };
      return updated;
    });

    if (type === "student") setCurrentStudentSelections(selections);
    else setCurrentTeacherSelections(selections);

    // Don't proceed if we don't have an evaluation ID yet
    if (!evaluationId) return;

    // Check if we can edit (either within schedule time or have permission)
    if (!isWithinScheduleTime && !canEditEvaluation) {
      console.warn("Cannot update evaluation outside of schedule time without permission");
      return;
    }

    // Get the current selections for both student and teacher
    const currentSelections = selectionsByMinute[minute] || {
      student: [],
      teacher: [],
      studentComments: "",
      teacherComments: "",
    };
    const studentSelections = type === "student" ? selections : currentSelections.student;
    const teacherSelections = type === "teacher" ? selections : currentSelections.teacher;

    // Create the timestamp data
    const timestampData: Omit<TimestampData, "id"> = {
      evaluation: evaluationId,
      // Convert frontend labels to backend keys and set as boolean values
      student_activities: Object.fromEntries(
        Object.entries(studentActivityMap).map(([display, key]) => [
          key,
          studentSelections.includes(display),
        ]),
      ),
      instructor_activities: Object.fromEntries(
        Object.entries(teacherActivityMap).map(([display, key]) => [
          key,
          teacherSelections.includes(display),
        ]),
      ),
      // Always use static time_record
      time_record: formatTimeRecord(minute),
      // Add comments if provided
      student_comments: { comment: studentComments },
      instructor_comments: { comment: teacherComments },
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

  // Restriction function to limit selections to maximum 2 activities per category
  const restrictSelections = (
    currentSelections: string[],
    label: string,
    maxSelections: number = 1,
  ): string[] => {
    if (currentSelections.includes(label)) {
      // Deselect if already selected
      return [];
    } else {
      // Always replace with the new selection
      return [label];
    }
  };

  // Updated toggle handlers with restriction
  const handleStudentToggle = (label: string) => {
    startTimer();
    const newSelections = restrictSelections(currentStudentSelections, label, 1);

    // Only update if selections actually changed
    if (newSelections !== currentStudentSelections) {
      updateSelections("student", newSelections, currentStudentComments, currentTeacherComments);
    }
  };

  const handleTeacherToggle = (label: string) => {
    startTimer();
    const newSelections = restrictSelections(currentTeacherSelections, label, 1);

    // Only update if selections actually changed
    if (newSelections !== currentTeacherSelections) {
      updateSelections("teacher", newSelections, currentStudentComments, currentTeacherComments);
    }
  };

  const handleStudentCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentStudentComments(e.target.value);
    updateSelections("student", currentStudentSelections, e.target.value, currentTeacherComments);
  };

  const handleTeacherCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentTeacherComments(e.target.value);
    updateSelections("teacher", currentTeacherSelections, currentStudentComments, e.target.value);
  };

  // Update your startTimer function to load timestamps if an evaluation ID is provided
  const startTimer = async () => {
    if (!isTimerStarted) {
      const startTimeValue = new Date();
      setStartTime(startTimeValue);
      setIsTimerStarted(true);
      // No need to create evaluation here, evaluationId is always provided as a prop
    }
  };

  // Move these useEffect hooks outside the startTimer function
  // They should be at the component level, not inside another function
  useEffect(() => {
    if (!isTimerStarted) {
      setCurrentTime(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
      return;
    }

    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );

      if (startTime) {
        const elapsed = now.getTime() - startTime.getTime();
        const totalMinutes = Math.floor(elapsed / (1000 * 60));
        setElapsedTime(totalMinutes.toString().padStart(2, "0"));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime, isTimerStarted]);

  // Countdown timer effect
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

  // Navigation handlers
  const handlePrev = () => {
    setMinute((prev) => Math.max(prev - INCREMENT, MIN_MINUTE));
  };

  const handleNext = () => {
    setMinute((prev) => Math.min(prev + INCREMENT, MAX_MINUTE));
  };

  // Update minute when activeMinute changes
  useEffect(() => {
    setMinute(activeMinute + 2);
  }, [activeMinute]);

  const hasStudentAndTeacherSelected =
    currentStudentSelections.length > 0 && currentTeacherSelections.length > 0;

  // Render time constraint warning if needed
  const renderTimeConstraintWarning = () => {
    if (!isWithinScheduleTime && !canEditEvaluation) {
      return (
        <div className="mb-4 border-l-4 border-yellow-500 bg-yellow-100 p-4 text-yellow-700">
          <p>This evaluation is outside the scheduled class time. You can view but not edit.</p>
        </div>
      );
    }

    if (!isWithinScheduleTime && canEditEvaluation) {
      return (
        <div className="mb-4 border-l-4 border-blue-500 bg-blue-100 p-4 text-blue-700">
          <p>
            This evaluation is outside the scheduled class time, but you have permission to edit it.
          </p>
        </div>
      );
    }

    return null;
  };

  // Handle save evaluation
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
        {} as Record<string, ActivityData>,
      ),
      instructor_activities: teacherOptions.reduce(
        (acc, option) => {
          acc[option] = {
            count: teacherTallies[option]?.count || 0,
            percentage: teacherTallies[option]?.percentage || 0,
          };
          return acc;
        },
        {} as Record<string, ActivityData>,
      ),
      totalMinutesObserved: getTotalMinutesObserved() * 2,
      startTime: startTime?.toISOString(),
      elapsedTime: elapsedTime,
    };

    try {
      // Update the evaluation with summary data
      await api.patch(`/evaluations/${evaluationId}/`, {
        additional_comments: JSON.stringify(scoringData),
      });

      alert("Evaluation saved successfully!");
    } catch (error) {
      console.error("Failed to save evaluation", error);
    }
  };

  return (
    <div className="mb-4 rounded-lg border border-gray-300 p-4">
      {/* Prevent layout jump with fixed height */}

      {/* Time + Countdown */}
      <div className="mb-4 text-center text-sm font-semibold text-gray-700">
        <div className="flex w-full flex-row justify-between">
          <span>Current Time: {currentTime}</span>
          <span>|</span>
          <span>
            Time Started:{" "}
            {startTime?.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          <span>|</span>
          <span>Time Elapsed: {elapsedTime} Minutes</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="mb-4 flex items-center justify-center gap-3">
        <div className="flex flex-col items-center gap-4">
          <div className="text-center text-sm text-gray-400">
            The Observer must select at least one option for both student and teacher.
            <br />
            Maximum of 2 activities can be selected per category for each timestamp.
            <br />
            Timer will start after selecting an option.
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              className="tooltip hidden text-xl font-bold disabled:opacity-30"
              onClick={handlePrev}
              disabled={
                minute === 2 || navigationDisabled || (!isWithinScheduleTime && !canEditEvaluation)
              }
              data-tip="Click to go back to the previous minutes"
            >
              &larr;
            </button>
            <h2 className="text-xl font-bold">{`Minutes ${minute}-${minute + INCREMENT}`}</h2>
            <button
              className="tooltip hidden text-xl font-bold disabled:opacity-30"
              onClick={handleNext}
              disabled={
                minute === 30 || navigationDisabled || (!isWithinScheduleTime && !canEditEvaluation)
              }
              data-tip="Click to go to the next minutes"
            >
              &rarr;
            </button>
          </div>

          <p>
            Next minute in: {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, "0")}
          </p>

          {/* Minute Grid */}
          <div className="grid grid-cols-5 gap-2 md:grid-cols-15">
            {minuteBoxes.map((m) => {
              const selections = selectionsByMinute[m] || {
                student: [],
                teacher: [],
              };
              const answered = selections.student.length > 0 && selections.teacher.length > 0;

              return (
                <button
                  key={m}
                  onClick={() => {
                    if (!navigationDisabled && (isWithinScheduleTime || canEditEvaluation)) {
                      startTimer();
                      setMinute(m);
                    }
                  }}
                  disabled={navigationDisabled || (!isWithinScheduleTime && !canEditEvaluation)}
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

      {/* Student Options */}
      <div className="mb-6 text-center text-lg font-semibold text-gray-700">Students Doing</div>
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

      {/* Teacher Options */}
      <div className="mb-6 text-center text-lg font-semibold text-gray-700">Teacher Doing</div>
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

      {/* Comments */}
      <div className="collapse-arrow collapse mt-4 border-1 border-gray-300">
        <input type="checkbox" />
        <div className="collapse-title text-lg font-semibold">Observation Comments</div>
        <div className="collapse-content">
          <div className="mb-2 flex flex-col items-center">
            <label className="mb-1 text-sm font-medium text-gray-700">
              Comments for the Professor
            </label>
            <textarea
              className="w-full max-w-md rounded border border-gray-300 p-2"
              value={currentTeacherComments}
              onChange={handleTeacherCommentChange}
              disabled={!isWithinScheduleTime && !canEditEvaluation}
            />
          </div>
          <div className="mb-2 flex flex-col items-center">
            <label className="mb-1 text-sm font-medium text-gray-700">
              Comments for the Students
            </label>
            <textarea
              className="w-full max-w-md rounded border border-gray-300 p-2"
              value={currentStudentComments}
              onChange={handleStudentCommentChange}
              disabled={!isWithinScheduleTime && !canEditEvaluation}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CopusMatrix;
