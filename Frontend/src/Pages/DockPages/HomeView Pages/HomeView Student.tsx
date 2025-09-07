import React, { useEffect, useState } from "react";
import SubjectCards from "../../../Components/Dashboard Components/Student Components/Subject Cards";
import SemesterCard from "../../../Components/Dashboard Components/HR Components/Semester Cards";
import DashboardHeader from "../../../Components/Dashboard Components/Dashboard Header";
import api from "../../../utils/api";
import { mapTypeToFrontend } from "../../../Components/Evaluation Components/CreateStudentQuestion";

interface Schedule {
  id: number;
  subject_name: string;
  instructor_name: string;
  section_name: string;
  semester: string;
  year: string;
  room_name: string;
}

interface StudentEvaluation {
  id: number;
  title: string;
  description: string;
  import_questions: any[];
}

interface Subject {
  id: number;
  name: string;
  teacher: string;
  section: string;
  scheduleId: number;
  questions: any[];
  image?: string | null;
  isCompleted?: boolean;
}

/* ---------------------------
   Section Header with line
---------------------------- */
const SectionHeader = ({ title }: { title: string }) => (
  <div className="mb-2 flex w-full items-center gap-3">
    <h2 className="shrink-0 text-xl font-semibold text-white">{title}</h2>
    <div className="h-px flex-1 bg-white/30" />
  </div>
);

