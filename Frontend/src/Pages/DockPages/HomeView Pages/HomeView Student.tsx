// Updated HomeView Student.tsx implementation

import { useEffect, useState } from "react";
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
}

function Home() {
  const [openModal, setOpenModal] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [currentEvaluation, setCurrentEvaluation] = useState<StudentEvaluation | null>(null);
  const [currentSubject, setCurrentSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);
  const [completedSubjects, setCompletedSubjects] = useState<Set<string>>(new Set());

  // Fetch student's schedules and transform to subject cards
  useEffect(() => {
    const fetchStudentSchedules = async () => {
      setLoading(true);
      try {
        // Fetch schedules for the logged-in student
        const response = await api.get('/schedule/schedules/my-schedules/');
        
        // Transform schedules to subject cards
        const subjectCards: Subject[] = response.data.map((schedule: Schedule) => ({
          id: schedule.id,
          name: schedule.subject_name,
          teacher: schedule.instructor_name,
          section: schedule.section_name,
          scheduleId: schedule.id,
          questions: [], // Will be loaded when card is clicked
          image: null,
        }));
        
        setSubjects(subjectCards);
      } catch (error) {
        console.error('Error fetching schedules:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentSchedules();
  }, []);

  // Handle subject card click
  const handleSubjectClick = async (subjectName: string) => {
    const selectedSubject = subjects.find(s => s.name === subjectName);
    if (!selectedSubject) return;

    try {
      // Fetch student evaluation for this schedule
      const evalResponse = await api.get(`/studentevaluation/studentevaluation/by-schedule/${selectedSubject.scheduleId}/`);
      
      console.log('Evaluation response:', evalResponse.data); // Debug log
      console.log('Import questions raw:', evalResponse.data.import_questions); // Debug log
      
      // Check if import_questions contains IDs or full objects
      const importQuestions = evalResponse.data.import_questions || [];
      let mappedQuestions: any[] = [];
      
      if (importQuestions.length > 0) {
        // Check if first item is a number (ID) or object
        if (typeof importQuestions[0] === 'number') {
          console.log('Import questions are IDs, fetching full question objects...'); // Debug log
          
          // Fetch all questions and filter by IDs
          const allQuestionsResponse = await api.get('/studentevaluationquestion/studentevaluationquestion/');
          console.log('All questions response:', allQuestionsResponse.data); // Debug log
          
          mappedQuestions = allQuestionsResponse.data
            .filter((q: any) => importQuestions.includes(q.id))
            .map((q: any) => {
              console.log('Full question object:', q); // Debug log
              console.log('Question type before mapping:', q.type); // Debug log
              
              const mappedType = mapTypeToFrontend(q.type);
              console.log('Mapped type:', mappedType); // Debug log
              
              return {
                id: q.id,
                question: q.question,
                type: mappedType,
                choices: q.options || [],
              };
            });
        } else {
          console.log('Import questions are full objects...'); // Debug log
          
          // Map full objects directly
          mappedQuestions = importQuestions.map((q: any) => {
            console.log('Question object:', q); // Debug log
            console.log('Question type before mapping:', q.type); // Debug log
            
            const mappedType = mapTypeToFrontend(q.type);
            console.log('Mapped type:', mappedType); // Debug log
            
            return {
              id: q.id,
              question: q.question,
              type: mappedType,
              choices: q.options || [],
            };
          });
        }
      }

      console.log('Final mapped questions:', mappedQuestions); // Debug log

      setCurrentEvaluation({
        ...evalResponse.data,
        import_questions: mappedQuestions
      });
      setCurrentSubject(selectedSubject);
      setOpenModal(subjectName);
    } catch (error) {
      console.error('Error fetching evaluation:', error);
      alert('No evaluation found for this subject');
    }
  };

  // Handle evaluation submission
  const handleSubmitEvaluation = async (formData: FormData) => {
    if (!currentEvaluation || !currentSubject) return;

    try {
      // Prepare responses array
      const responses = currentEvaluation.import_questions.map((question, index) => ({
        question_id: question.id,
        answer: formData.get(`question-${index}`) as string
      }));

      // Submit responses
      await api.post('/studentevaluationresponse/studentevaluationresponse/submit-responses/', {
        student_evaluation_id: currentEvaluation.id,
        responses: responses
      });

      // Mark as completed
      setCompletedSubjects(prev => new Set([...prev, currentSubject.name]));
      setOpenModal(null);
      alert(`${currentSubject.name} evaluation submitted successfully!`);
    } catch (error: any) {
      console.error('Error submitting evaluation:', error);
      if (error.response?.data?.error) {
        alert(error.response.data.error);
      } else {
        alert('Error submitting evaluation. Please try again.');
      }
    }
  };

  const totalSubjects = subjects.length;
  const ratio = `${completedSubjects.size}/${totalSubjects}`;

  const semesterData = [
    {
      semester: "1st",
      ratio: ratio,
    },
    {
      semester: "2nd", 
      ratio: ratio,
    },
  ];

  if (loading) {
    return (
      <div className="home-page z-10 flex h-full w-full flex-col items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
        <p className="mt-4 text-white">Loading your subjects...</p>
      </div>
    );
  }

  return (
    <div className="home-page z-10 flex h-full w-full flex-col items-center justify-center gap-y-6">
      {/* Header */}
      <DashboardHeader />

      {/* Content */}
      <div className="mt-35 ml-3 flex h-auto w-auto flex-col-reverse items-start justify-center gap-4 overflow-y-auto md:mr-103 md:flex-row">
        {/* Subject List */}
        <SubjectCards
          subjects={subjects}
          onClick={handleSubjectClick}
          completedSubjects={completedSubjects}
        />

        {/* Progress Bar */}
        <div className="flex w-full flex-row items-center justify-center gap-6 md:absolute md:right-20 md:mt-26 md:w-auto md:flex-col">
          {semesterData.map(({ semester, ratio }) => (
            <SemesterCard
              key={semester}
              semester={semester}
              ratio={ratio}
            />
          ))}
        </div>
      </div>

      {/* Evaluation Modal */}
      {openModal && currentEvaluation && currentSubject && (
        <div className="modal modal-open" id="subject_modal">
          <div className="modal-box flex h-[80%] w-[90%] max-w-5xl flex-col text-black md:w-11/12">
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 flex items-start justify-between px-6 py-3">
              <div className="text-left">
                <h3 className="text-2xl font-bold">{currentSubject.name}</h3>
                <p className="text-md text-gray-400">
                  Teacher: <strong>{currentSubject.teacher}</strong>
                </p>
                <p className="text-md text-gray-400">
                  Section: <strong>{currentSubject.section}</strong>
                </p>
                <p className="text-md text-gray-600 mt-2">
                  {currentEvaluation.title}
                </p>
                {currentEvaluation.description && (
                  <p className="text-sm text-gray-500">
                    {currentEvaluation.description}
                  </p>
                )}
              </div>
              <button
                type="button"
                className="btn btn-sm btn-error mt-2 h-9 text-white"
                onClick={() => setOpenModal(null)}
              >
                Cancel
              </button>
            </div>

            {/* Scrollable Questions */}
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
                {currentEvaluation.import_questions.map((question, index) => {
                  console.log(`Question ${index}:`, question); // Debug log
                  console.log(`Question type: ${question.type}`); // Debug log
                  
                  return (
                    <div key={question.id} className="flex flex-col gap-2 md:items-start">
                      {/* Question Text */}
                      <label className="w-full pt-2 text-lg font-semibold">
                        {index + 1}. {question.question}
                      </label>
                      
                      {/* Debug info */}
                      <p className="text-xs text-red-500">
                        Debug: Type = {question.type}, Choices = {JSON.stringify(question.choices)}
                      </p>
                      
                      {/* MCQ Questions */}
                      {question.type === "mcq" && question.choices && question.choices.length > 0 && (
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
                      
                      {/* Rating Questions */}
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
                              {rating} - {
                                rating === 1 ? "Poor/Strongly Disagree" :
                                rating === 2 ? "Below Average/Disagree" :
                                rating === 3 ? "Average/Neutral" :
                                rating === 4 ? "Good/Agree" :
                                "Excellent/Strongly Agree"
                              }
                            </label>
                          ))}
                        </div>
                      )}
                      
                      {/* Text/Comment Questions */}
                      {question.type === "comment" && (
                        <textarea
                          name={`question-${index}`}
                          className="textarea textarea-bordered w-full"
                          placeholder="Enter your response..."
                          rows={3}
                          required
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Sticky Footer */}
              <div className="modal-action bottom-0 pt-3">
                <button
                  type="submit"
                  className="btn btn-success text-white"
                >
                  Submit Evaluation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;