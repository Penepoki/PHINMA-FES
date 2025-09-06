import { useEffect, useState } from "react";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/16/solid";
import api from "../../../utils/api";
import DataTable, { Column } from "../../../Components/Evaluation Components/Data Table";
import ComboboxTextField from "../../../Components/Resource Components/ComboboxTextField";
import BreadAndLogout from "../../../Components/Bread and Logout.tsx";

interface ProgramProps {
  setActiveView: (view: string) => void;
}

interface Program {
  id: number;
  name: string;
  is_active: boolean;
  professor_names: string[];
}

type ProgramProfessor = {
  program: number;
  professor: number;
  professor_details?: {
    first_name: string;
    last_name: string;
    full_name: string;
  };
  assigned_at: string;
};

function Programs({ setActiveView }: ProgramProps) {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [programProfessors, setProgramProfessors] = useState<ProgramProfessor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [newProgramName, setNewProgramName] = useState("");
  const [comboboxSelectedProfessor, setComboboxSelectedProfessor] = useState<any | null>(null);

  // Edit form state
  const [editProgramName, setEditProgramName] = useState("");
  const [currentEditingProgram, setCurrentEditingProgram] = useState<Program | null>(null);
  const [selectedProfessorsForEdit, setSelectedProfessorsForEdit] = useState<number[]>([]);
  const [currentProgramProfessors, setCurrentProgramProfessors] = useState<ProgramProfessor[]>([]);

  const fetchProgramsandProgramProfessors = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const programResponse = await api.get("/program/programs/", {
        params: { name: searchTerm || undefined },
        headers: { Authorization: `Bearer ${token}` },
      });
      setPrograms(programResponse.data);

      const professorResponse = await api.get("/program-professor/program-professors/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProgramProfessors(professorResponse.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const createProgram = async () => {
    if (!newProgramName.trim()) return;
    alert("Successfully created program:");
    const token = localStorage.getItem("token");
    if (!token) return alert("You are not authenticated. Please login.");

    try {
      await api.post(
        "/program/programs/",
        { name: newProgramName },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setNewProgramName("");
      fetchProgramsandProgramProfessors();
    } catch (error) {
      console.error("Error creating program:", error);
    }
  };

  const updateProgram = async () => {
    if (!currentEditingProgram) return;
    if (!editProgramName.trim()) {
      alert("Please enter a program name.");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) return alert("You are not authenticated. Please login.");

    try {
      await api.patch(
        `/program/programs/${currentEditingProgram.id}/`,
        {
          name: editProgramName,
          professors: selectedProfessorsForEdit,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      resetEditForm();
      (document.getElementById("edit_program_modal") as HTMLDialogElement)?.close();
      fetchProgramsandProgramProfessors();
    } catch (error) {
      console.error("Error updating program:", error);
      alert("Error updating program. Please try again.");
    }
  };

  const resetEditForm = () => {
    setEditProgramName("");
    setCurrentEditingProgram(null);
    setSelectedProfessorsForEdit([]);
    setCurrentProgramProfessors([]);
  };

  const openEditDialog = (program: Program) => {
    setCurrentEditingProgram(program);
    setEditProgramName(program.name);

    const currentProfs = programProfessors.filter((rel) => rel.program === program.id);
    setCurrentProgramProfessors(currentProfs);
    setSelectedProfessorsForEdit(currentProfs.map((rel) => rel.professor));

    (document.getElementById("edit_program_modal") as HTMLDialogElement)?.showModal();
  };

  const toggleProgramStatus = async (program: Program) => {
    if (!program.id) {
      alert("Program ID is missing!");
      return;
    }
    try {
      await api.patch(`/program/programs/${program.id}/`, {
        is_active: !program.is_active,
      });
      fetchProgramsandProgramProfessors();
    } catch (error: any) {
      console.error("Error updating program status:", error.response?.data || error.message);
      alert("Failed to update the program status. Please try again.");
    }
  };

  const deleteProgram = async (programId: number) => {
    const token = localStorage.getItem("token");
    if (!token) return alert("You are not authenticated. Please login.");

    try {
      await api.delete(`/program/programs/${programId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      (document.getElementById("delete_program_modal") as HTMLDialogElement)?.close();
      fetchProgramsandProgramProfessors();
    } catch (error) {
      console.error("Error deleting program:", error);
      alert("Error deleting program. Please try again.");
    }
  };

  const openDeleteDialog = (program: Program) => {
    setCurrentEditingProgram(program);
    (document.getElementById("delete_program_modal") as HTMLDialogElement)?.showModal();
  };

  const programActions = (program: Program) => (
    <div className="flex flex-col items-start gap-2">
      <button
        title="Edit"
        onClick={() => openEditDialog(program)}
        className="flex items-center gap-1 text-sm transition-colors duration-300 hover:text-green-500 hover:underline"
      >
        <PencilSquareIcon className="h-4 w-4" />
        Edit
      </button>
      <button
        title="Delete"
        onClick={() => openDeleteDialog(program)}
        className="flex items-center gap-1 text-sm transition-colors duration-300 hover:text-red-500 hover:underline"
      >
        <TrashIcon className="h-4 w-4" />
        Delete
      </button>
    </div>
  );

  useEffect(() => {
    fetchProgramsandProgramProfessors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const programColumns: Column<Program>[] = [
    {
      header: "Name",
      accessor: "name",
    },
    {
      header: "Status",
      accessor: (program: Program) => (
        <input
          onClick={() => toggleProgramStatus(program)}
          className="toggle"
          type="checkbox"
          checked={program.is_active}
        />
      ),
    },
  ];

  const addProfessorToProgram = (professorId: number) => {
    if (!selectedProfessorsForEdit.includes(professorId)) {
      setSelectedProfessorsForEdit([...selectedProfessorsForEdit, professorId]);
    }
  };

  const removeProfessorFromProgram = (professorId: number) => {
    setSelectedProfessorsForEdit(selectedProfessorsForEdit.filter((id) => id !== professorId));
  };

  return (
    <div className="custom-container gap-y-6">
      {/* Breadcrumbs */}
      <BreadAndLogout
        setActiveView={setActiveView}
        breadcrumbs={[
          { label: "Home", view: "home" },
          { label: "Resource Group" },
          { label: "Programs" },
        ]}
      />

      <h2 className="mt-4 text-3xl font-bold text-white">Programs</h2>
      <span className="mx-6 block font-thin text-[#888888]">
        This is where you can manage academic programs and connect them to the right faculty,
        subjects, and evaluations.
      </span>

      <div className="flex w-full flex-col items-stretch justify-center gap-3 border-b-2 border-b-gray-600 px-4 pb-2 shadow-xl sm:flex-row sm:justify-between sm:gap-5">
        {/* New Program Button */}
        <button
          onClick={() =>
            (document.getElementById("create_new_program") as HTMLDialogElement)?.showModal()
          }
          className="w-full rounded-lg bg-[#1c402a] px-5 py-2 whitespace-nowrap text-white shadow-xl transition-transform hover:scale-105 sm:w-auto"
        >
          New Program
        </button>

        {/* Create Program Modal */}
        <dialog id="create_new_program" className="modal">
          <div className="modal-box w-11/12 max-w-3xl">
            <h3 className="mb-4 text-center text-2xl font-bold">Create New Program</h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createProgram();
                (document.getElementById("create_new_program") as HTMLDialogElement)?.close();
              }}
              className="flex flex-col gap-6"
            >
              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <label className="text-left text-lg font-bold md:w-1/6">Name:</label>
                <input
                  type="text"
                  value={newProgramName}
                  onChange={(e) => setNewProgramName(e.target.value)}
                  placeholder="Enter program name"
                  className="input input-bordered w-full"
                  required
                />
              </div>
              <div className="modal-action">
                <button type="submit" className="btn btn-success text-white">
                  Submit
                </button>
                <button
                  type="button"
                  className="btn btn-cancel"
                  onClick={() =>
                    (document.getElementById("create_new_program") as HTMLDialogElement)?.close()
                  }
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </dialog>

        {/* Enhanced Edit Program Modal */}
        <dialog id="edit_program_modal" className="modal">
          <div className="modal-box max-h-[90vh] w-11/12 max-w-5xl overflow-y-auto">
            <h3 className="mb-4 text-center text-2xl font-bold">Edit Program</h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!editProgramName.trim()) {
                  alert("Please enter a program name.");
                  return;
                }
                updateProgram();
              }}
              className="flex flex-col gap-6"
            >
              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <label className="text-left text-lg font-bold md:w-1/4">Program Name:</label>
                <input
                  type="text"
                  value={editProgramName}
                  onChange={(e) => setEditProgramName(e.target.value)}
                  placeholder="Enter program name"
                  className="input input-bordered w-full"
                  required
                  autoFocus
                />
              </div>

              {currentEditingProgram && (
                <div className="rounded-lg bg-gray-100 p-4">
                  <h4 className="mb-2 font-semibold text-gray-700">Current Program Information:</h4>
                  <div className="grid grid-cols-1 gap-2 text-sm text-gray-600 md:grid-cols-2">
                    <div>
                      <span className="font-medium">ID:</span> {currentEditingProgram.id}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span>
                      <span
                        className={`ml-1 ${currentEditingProgram.is_active ? "text-green-600" : "text-red-600"}`}
                      >
                        {currentEditingProgram.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="md:col-span-2">
                      <span className="font-medium">Original Name:</span>{" "}
                      {currentEditingProgram.name}
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-lg border-2 border-gray-200 p-4">
                <h4 className="mb-4 text-lg font-semibold text-gray-700">Manage Professors</h4>

                <div className="mb-4">
                  <h5 className="mb-2 font-medium text-gray-600">Currently Assigned Professors:</h5>
                  {currentProgramProfessors.length > 0 ? (
                    <div className="space-y-2">
                      {currentProgramProfessors.map((rel) => (
                        <div
                          key={rel.professor}
                          className="flex items-center justify-between rounded bg-blue-50 p-2"
                        >
                          <span className="text-sm">
                            {rel.professor_details?.full_name || `Professor ID: ${rel.professor}`}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeProfessorFromProgram(rel.professor)}
                            className="btn btn-sm btn-error text-white"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No professors currently assigned</p>
                  )}
                </div>

                <div>
                  <h5 className="mb-2 font-medium text-gray-600">Add Professor:</h5>

                  <ComboboxTextField
                    label="Add new Professor:"
                    placeholder="Enter professor name"
                    fetchUrl="/users/professors/"
                    value={comboboxSelectedProfessor}
                    onChange={(prof) => {
                      if (prof && prof.id && !selectedProfessorsForEdit.includes(prof.id)) {
                        addProfessorToProgram(prof.id);
                        setComboboxSelectedProfessor(null);
                      }
                    }}
                    mapResponse={(data) => data.map((p) => ({ id: p.id, name: p.full_name }))}
                    skeletonCount={5}
                  />
                </div>

                {selectedProfessorsForEdit.length > currentProgramProfessors.length && (
                  <div className="mt-4">
                    <h5 className="mb-2 font-medium text-green-600">Professors to be Added:</h5>
                    <div className="space-y-2">
                      {selectedProfessorsForEdit
                        .filter(
                          (profId) =>
                            !currentProgramProfessors.some((rel) => rel.professor === profId),
                        )
                        .map((professorId) => (
                          <div
                            key={professorId}
                            className="flex items-center justify-between rounded bg-green-50 p-2"
                          >
                            <span className="text-sm">{`Professor ID: ${professorId}`}</span>
                            <button
                              type="button"
                              onClick={() => removeProfessorFromProgram(professorId)}
                              className="btn btn-sm btn-outline btn-error"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {currentProgramProfessors.some(
                  (rel) => !selectedProfessorsForEdit.includes(rel.professor),
                ) && (
                  <div className="mt-4">
                    <h5 className="mb-2 font-medium text-red-600">Professors to be Removed:</h5>
                    <div className="space-y-2">
                      {currentProgramProfessors
                        .filter((rel) => !selectedProfessorsForEdit.includes(rel.professor))
                        .map((rel) => (
                          <div
                            key={rel.professor}
                            className="flex items-center justify-between rounded bg-red-50 p-2"
                          >
                            <span className="text-sm">
                              {rel.professor_details?.full_name || `Professor ID: ${rel.professor}`}
                            </span>
                            <button
                              type="button"
                              onClick={() => addProfessorToProgram(rel.professor)}
                              className="btn btn-sm btn-outline btn-success"
                            >
                              Keep
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-action">
                <button
                  type="submit"
                  className="btn btn-success text-white"
                  disabled={!editProgramName.trim()}
                >
                  Update Program
                </button>
                <button
                  type="button"
                  className="btn btn-cancel"
                  onClick={() => {
                    resetEditForm();
                    (document.getElementById("edit_program_modal") as HTMLDialogElement)?.close();
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </dialog>

        {/* Delete Program Modal */}
        <dialog id="delete_program_modal" className="modal">
          <div className="modal-box w-11/12 max-w-md">
            <h3 className="mb-4 text-center text-2xl font-bold">Delete Program</h3>
            <p className="mb-6 text-center">
              Are you sure you want to delete the program "{currentEditingProgram?.name}"? This
              action cannot be undone.
            </p>
            <div className="modal-action">
              <button
                onClick={() => {
                  if (currentEditingProgram) {
                    deleteProgram(currentEditingProgram.id);
                  }
                }}
                className="btn btn-error text-white"
              >
                Delete
              </button>
              <button
                type="button"
                className="btn btn-cancel"
                onClick={() => {
                  setCurrentEditingProgram(null);
                  (document.getElementById("delete_program_modal") as HTMLDialogElement)?.close();
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </dialog>

        <div className="flex flex-row justify-center">
          {/* Export Programs Button */}
          <button
            onClick={() =>
              (document.getElementById("modal_export_programs") as HTMLDialogElement)?.showModal()
            }
            className="w-full rounded-lg bg-[#1b2e3e] px-5 py-2 whitespace-nowrap text-white shadow-xl transition-transform hover:scale-105 sm:w-auto"
          >
            Export Program
          </button>

          <dialog id="modal_export_programs" className="modal">
            <div className="modal-box w-11/12 max-w-3xl">
              <h3 className="mb-4 text-center text-2xl font-bold">Export Program</h3>

              <form method="dialog" className="flex flex-col gap-6">
                <div className="flex flex-col gap-2 md:flex-row md:items-center">
                  <label className="text-left text-lg font-bold md:w-1/6">Name:</label>
                  <input
                    type="text"
                    value="Program A"
                    readOnly
                    className="input input-bordered w-full cursor-not-allowed bg-gray-100"
                  />
                </div>
                <div className="modal-action">
                  <button type="submit" className="btn btn-success text-white">
                    Export
                  </button>
                  <button
                    type="button"
                    className="btn btn-cancel"
                    onClick={() =>
                      (
                        document.getElementById("modal_export_programs") as HTMLDialogElement
                      )?.close()
                    }
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </dialog>
        </div>
      </div>
      <div className="flex w-full items-start justify-center border-b-2 border-b-gray-600 px-4 pb-2 shadow-xl">
        <label htmlFor="search" className="text-lg font-bold text-white"></label>
        <input
          id="search"
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by program name"
          className="input input-bordered w-full max-w-md"
        />
      </div>
      <DataTable
        data={programs}
        columns={programColumns}
        getRowKey={(program) => program.id}
        actions={programActions}
        loading={loading}
      />
    </div>
  );
}
export default Programs;
