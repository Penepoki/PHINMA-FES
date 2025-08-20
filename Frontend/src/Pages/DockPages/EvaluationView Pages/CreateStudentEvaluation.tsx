import { useEffect, useState } from "react";
import api from "../../../utils/api";
import CreateStudentQuestion, { QuestionData, mapTypeToBackend, mapTypeToFrontend } from "../../../Components/Evaluation Components/CreateStudentQuestion";
import ComboboxTextField from "../../../Components/Resource Components/ComboboxTextField.tsx";
import { PencilSquareIcon } from "@heroicons/react/16/solid";
import BreadAndLogout from "../../../Components/Bread and Logout.tsx";
import DataTable, { Column } from "../../../Components/Evaluation Components/Data Table.tsx"; // <-- NEW

interface CreateStudentEvalProps {
  setActiveView: (view: string) => void;
}
interface Schedule {
  id: number;
  name: string;
  program: number;
  instructor_name: string;
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
  schedule: number | Schedule;
}

function CreateStudentEvaluation({ setActiveView }: CreateStudentEvalProps) {
  const [evaluations, setEvaluations] = useState<StudentEvaluation[]>([]);
  const [evaluationsLoading, setEvaluationsLoading] = useState<boolean>(true); // <-- NEW
  const [form, setForm] = useState({
    schedule: "",
    title: "",
    description: "",
    questions: "",
  });
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [questionToEdit, setQuestionToEdit] = useState<QuestionData | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [isCreateEvalModalOpen, setIsCreateEvalModalOpen] = useState(false);

  // Edit modal state
  const [isEditEvalModalOpen, setIsEditEvalModalOpen] = useState(false);
  const [editEval, setEditEval] = useState<StudentEvaluation | null>(null);
  const [editEvalQuestions, setEditEvalQuestions] = useState<QuestionData[]>([]);
  const [editEvalSchedule, setEditEvalSchedule] = useState<Schedule | null>(null);
  const [editEvalInfo, setEditEvalInfo] = useState<{ title: string; description: string }>({ title: "", description: "" });
  const [editQuestionModalOpen, setEditQuestionModalOpen] = useState(false);
  const [editQuestionToEdit, setEditQuestionToEdit] = useState<QuestionData | null>(null);
  const [editQuestionIndex, setEditQuestionIndex] = useState<number | null>(null);
  const [importedQuestionIds, setImportedQuestionIds] = useState<number[]>([]);
  const [availableQuestions, setAvailableQuestions] = useState<any[]>([]);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importTarget, setImportTarget] = useState<"create" | "edit">("create");
  const [editImportedQuestionIds, setEditImportedQuestionIds] = useState<number[]>([]);
  const [errorAlert, setErrorAlert] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setEvaluationsLoading(true);
    api
      .get("studentevaluation/studentevaluation/")
      .then((res) => {
        if (!mounted) return;
        setEvaluations(res.data);
        setErrorAlert(null);
      })
      .catch((err) => {
        console.error("Error fetching evaluations:", err);
        setErrorAlert("Failed to fetch evaluations. See console for details.");
      })
      .finally(() => {
        if (mounted) setEvaluationsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Fetch schedule for edit modal
  const fetchScheduleById = async (scheduleId: number) => {
    try {
      const res = await api.get(`schedule/schedules/${scheduleId}/`);
      return res.data;
    } catch {
      return null;
    }
  };

  // Open edit modal for an evaluation
  const handleEditEvaluation = async (evalItem: StudentEvaluation) => {
    setEditEval(evalItem);
    setEditEvalInfo({
      title: evalItem.title ?? "",
      description: evalItem.description ?? "",
    });

    // Fetch all available questions from the API (for ID lookup if needed)
    let allAvailableQuestions: any[] = [];
    try {
      const res = await api.get("studentevaluationquestion/studentevaluationquestion/");
      allAvailableQuestions = res.data;
    } catch (err) {
      console.error("Failed to fetch all questions:", err);
    }

    // Determine if import_questions is a list of IDs or objects
    let allQuestions: QuestionData[] = [];
    const importQuestions = evalItem.import_questions || [];
    if (importQuestions.length > 0 && typeof importQuestions[0] === "number") {
      allQuestions = allAvailableQuestions
        .filter((q: any) => importQuestions.includes(q.id))
        .map((q: any) => ({
          question: q.question,
          type: mapTypeToFrontend(q.type),
          choices: q.options || [],
          id: q.id,
        }));
    } else {
      allQuestions = importQuestions.map((q: any) => ({
        question: q.question,
        type: mapTypeToFrontend(q.type),
        choices: q.options || [],
        id: q.id,
      }));
    }

    setQuestions(allQuestions);
    setEditEvalQuestions(allQuestions);

    // Fetch schedule details
    let scheduleObj = typeof evalItem.schedule === "object" ? evalItem.schedule : null;
    if (!scheduleObj && evalItem.schedule) {
      scheduleObj = await fetchScheduleById(Number(evalItem.schedule));
    }
    setEditEvalSchedule(scheduleObj);

    // Set imported question IDs correctly
    setEditImportedQuestionIds(
      importQuestions.length > 0 && typeof importQuestions[0] === "number"
        ? importQuestions
        : importQuestions.map((q: any) => q.id)
    );
    setIsEditEvalModalOpen(true);
  };

  // Import question by linking existing question ID
  const handleImportQuestion = (q: any) => {
    if (importTarget === "create") {
      if (!importedQuestionIds.includes(q.id)) {
        setImportedQuestionIds((ids) => [...ids, q.id]);
        setQuestions((prev) => [
          ...prev,
          {
            question: q.question,
            type: mapTypeToFrontend(q.type),
            choices: q.options || [],
            id: q.id,
          },
        ]);
      }
    } else {
      if (!editImportedQuestionIds.includes(q.id)) {
        setEditImportedQuestionIds((ids) => [...ids, q.id]);
        setEditEvalQuestions((prev) => [
          ...prev,
          {
            question: q.question,
            type: mapTypeToFrontend(q.type),
            choices: q.options || [],
            id: q.id,
          },
        ]);
      }
    }
    setIsImportModalOpen(false);
  };

  // Add/Edit/Delete question in edit modal
  const handleEditEvalAddQuestion = (q: QuestionData) => {
    setEditEvalQuestions((prev) => [...prev, q]);
  };
  const handleEditEvalEditQuestion = (q: QuestionData, idx: number) => {
    setEditEvalQuestions((prev) => prev.map((item, i) => (i === idx ? q : item)));
    setEditQuestionModalOpen(false);
    setEditQuestionToEdit(null);
    setEditQuestionIndex(null);
  };
  const handleEditEvalDeleteQuestion = (idx: number) => {
    setEditEvalQuestions((prev) => prev.filter((_, i) => i !== idx));
    setEditImportedQuestionIds((prev) => prev.filter((_, i) => i !== idx));
  };

  // Save changes to evaluation and questions
  const handleEditEvalSave = async () => {
    if (!editEval) return;
    try {
      const patchPayload = {
        title: editEvalInfo.title,
        description: editEvalInfo.description,
        import_questions: [...editImportedQuestionIds],
      };
      await api.patch(`studentevaluation/studentevaluation/${editEval.id}/`, patchPayload);
      const updatedEval = await api.get(`studentevaluation/studentevaluation/${editEval.id}/`);
      setEditEval(updatedEval.data);

      const mappedQuestions = (updatedEval.data.import_questions || []).map((q: any) => ({
        id: q.id,
        question: q.question,
        type: mapTypeToFrontend(q.type),
        choices: q.options || [],
      }));
      setEditEvalQuestions(mappedQuestions);

      // Refresh table
      setEvaluationsLoading(true);
      const updated = await api.get("studentevaluation/studentevaluation/");
      setEvaluations(updated.data);
      setEvaluationsLoading(false);

      setIsEditEvalModalOpen(false);
      setErrorAlert(null);
    } catch (err: any) {
      console.error("Error updating evaluation:", err);
      setErrorAlert(
        `Error updating evaluation: ${err?.response?.data ? JSON.stringify(err.response.data) : err.message}`
      );
    }
  };

  // --- Creation logic ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleAddQuestion = (data: QuestionData) => {
    setQuestions((prev) => [...prev, data]);
  };

  const handleSubmit = async () => {
    try {
      const evalRes = await api.post("studentevaluation/studentevaluation/", {
        schedule: selectedSchedule?.id,
        title: form.title,
        description: form.description,
      });
      const evaluationId = evalRes.data.id;
      const createdQuestionIds: number[] = [];
      for (const q of questions) {
        if (!q.id) {
          const questionPayload = {
            question: q.question,
            type: mapTypeToBackend(q.type),
            ...(q.type === "mcq" && { options: q.choices }),
          };
          const res = await api.post("studentevaluationquestion/studentevaluationquestion/", questionPayload);
          createdQuestionIds.push(res.data.id);
        } else {
          createdQuestionIds.push(q.id);
        }
      }
      const allQuestionIds = Array.from(new Set([...createdQuestionIds, ...importedQuestionIds]));
      await api.patch(`studentevaluation/studentevaluation/${evaluationId}/`, {
        import_questions: allQuestionIds,
      });

      // Refresh table with skeleton while loading
      setEvaluationsLoading(true);
      const updated = await api.get("studentevaluation/studentevaluation/");
      setEvaluations(updated.data);
      setEvaluationsLoading(false);

      setForm({ schedule: "", title: "", description: "", questions: "" });
      setQuestions([]);
      setImportedQuestionIds([]);
      setIsCreateEvalModalOpen(false);
      setErrorAlert(null);
    } catch (err: any) {
      console.error("Error creating evaluation:", err);
      setErrorAlert(
        `Error creating evaluation: ${err?.response?.data ? JSON.stringify(err.response.data) : err.message}`
      );
    }
  };

  // ----- TABLE COLUMNS (uses DataTable) -----
  const columns: Column<StudentEvaluation>[] = [
    { header: "Evaluation Title", accessor: "title" },
    { header: "Description", accessor: "description", className: "w-[240px]" },
    {
      header: "Questions Imported",
      accessor: (item) => (item.import_questions?.length ?? 0),
    },
  ];

  return (
    <div className="custom-container gap-y-6">
      <BreadAndLogout
        setActiveView={setActiveView}
        breadcrumbs={[
          { label: "Home", view: "home" },
          { label: "Evalustion", view: "evaluation" },
          { label: "Create Student Evaluation" },
        ]}
      />

      <h2 className="mt-4 text-3xl font-bold text-white">Create Student Evaluation</h2>
      <span className="block mb-2 font-thin text-[#888888] mx-6 ">
        This is where you can design and publish evaluation forms that follow the Student Feedback Framework (SFF), ensuring feedback is clear, consistent, and aligned with standards.
      </span>

      <div className="flex w-full items-start justify-center border-b-2 border-b-gray-600 px-4 pb-2 shadow-xl md:justify-start">
        <button
          onClick={() => {
            setIsCreateEvalModalOpen(true);
            setQuestions([]); // Clear questions when opening create dialog
            setImportedQuestionIds([]); // Clear imported question IDs
          }}
          className="flex w-auto whitespace-nowrap rounded-lg bg-[#1c402a] px-5 py-2 text-white shadow-xl transition-transform hover:scale-105"
        >
          Create New Student Evaluation
        </button>
        {isCreateEvalModalOpen && (
          <dialog open className="modal z-[9995]">
            <div className="modal-box w-11/12 max-w-5xl">
              <h3 className="mb-4 text-center text-2xl font-bold">New Student Evaluation</h3>
              <form method="dialog" className="flex flex-col gap-6 ">
                <ComboboxTextField
                  label="Schedule"
                  fetchUrl="schedule/schedules/"
                  value={selectedSchedule}
                  onChange={setSelectedSchedule}
                  mapResponse={(data) => data}
                  placeholder="Search by name or section"
                />

                {selectedSchedule && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Subject</label>
                      <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100" value={selectedSchedule.subject_name || selectedSchedule.subject || ''} disabled />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Section</label>
                      <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100" value={selectedSchedule.section_name || ''} disabled />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Room</label>
                      <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100" value={selectedSchedule.room_name || selectedSchedule.room || ''} disabled />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Semester</label>
                      <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100" value={selectedSchedule.semester || ''} disabled />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Year</label>
                      <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100" value={selectedSchedule.year || ''} disabled />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Instructor</label>
                      <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100" value={selectedSchedule.instructor_name || ''} disabled />
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-2 md:flex-row md:items-center">
                  <label className="text-left text-lg font-bold md:w-1/4">Title:</label>
                  <input
                    type="text"
                    name="title"
                    className="input input-bordered w-full"
                    value={form.title}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="flex flex-col gap-2 md:flex-row md:items-start">
                  <label className="text-left text-lg font-bold md:w-1/4 pt-2">Description:</label>
                  <textarea
                    name="description"
                    className="textarea textarea-bordered w-full"
                    value={form.description}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-left text-lg font-bold">Questions:</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="btn btn-md btn-primary text-white"
                        onClick={() => setIsQuestionModalOpen(true)}
                      >
                        + Add Question
                      </button>
                      <button
                        type="button"
                        className="btn btn-md btn-primary text-white"
                        onClick={async () => {
                          const res = await api.get("studentevaluationquestion/studentevaluationquestion/");
                          setAvailableQuestions(res.data.filter((q: any) => !importedQuestionIds.includes(q.id)));
                          setImportTarget("create");
                          setIsImportModalOpen(true);
                        }}
                      >
                        Import Question
                      </button>
                    </div>
                  </div>

                  <div className="max-h-64 overflow-y-auto overflow-x-auto rounded-lg border border-gray-300">
                    <table className="table w-full">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Question</th>
                          <th>Type</th>
                          <th>Imported?</th>
                        </tr>
                      </thead>
                      <tbody>
                        {questions.map((q, i) => (
                          <tr key={i}>
                            <td>{i + 1}</td>
                            <td>{q.question}</td>
                            <td>{q.type}</td>
                            <td>
                              {q.id ? (
                                <span className="text-blue-500 font-medium">Yes</span>
                              ) : (
                                <span className="text-gray-500">No</span>
                              )}
                            </td>
                          </tr>
                        ))}
                        {questions.length === 0 && (
                          <tr>
                            <td colSpan={4} className="py-6 text-center text-gray-400">
                              No questions yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="modal-action">
                  <button type="button" className="btn btn-success text-white" onClick={handleSubmit}>
                    Submit
                  </button>
                  <button type="button" className="btn btn-cancel" onClick={() => setIsCreateEvalModalOpen(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </dialog>
        )}
      </div>

      {/* Table (with skeleton via loading flag) */}
      <DataTable<StudentEvaluation>
        data={evaluations}
        columns={columns}
        getRowKey={(item) => item.id}
        loading={evaluationsLoading}
        actions={(item) => (
          <button
            className="flex items-center gap-1 text-sm transition-colors duration-300 hover:text-blue-500 hover:underline"
            onClick={() => handleEditEvaluation(item)}
          >
            <PencilSquareIcon className="h-4 w-4" />
            Edit
          </button>
        )}
      />

      {/* Edit Evaluation Modal */}
      {isEditEvalModalOpen && (
        <dialog open className="modal">
          <div className="modal-box w-11/12 max-w-5xl">
            <h3 className="mb-4 text-center text-2xl font-bold">Edit Student Evaluation</h3>
            {editEvalSchedule && (
              <div className="mb-2 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Subject</label>
                  <input type="text" className="w-full rounded border border-gray-300 bg-gray-100 px-3 py-2" value={editEvalSchedule.subject_name || editEvalSchedule.subject || ""} disabled />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Section</label>
                  <input type="text" className="w-full rounded border border-gray-300 bg-gray-100 px-3 py-2" value={editEvalSchedule.section_name || ""} disabled />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Room</label>
                  <input type="text" className="w-full rounded border border-gray-300 bg-gray-100 px-3 py-2" value={editEvalSchedule.room_name || editEvalSchedule.room || ""} disabled />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Semester</label>
                  <input type="text" className="w-full rounded border border-gray-300 bg-gray-100 px-3 py-2" value={editEvalSchedule.semester || ""} disabled />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Year</label>
                  <input type="text" className="w-full rounded border border-gray-300 bg-gray-100 px-3 py-2" value={editEvalSchedule.year || ""} disabled />
                </div>
              </div>
            )}
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <label className="text-left text-lg font-bold md:w-1/4">Title:</label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={editEvalInfo.title || ""}
                onChange={(e) => setEditEvalInfo((info) => ({ ...info, title: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-2 md:flex-row md:items-start">
              <label className="pt-2 text-left text-lg font-bold md:w-1/4">Description:</label>
              <textarea
                className="textarea textarea-bordered w-full"
                value={editEvalInfo.description || ""}
                onChange={(e) => setEditEvalInfo((info) => ({ ...info, description: e.target.value }))}
              />
            </div>
            <div>
              <div className="my-4 flex items-center justify-between">
                <label className="text-lg font-bold">Questions:</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="btn btn-md text-white btn-primary"
                    onClick={() => {
                      setEditQuestionToEdit(null);
                      setEditQuestionIndex(null);
                      setEditQuestionModalOpen(true);
                    }}
                  >
                    + Add Question
                  </button>
                  <button
                    type="button"
                    className="btn btn-md text-white btn-primary"
                    onClick={async () => {
                      const res = await api.get("studentevaluationquestion/studentevaluationquestion/");
                      setAvailableQuestions(res.data.filter((q: any) => !editImportedQuestionIds.includes(q.id)));
                      setImportTarget("edit");
                      setIsImportModalOpen(true);
                    }}
                  >
                    Import Question
                  </button>
                </div>
              </div>

              <div className="max-h-64 overflow-y-auto overflow-x-auto rounded-lg border border-gray-300">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Question</th>
                      <th>Type</th>
                      <th>Imported?</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {editEvalQuestions.map((q, i) => (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td>{q.question}</td>
                        <td>{q.type}</td>
                        <td>{q.id ? <span className="font-medium text-blue-500">Yes</span> : <span className="text-gray-500">No</span>}</td>
                        <td className="space-x-2 text-center">
                          <button
                            className="btn btn-xs text-white btn-primary"
                            onClick={() => {
                              setEditQuestionToEdit(q);
                              setEditQuestionIndex(i);
                              setEditQuestionModalOpen(true);
                            }}
                          >
                            Edit
                          </button>
                          <button className="btn btn-xs btn-error" onClick={() => handleEditEvalDeleteQuestion(i)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {editEvalQuestions.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-gray-400">
                          No questions yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="modal-action">
              <button type="button" className="btn btn-success text-white" onClick={handleEditEvalSave}>
                Save Changes
              </button>
              <button type="button" className="btn btn-cancel" onClick={() => setIsEditEvalModalOpen(false)}>
                Cancel
              </button>
            </div>

            {/* Nested question modal for edit/add */}
            <CreateStudentQuestion
              open={editQuestionModalOpen}
              onClose={() => {
                setEditQuestionModalOpen(false);
                setEditQuestionToEdit(null);
                setEditQuestionIndex(null);
              }}
              onAdd={handleEditEvalAddQuestion}
              onUpdate={handleEditEvalEditQuestion}
              questionToEdit={editQuestionToEdit}
              editIndex={editQuestionIndex}
            />
          </div>
        </dialog>
      )}

      {/* Import Modal (root level, not nested) */}
      {isImportModalOpen && (
        <dialog open className="modal" style={{ zIndex: 9999 }}>
          <div className="modal-box w-11/12 max-w-5xl">
            <h3 className="mb-4 text-center text-2xl font-bold">Import Question</h3>
            <ul>
              {availableQuestions.map((q, idx) => (
                <div key={q.id}>
                  <li className="flex items-center justify-between py-2">
                    <span>{q.question}</span>
                    <button className="btn btn-md text-white btn-primary" onClick={() => handleImportQuestion(q)}>
                      Import
                    </button>
                  </li>
                  {idx < availableQuestions.length - 1 && <hr className="my-2 border-gray-300" />}
                </div>
              ))}
            </ul>
            <button className="btn btn-md btn-cancel text-white mt-4" onClick={() => setIsImportModalOpen(false)}>
              Close
            </button>
          </div>
        </dialog>
      )}

      {/* Question Modal */}
      <CreateStudentQuestion
        open={isQuestionModalOpen}
        onClose={() => {
          setIsQuestionModalOpen(false);
          setQuestionToEdit(null);
          setEditIndex(null);
        }}
        onAdd={handleAddQuestion}
        onUpdate={() => { }}
        questionToEdit={questionToEdit}
        editIndex={editIndex}
      />
    </div>
  );
}

export default CreateStudentEvaluation;
