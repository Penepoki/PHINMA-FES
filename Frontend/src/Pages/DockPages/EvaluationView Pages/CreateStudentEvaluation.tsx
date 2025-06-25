import { useEffect, useState } from "react";
import StudentEvaluationRow from "../../../Components/Evaluation Components/Student Evaluation Row";
import api from "../../../utils/api";
import CreateStudentQuestion, { QuestionData } from "../../../Components/Evaluation Components/CreateStudentQuestion";
import ComboboxTextField from "../../../Components/Resource Components/ComboboxTextField.tsx";

interface CreateStudentEvalProps {
  setActiveView: (view: string) => void;
}
interface Schedule {
	id: number;
	name: string;
	program: number;
	instructor: number;
	subject: string;
	room: string;
	semester: string;
	year: string;
	section_name?: string;
	subject_name?: string;
	room_name?: string;
	program_name?: string;
	start_time?: string;
	end_time?: string;
}

interface StudentEvaluation {
  id: number;
  title: string;
  description: string;
  import_questions: any[];
}

function CreateStudentEvaluation({ setActiveView }: CreateStudentEvalProps) {
  const [evaluations, setEvaluations] = useState<StudentEvaluation[]>([]);
  const [form, setForm] = useState({
    schedule: "",
    title: "",
    description: "",


  });
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [questionToEdit, setQuestionToEdit] = useState<QuestionData | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(
		null,
	);

  useEffect(() => {
    api.get("studentevaluation/studentevaluation/")
      .then((res) => setEvaluations(res.data))
      .catch((err) => console.error("Error fetching evaluations:", err));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddQuestion = (data: QuestionData) => {
    setQuestions((prev) => [...prev, data]);
  };

  const handleEditClick = (evalIdx: number) => {
    const evalItem = evaluations[evalIdx];
    const firstQuestion = evalItem.import_questions?.[0];
    if (!firstQuestion) return;

    setQuestionToEdit(firstQuestion);
    setEditIndex(evalIdx);
    setIsQuestionModalOpen(true);
  };
  const handleUpdate = (updated: QuestionData, index: number) => {
    // Update logic to update the question in evaluations[index]
    console.log("Updated question at", index, ":", updated);
    setIsQuestionModalOpen(false);
  };

  const handleSubmit = async () => {
    try {
      const evalRes = await api.post("studentevaluation/studentevaluation/", {
        schedule: selectedSchedule?.id,  // use ID, not form.schedule
        title: form.title,
        description: form.description,
      });

      const evaluationId = evalRes.data.id;

      for (const q of questions) {
        await api.post("studentevaluationquestion/studentevaluationquestion/", {
          student_evaluation: evaluationId,
          question: q.question,
          type: q.type.toUpperCase(),
        });
      }

      const updated = await api.get("studentevaluation/studentevaluation/");
      setEvaluations(updated.data);

      (document.getElementById("create_student_eval") as HTMLDialogElement).close();
      setForm({ schedule: "", title: "", description: "" });
      setQuestions([]);
    } catch (err) {
      console.error("Error creating evaluation:", err);
    }
  };

  return (
    <div className="custom-container gap-y-6">
      <div className="breadcrumbs">
        <ul>
          <li><a onClick={() => setActiveView("home")}>Home</a></li>
          <li><a onClick={() => setActiveView("evaluation")}>Evaluation</a></li>
          <li>Create Student Evaluations</li>
        </ul>
      </div>

      <h2 className="mt-4 text-3xl font-bold text-white">Create Student Evaluation</h2>

      <div className="flex w-full items-start justify-center border-b-2 border-b-gray-600 px-4 pb-2 shadow-xl md:justify-start">
        <button
          onClick={() => (document.getElementById("create_student_eval") as HTMLDialogElement).showModal()}
          className="flex w-auto rounded-lg bg-[#1c402a] px-5 py-2 whitespace-nowrap text-white shadow-xl transition-transform hover:scale-105"
        >
          Create New Student Evaluation
        </button>

        <dialog id="create_student_eval" className="modal">
          <div className="modal-box w-11/12 max-w-5xl">
            <h3 className="mb-4 text-center text-2xl font-bold">New Student Evaluation</h3>

            <form method="dialog" className="flex flex-col gap-6">
              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <label className="text-lg font-bold md:w-1/4">Schedule:</label>
                <ComboboxTextField
                  label="Schedule"
                  fetchUrl="schedule/schedules/"
                  value={selectedSchedule}
                  onChange={setSelectedSchedule}
                  mapResponse={(data) => data.map((item) => ({ id: item.id, name: item.name }))}
                  placeholder="Search by name or section"
                />
              </div>

              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <label className="text-lg font-bold md:w-1/4">Title:</label>
                <input type="text" name="title" className="input input-bordered w-full"
                  value={form.title} onChange={handleChange} required />
              </div>

              <div className="flex flex-col gap-2 md:flex-row md:items-start">
                <label className="text-lg font-bold md:w-1/4 pt-2">Description:</label>
                <textarea name="description" className="textarea textarea-bordered w-full"
                  value={form.description} onChange={handleChange} required />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-lg font-bold">Questions:</label>
                  <button type="button" className="btn btn-sm btn-accent" onClick={() => setIsQuestionModalOpen(true)}>
                    + Add Question
                  </button>
                </div>
                <ul className="list-disc list-inside text-gray-200">
                  {questions.map((q, i) => (
                    <li key={i}>{q.question} ({q.type})</li>
                  ))}
                </ul>
              </div>

              <div className="modal-action">
                <button type="button" className="btn btn-success text-white" onClick={handleSubmit}>
                  Submit
                </button>
                <button type="button" className="btn btn-cancel"
                  onClick={() => (document.getElementById("create_student_eval") as HTMLDialogElement).close()}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </dialog>
      </div>

      <div className="w-full overflow-x-auto text-white shadow-xl backdrop-blur-lg">
        <table className="table">
          <thead className="bg-[#1c402a]/50 text-xl font-bold">
            <tr>
              <th></th>
              <th>Evaluation Title</th>
              <th>Description</th>
              <th>Questions Imported</th>
            </tr>
          </thead>
          <tbody className="text-lg text-gray-300">
            {evaluations.map((evaluation, index) => (
              <tr key={evaluation.id}>
                <td>{index + 1}</td>
                <td>{evaluation.title}</td>
                <td>{evaluation.description}</td>
                <td>{evaluation.import_questions?.length ?? 0}</td>
                <td>
                <button className="btn btn-sm btn-primary" onClick={() => handleEditClick(index)}>
                  ✏️ Edit First Question
                </button>
              </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

       <CreateStudentQuestion
        open={isQuestionModalOpen}
        onClose={() => {
          setIsQuestionModalOpen(false);
          setQuestionToEdit(null);
          setEditIndex(null);
        }}
        onAdd={handleAddQuestion}
        onUpdate={handleUpdate}
        questionToEdit={questionToEdit}
        editIndex={editIndex}
      />
    </div>
  );
}

export default CreateStudentEvaluation;