function Home() {
  const [openAnswerDialog, setOpenAnswerDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [currentEvaluation, setCurrentEvaluation] = useState<StudentEvaluation | null>(null);
  const [currentSubject, setCurrentSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewAnswers, setViewAnswers] = useState<Record<number, string>>({});

  // Fetch student's schedules and evaluation completion status
  useEffect(() => {
    const fetchStudentSchedulesAndProgress = async () => {
      setLoading(true);
      try {
        const response = await api.get("/schedule/schedules/my-schedules/");
        const subjectCards: Subject[] = response.data.map((schedule: Schedule) => ({
          id: schedule.id,
          name: schedule.subject_name,
          teacher: schedule.instructor_name,
          section: schedule.section_name,
          scheduleId: schedule.id,
          questions: [],
          image: null,
          isCompleted: false,
        }));

        await Promise.all(
          subjectCards.map(async (subject) => {
            try {
              const evalRes = await api.get(
                `/studentevaluation/studentevaluation/by-schedule/${subject.scheduleId}/`,
              );
              subject.isCompleted = !!evalRes.data.is_completed;
            } catch {
              subject.isCompleted = false;
            }
          }),
        );

        setSubjects(subjectCards);
      } catch (error) {
        console.error("Error fetching schedules or progress:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudentSchedulesAndProgress();
  }, []);

  // Handle subject card click
  const handleSubjectClick = async (subjectName: string) => {
    const selectedSubject = subjects.find((s) => s.name === subjectName);
    if (!selectedSubject) return;

    try {
      const evalResponse = await api.get(
        `/studentevaluation/studentevaluation/by-schedule/${selectedSubject.scheduleId}/`,
      );
      const importQuestions = evalResponse.data.import_questions || [];
      let mappedQuestions: any[] = [];

      if (importQuestions.length > 0) {
        if (typeof importQuestions[0] === "number") {
          const allQuestionsResponse = await api.get(
            "/studentevaluationquestion/studentevaluationquestion/",
          );
          mappedQuestions = allQuestionsResponse.data
            .filter((q: any) => importQuestions.includes(q.id))
            .map((q: any) => ({
              id: q.id,
              question: q.question,
              type: mapTypeToFrontend(q.type),
              choices: q.options || [],
            }));
        } else {
          mappedQuestions = importQuestions.map((q: any) => ({
            id: q.id,
            question: q.question,
            type: mapTypeToFrontend(q.type),
            choices: q.options || [],
          }));
        }
      }

      setCurrentEvaluation({
        ...evalResponse.data,
        import_questions: mappedQuestions,
      });
      setCurrentSubject(selectedSubject);

      if (evalResponse.data.is_completed) {
        const answers: Record<number, string> = {};
        try {
          const prevResponse = await api.get(
            `/studentevaluationresponse/studentevaluationresponse/?student_evaluation=${evalResponse.data.id}&user=current`,
          );
          if (prevResponse.data && prevResponse.data.length > 0) {
            prevResponse.data.forEach((resp: any) => {
              answers[resp.student_eval_question] = resp.answer;
            });
          }
        } catch { }
        setViewAnswers(answers);
        setOpenViewDialog(true);
      } else {
        setOpenAnswerDialog(true);
      }
    } catch (error) {
      console.error("Error fetching evaluation:", error);
      alert("No evaluation found for this subject");
    }
  };

  // Handle evaluation submission
  const handleSubmitEvaluation = async (formData: FormData) => {
    if (!currentEvaluation || !currentSubject) return;

    try {
      const responses = currentEvaluation.import_questions.map((question, index) => ({
        question_id: question.id,
        answer: formData.get(`question-${index}`) as string,
      }));

      await api.post(
        "/studentevaluationresponse/studentevaluationresponse/submit-responses/",
        {
          student_evaluation_id: currentEvaluation.id,
          responses: responses,
        },
      );

      setSubjects((prev) =>
        prev.map((subject) =>
          subject.id === currentSubject.id ? { ...subject, isCompleted: true } : subject,
        ),
      );
      setOpenAnswerDialog(false);
      alert(`${currentSubject.name} evaluation submitted successfully!`);
    } catch (error: any) {
      console.error("Error submitting evaluation:", error);
      if (error.response?.data?.error) {
        alert(error.response.data.error);
      } else {
        alert("Error submitting evaluation. Please try again.");
      }
    }
  };

  const totalSubjects = subjects.length;
  const completedCount = subjects.filter((s) => s.isCompleted).length;
  const ratio = `${completedCount}/${totalSubjects}`;

  const semesterData = [
    { semester: "1st", ratio },
    { semester: "2nd", ratio },
  ];

  if (loading) {
    return (
      <div className="home-page z-10 flex h-full w-full flex-col items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
        <p className="mt-4 text-white">Loading your subjects...</p>
      </div>
    );
  }

  const unfinishedSubjects = subjects.filter((s) => !s.isCompleted);
  const finishedSubjects = subjects.filter((s) => s.isCompleted);

  return (
    <div className="home-page z-10 flex h-full w-full flex-col items-center justify-center gap-y-6">
      {/* Header */}
      <DashboardHeader />

      {/* Content */}
      <div className="mt-35 ml-3 flex h-auto w-full flex-col items-stretch justify-start gap-6 overflow-y-auto md:mr-20 md:flex-row md:items-start md:justify-between">
        {/* Left: Subject lists */}
        <div className="flex p-6 min-w-0 flex-1 flex-col gap-6">
          <div>
            <SectionHeader title="Unfinished Subjects" />
            <SubjectCards
              subjects={unfinishedSubjects}
              onClick={handleSubjectClick}

            />
          </div>

          <div>
            <SectionHeader title="Finished Subjects" />
            <SubjectCards
              subjects={finishedSubjects}
              onClick={handleSubjectClick}

            />
          </div>
        </div>

        {/* Right: Progress circles */}
        <div className="flex shrink-0 flex-row items-center justify-center gap-6 p-12 md:ml-8 md:mt-26 md:w-auto md:flex-col">
          {semesterData.map(({ semester, ratio }) => (
            <SemesterCard key={semester} semester={semester} ratio={ratio} />
          ))}
        </div>
      </div>

      {/* Answer Dialog */}
      {openAnswerDialog && currentEvaluation && currentSubject && (
        <div className="modal modal-open" id="answer_modal">
          <div className="modal-box flex h-[80%] w-[90%] max-w-5xl flex-col text-black md:w-11/12">
            <div className="sticky top-0 z-10 flex items-start justify-between px-6 py-3">
              <div className="text-left">
                <h3 className="text-2xl font-bold">{currentSubject.name}</h3>
                <p className="text-md text-gray-400">
                  Teacher: <strong>{currentSubject.teacher}</strong>
                </p>
                <p className="text-md text-gray-400">
                  Section: <strong>{currentSubject.section}</strong>
                </p>
                <p className="text-md mt-2 text-gray-600">{currentEvaluation.title}</p>
                {currentEvaluation.description && (
                  <p className="text-sm text-gray-500">{currentEvaluation.description}</p>
                )}
              </div>
              <button
                type="button"
                className="btn btn-sm btn-error mt-2 h-9 text-white"
                onClick={() => setOpenAnswerDialog(false)}
              >
                Cancel
              </button>
            </div>

            <form
              method="dialog"
              className="mb-6 flex-1 overflow-y-scroll border-t-3 px-6 shadow-[inset_0_30px_20px_-20px_rgba(0,0,0,0.35)]"
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleSubmitEvaluation(formData);
              }}
            >
              <div className="flex flex-col gap-12">
                {currentEvaluation.import_questions.map((question, index) => (
                  <div key={question.id} className="flex flex-col gap-2 md:items-start">
                    <label className="w-full pt-2 text-lg font-semibold">
                      {index + 1}. {question.question}
                    </label>

                    {question.type === "mcq" && question.choices?.length > 0 && (
                      <div className="flex flex-col gap-2">
                        {question.choices.map((choice: string, choiceIndex: number) => (
                          <label key={choiceIndex} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`question-${index}`}
                              value={choice}
                              className="radio"
                              required
                            />
                            {choice}
                          </label>
                        ))}
                      </div>
                    )}

                    {question.type === "rating" && (
                      <div className="flex flex-col gap-2">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <label key={rating} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`question-${index}`}
                              value={rating.toString()}
                              className="radio"
                              required
                            />
                            {rating} -{" "}
                            {rating === 1
                              ? "Poor/Strongly Disagree"
                              : rating === 2
                                ? "Below Average/Disagree"
                                : rating === 3
                                  ? "Average/Neutral"
                                  : rating === 4
                                    ? "Good/Agree"
                                    : "Excellent/Strongly Agree"}
                          </label>
                        ))}
                      </div>
                    )}

                    {question.type === "comment" && (
                      <textarea
                        name={`question-${index}`}
                        className="textarea textarea-bordered w-full"
                        placeholder="Enter your response..."
                        rows={3}
                        required
                        defaultValue=""
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="modal-action bottom-0 pt-3">
                <button type="submit" className="btn btn-success text-white">
                  Submit Evaluation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View-Only Dialog */}
      {openViewDialog && currentEvaluation && currentSubject && (
        <div className="modal modal-open" id="view_modal">
          <div className="modal-box flex h-[80%] w-[90%] max-w-5xl flex-col text-black md:w-11/12">
            <div className="sticky top-0 z-10 flex items-start justify-between px-6 py-3">
              <div className="text-left">
                <h3 className="text-2xl font-bold">{currentSubject.name}</h3>
                <p className="text-md text-gray-400">
                  Teacher: <strong>{currentSubject.teacher}</strong>
                </p>
                <p className="text-md text-gray-400">
                  Section: <strong>{currentSubject.section}</strong>
                </p>
                <p className="text-md mt-2 text-gray-600">{currentEvaluation.title}</p>
                {currentEvaluation.description && (
                  <p className="text-sm text-gray-500">{currentEvaluation.description}</p>
                )}
                <p className="mt-2 font-semibold text-green-600">
                  You have already submitted this evaluation. Answers are view-only.
                </p>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-error mt-2 h-9 text-white"
                onClick={() => setOpenViewDialog(false)}
              >
                Close
              </button>
            </div>

            <div className="mb-6 flex-1 overflow-y-scroll border-t-3 px-6 shadow-[inset_0_30px_20px_-20px_rgba(0,0,0,0.35)]">
              <div className="flex flex-col gap-12">
                {currentEvaluation.import_questions.map((question, index) => {
                  const prevAnswer = viewAnswers[question.id] || "";
                  return (
                    <div key={question.id} className="flex flex-col gap-2 md:items-start">
                      <label className="w-full pt-2 text-lg font-semibold">
                        {index + 1}. {question.question}
                      </label>

                      {question.type === "mcq" && question.choices?.length > 0 && (
                        <div className="flex flex-col gap-2">
                          {question.choices.map((choice: string, choiceIndex: number) => (
                            <label key={choiceIndex} className="flex items-center gap-2">
                              <input
                                type="radio"
                                name={`question-${index}`}
                                value={choice}
                                className="radio"
                                disabled
                                checked={prevAnswer === choice}
                                readOnly
                              />
                              {choice}
                            </label>
                          ))}
                        </div>
                      )}

                      {question.type === "rating" && (
                        <div className="flex flex-col gap-2">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <label key={rating} className="flex items-center gap-2">
                              <input
                                type="radio"
                                name={`question-${index}`}
                                value={rating.toString()}
                                className="radio"
                                disabled
                                checked={prevAnswer === rating.toString()}
                                readOnly
                              />
                              {rating} -{" "}
                              {rating === 1
                                ? "Poor/Strongly Disagree"
                                : rating === 2
                                  ? "Below Average/Disagree"
                                  : rating === 3
                                    ? "Average/Neutral"
                                    : rating === 4
                                      ? "Good/Agree"
                                      : "Excellent/Strongly Agree"}
                            </label>
                          ))}
                        </div>
                      )}

                      {question.type === "comment" && (
                        <textarea
                          name={`question-${index}`}
                          className="textarea textarea-bordered w-full"
                          placeholder="Enter your response..."
                          rows={3}
                          value={prevAnswer}
                          disabled
                          readOnly
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
