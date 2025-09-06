import { PencilSquareIcon } from "@heroicons/react/16/solid";
import { useEffect, useRef, useState } from "react";
import BreadAndLogout from "../../../Components/Bread and Logout.tsx";
import CreateStudentQuestion, {
  QuestionData,
  mapTypeToBackend,
  mapTypeToFrontend,
} from "../../../Components/Evaluation Components/CreateStudentQuestion";
import DataTable, { Column } from "../../../Components/Evaluation Components/Data Table.tsx";
import ComboboxTextField from "../../../Components/Resource Components/ComboboxTextField.tsx";
import api from "../../../utils/api";

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
  const [evaluationsLoading, setEvaluationsLoading] = useState<boolean>(true);

  // Create flow state
  const [form, setForm] = useState({ schedule: "", title: "", description: "", questions: "" });
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [importedQuestionIds, setImportedQuestionIds] = useState<number[]>([]);
  const [availableQuestions, setAvailableQuestions] = useState<any[]>([]);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);

  // Edit flow state
  const [editEval, setEditEval] = useState<StudentEvaluation | null>(null);
  const [editEvalQuestions, setEditEvalQuestions] = useState<QuestionData[]>([]);
  const [editEvalSchedule, setEditEvalSchedule] = useState<Schedule | null>(null);
  const [editEvalInfo, setEditEvalInfo] = useState<{ title: string; description: string }>({
    title: "",
    description: "",
  });
  const [editQuestionModalOpen, setEditQuestionModalOpen] = useState(false);
  const [editQuestionToEdit, setEditQuestionToEdit] = useState<QuestionData | null>(null);
  const [editQuestionIndex, setEditQuestionIndex] = useState<number | null>(null);
  const [editImportedQuestionIds, setEditImportedQuestionIds] = useState<number[]>([]);

  // Import modal target
  const [importTarget, setImportTarget] = useState<"create" | "edit">("create");

  // Errors
  const [errorAlert, setErrorAlert] = useState<string | null>(null);

  // ---- ALWAYS-MOUNTED MODAL refs ----
  const createModalRef = useRef<HTMLDialogElement>(null);
  const editModalRef = useRef<HTMLDialogElement>(null);
  const importModalRef = useRef<HTMLDialogElement>(null);

  // open/close helpers
  const openCreateModal = () => createModalRef.current?.showModal();
  const closeCreateModal = () => createModalRef.current?.close();

  const openEditModal = () => editModalRef.current?.showModal();
  const closeEditModal = () => editModalRef.current?.close();

  const openImportModal = () => importModalRef.current?.showModal();
  const closeImportModal = () => importModalRef.current?.close();

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
    setEditEvalInfo({ title: evalItem.title ?? "", description: evalItem.description ?? "" });

    // Fetch all available questions
    let allAvailableQuestions: any[] = [];
    try {
      const res = await api.get("studentevaluationquestion/studentevaluationquestion/");
      allAvailableQuestions = res.data;
    } catch (err) {
      console.error("Failed to fetch all questions:", err);
    }

    // Determine questions list
    const importQuestions = evalItem.import_questions || [];
    let allQuestions: QuestionData[] = [];
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
    setQuestions(allQuestions); // if you still need the unified list
    setEditEvalQuestions(allQuestions);

    // Schedule
    let scheduleObj = typeof evalItem.schedule === "object" ? evalItem.schedule : null;
    if (!scheduleObj && evalItem.schedule) {
      scheduleObj = await fetchScheduleById(Number(evalItem.schedule));
    }
    setEditEvalSchedule(scheduleObj);

    // Imported IDs
    setEditImportedQuestionIds(
      importQuestions.length > 0 && typeof importQuestions[0] === "number"
        ? importQuestions
        : importQuestions.map((q: any) => q.id),
    );

    openEditModal();
  };

  // Import question
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
    closeImportModal();
  };

  // Edit modal question ops
  const handleEditEvalAddQuestion = (q: QuestionData) =>
    setEditEvalQuestions((prev) => [...prev, q]);
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

  // Save edit
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

      closeEditModal();
      setErrorAlert(null);
    } catch (err: any) {
      console.error("Error updating evaluation:", err);
      setErrorAlert(
        `Error updating evaluation: ${err?.response?.data ? JSON.stringify(err.response.data) : err.message}`,
      );
    }
  };

  // Create flow
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });
  const handleAddQuestion = (data: QuestionData) => setQuestions((prev) => [...prev, data]);

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
          const res = await api.post(
            "studentevaluationquestion/studentevaluationquestion/",
            questionPayload,
          );
          createdQuestionIds.push(res.data.id);
        } else {
          createdQuestionIds.push(q.id);
        }
      }
      const allQuestionIds = Array.from(new Set([...createdQuestionIds, ...importedQuestionIds]));
      await api.patch(`studentevaluation/studentevaluation/${evaluationId}/`, {
        import_questions: allQuestionIds,
      });

      // Refresh table
      setEvaluationsLoading(true);
      const updated = await api.get("studentevaluation/studentevaluation/");
      setEvaluations(updated.data);
      setEvaluationsLoading(false);

      setForm({ schedule: "", title: "", description: "", questions: "" });
      setQuestions([]);
      setImportedQuestionIds([]);
      closeCreateModal();
      setErrorAlert(null);
    } catch (err: any) {
      console.error("Error creating evaluation:", err);
      setErrorAlert(
        `Error creating evaluation: ${err?.response?.data ? JSON.stringify(err.response.data) : err.message}`,
      );
    }
  };

  // Table
  const columns: Column<StudentEvaluation>[] = [
    { header: "Evaluation Title", accessor: "title" },
    { header: "Description", accessor: "description", className: "w-[240px]" },
    {
      header: "Questions Imported",
      accessor: (item) => item.import_questions?.length ?? 0,
    },
  ];

  return (
    <div className="custom-container gap-y-6">
      <BreadAndLogout
        setActiveView={setActiveView}
        breadcrumbs={[
          { label: "Home", view: "home" },
          { label: "Evaluation", view: "evaluation" },
          { label: "Create Student Evaluation" },
        ]}
      />

      <h2 className="mt-4 text-3xl font-bold text-white">Create Student Evaluation</h2>
      <span className="mx-6 mb-2 block font-thin text-[#888888]">
        This is where you can design and publish evaluation forms that follow the Student Feedback
        Framework (SFF), ensuring feedback is clear, consistent, and aligned with standards.
      </span>

      {/* Top bar */}
      <div className="flex w-full items-start justify-center border-b-2 border-b-gray-600 px-4 pb-2 shadow-xl md:justify-start">
        <button
          onClick={() => {
            setQuestions([]);
            setImportedQuestionIds([]);
            openCreateModal();
          }}
          className="flex w-auto rounded-lg bg-[#1c402a] px-5 py-2 whitespace-nowrap text-white shadow-xl transition-transform hover:scale-105"
          type="button"
        >
          Create New Student Evaluation
        </button>
      </div>

      {/* Table */}
      <DataTable<StudentEvaluation>
        data={evaluations}
        columns={columns}
        getRowKey={(item) => item.id}
        loading={evaluationsLoading}
        actions={(item) => (
          <button
            className="flex items-center gap-1 text-sm transition-colors duration-300 hover:text-blue-500 hover:underline"
            onClick={() => handleEditEvaluation(item)}
            type="button"
          >
            <PencilSquareIcon className="h-4 w-4" />
            Edit
          </button>
        )}
      />

      {/* ===================== ALWAYS-MOUNTED MODALS (DaisyUI) ===================== */}

      {/* Create Evaluation Modal */}
      <dialog ref={createModalRef} className="modal z-[9995]">
        <div className="modal-box w-11/12 max-w-5xl overflow-y-auto">
          <h3 className="mb-4 text-center text-2xl font-bold">New Student Evaluation</h3>

          <div className="flex flex-col gap-6">
            <ComboboxTextField
              label="Schedule"
              fetchUrl="schedule/schedules/"
              value={selectedSchedule}
              onChange={setSelectedSchedule}
              mapResponse={(data) => data}
              placeholder="Search by name or section"
            />

            {selectedSchedule && (
              <div className="mb-2 grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field
                  label="Subject"
                  value={selectedSchedule.subject_name || selectedSchedule.subject || ""}
                />
                <Field label="Section" value={selectedSchedule.section_name || ""} />
                <Field
                  label="Room"
                  value={selectedSchedule.room_name || selectedSchedule.room || ""}
                />
                <Field label="Semester" value={selectedSchedule.semester || ""} />
                <Field label="Year" value={selectedSchedule.year || ""} />
                <Field label="Instructor" value={selectedSchedule.instructor_name || ""} />
              </div>
            )}

            <div className="flex flex-col gap-2 md:flex-row md:items-start">
              <label className="pt-2 text-left text-lg font-bold md:w-1/4">Description:</label>
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
                      const res = await api.get(
                        "studentevaluationquestion/studentevaluationquestion/",
                      );
                      setAvailableQuestions(
                        res.data.filter((q: any) => !importedQuestionIds.includes(q.id)),
                      );
                      setImportTarget("create");
                      openImportModal();
                    }}
                  >
                    Import Question
                  </button>
                </div>
              </div>

              <div className="max-h-64 overflow-x-auto overflow-y-auto rounded-lg border border-gray-300">
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
                            <span className="font-medium text-blue-500">Yes</span>
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
              <button type="button" className="btn btn-cancel" onClick={closeCreateModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>

        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      {/* Edit Evaluation Modal */}
      <dialog ref={editModalRef} className="modal">
        <div className="modal-box w-11/12 max-w-5xl">
          <h3 className="mb-4 text-center text-2xl font-bold">Edit Student Evaluation</h3>

          {editEvalSchedule && (
            <div className="mb-2 grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field
                label="Subject"
                value={editEvalSchedule.subject_name || editEvalSchedule.subject || ""}
              />
              <Field label="Section" value={editEvalSchedule.section_name || ""} />
              <Field
                label="Room"
                value={editEvalSchedule.room_name || editEvalSchedule.room || ""}
              />
              <Field label="Semester" value={editEvalSchedule.semester || ""} />
              <Field label="Year" value={editEvalSchedule.year || ""} />
            </div>
          )}

          <div className="flex flex-col gap-2 md:flex-row md:items-start">
            <label className="pt-2 text-left text-lg font-bold md:w-1/4">Description:</label>
            <textarea
              className="textarea textarea-bordered w-full"
              value={editEvalInfo.description || ""}
              onChange={(e) =>
                setEditEvalInfo((info) => ({ ...info, description: e.target.value }))
              }
            />
          </div>

          <div>
            <div className="my-4 flex items-center justify-between">
              <label className="text-lg font-bold">Questions:</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="btn btn-md btn-primary text-white"
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
                  className="btn btn-md btn-primary text-white"
                  onClick={async () => {
                    const res = await api.get(
                      "studentevaluationquestion/studentevaluationquestion/",
                    );
                    setAvailableQuestions(
                      res.data.filter((q: any) => !editImportedQuestionIds.includes(q.id)),
                    );
                    setImportTarget("edit");
                    openImportModal();
                  }}
                >
                  Import Question
                </button>
              </div>
            </div>

            <div className="max-h-64 overflow-x-auto overflow-y-auto rounded-lg border border-gray-300">
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
                      <td>
                        {q.id ? (
                          <span className="font-medium text-blue-500">Yes</span>
                        ) : (
                          <span className="text-gray-500">No</span>
                        )}
                      </td>
                      <td className="space-x-2 text-center">
                        <button
                          className="btn btn-xs btn-primary text-white"
                          onClick={() => {
                            setEditQuestionToEdit(q);
                            setEditQuestionIndex(i);
                            setEditQuestionModalOpen(true);
                          }}
                          type="button"
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-xs btn-error"
                          onClick={() => handleEditEvalDeleteQuestion(i)}
                          type="button"
                        >
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
            <button
              type="button"
              className="btn btn-success text-white"
              onClick={handleEditEvalSave}
            >
              Save Changes
            </button>
            <button type="button" className="btn btn-cancel" onClick={closeEditModal}>
              Cancel
            </button>
          </div>

          {/* Nested CreateStudentQuestion for EDIT flow */}
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

        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      {/* Import Modal */}
      <dialog ref={importModalRef} className="modal" style={{ zIndex: 9999 }}>
        <div className="modal-box w-11/12 max-w-5xl">
          <h3 className="mb-4 text-center text-2xl font-bold">Import Question</h3>
          <ul>
            {availableQuestions.map((q: any, idx: number) => (
              <div key={q.id}>
                <li className="flex items-center justify-between py-2">
                  <span>{q.question}</span>
                  <button
                    className="btn btn-md btn-primary text-white"
                    onClick={() => handleImportQuestion(q)}
                    type="button"
                  >
                    Import
                  </button>
                </li>
                {idx < availableQuestions.length - 1 && <hr className="my-2 border-gray-300" />}
              </div>
            ))}
          </ul>
          <button
            className="btn btn-md btn-cancel mt-4 text-white"
            onClick={closeImportModal}
            type="button"
          >
            Close
          </button>
        </div>

        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      {/* Question Modal (CREATE flow) – keep at bottom so it isn’t clipped */}
      <CreateStudentQuestion
        open={isQuestionModalOpen}
        onClose={() => {
          // These setters don't exist in create flow, so only close the modal.
          setIsQuestionModalOpen(false);
        }}
        onAdd={handleAddQuestion}
        onUpdate={() => {}}
        questionToEdit={null}
        editIndex={null}
      />
    </div>
  );
}

export default CreateStudentEvaluation;

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        type="text"
        className="w-full rounded border border-gray-300 bg-gray-100 px-3 py-2"
        value={value}
        disabled
        readOnly
      />
    </div>
  );
}
