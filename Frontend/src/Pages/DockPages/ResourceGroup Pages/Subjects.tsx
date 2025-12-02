import { useEffect, useState } from "react";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/16/solid";
import api from "../../../utils/api";
import DataTable, { Column } from "../../../Components/Evaluation Components/Data Table";
import BreadAndLogout from "../../../Components/Bread and Logout.tsx";
import {manilaFilenameTimestamp} from "../../../utils/time";

interface SubjectsProps {
  setActiveView: (view: string) => void;
}

interface Subject {
  id: number;
  name: string;
  is_active: boolean;
}

function Subjects({ setActiveView }: SubjectsProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [newSubjectName, setNewSubjectName] = useState("");

  // Edit subject state
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [editSubjectName, setEditSubjectName] = useState("");

  // Delete confirmation state
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);

  // Export state
  const defaultExportName = () => {
    return `subjects_${manilaFilenameTimestamp()}.csv`;
  };
  const [exportFilename, setExportFilename] = useState<string>(defaultExportName());

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const response = await api.get("/subject/subjects", {
        params: { name: searchTerm || undefined },
      });
      setSubjects(response.data);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    } finally {
      setLoading(false);
    }
  };

  const createSubject = async () => {
    if (!newSubjectName.trim()) return alert("Please enter a subject name");
    const token = localStorage.getItem("token");
    if (!token) return alert("You are not authenticated. Please login.");
    try {
      await api.post(
        "/subject/subjects/",
        { name: newSubjectName },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setNewSubjectName("");
      fetchSubjects();
    } catch (error) {
      console.error("Error creating subject:", error);
    }
  };

  const toggleSubjectStatus = async (subject: Subject) => {
    try {
      await api.patch(`/subject/subjects/${subject.id}/`, {
        is_active: !subject.is_active,
      });
      fetchSubjects();
    } catch (error) {
      console.error("Error updating subject:", error);
    }
  };

  const deleteSubject = async (subjectId: number) => {
    try {
      await api.delete(`/subject/subjects/${subjectId}/`);
      fetchSubjects();
    } catch (error) {
      console.error("Error deleting subject:", error);
    }
  };

  const updateSubject = async () => {
    if (!editSubjectName.trim()) return alert("Please enter a subject name");
    if (!editingSubject) return;

    const token = localStorage.getItem("token");
    if (!token) return alert("You are not authenticated. Please login.");

    try {
      await api.patch(
        `/subject/subjects/${editingSubject.id}/`,
        { name: editSubjectName },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setEditingSubject(null);
      setEditSubjectName("");
      fetchSubjects();
    } catch (error) {
      console.error("Error updating subject:", error);
    }
  };

  const openEditDialog = (subject: Subject) => {
    setEditingSubject(subject);
    setEditSubjectName(subject.name);
    (document.getElementById("edit_subject") as HTMLDialogElement)?.showModal();
  };

  const closeEditDialog = () => {
    setEditingSubject(null);
    setEditSubjectName("");
    (document.getElementById("edit_subject") as HTMLDialogElement)?.close();
  };

  const openDeleteDialog = (subject: Subject) => {
    setSubjectToDelete(subject);
    (document.getElementById("delete_subject_confirmation") as HTMLDialogElement)?.showModal();
  };

  const closeDeleteDialog = () => {
    setSubjectToDelete(null);
    (document.getElementById("delete_subject_confirmation") as HTMLDialogElement)?.close();
  };

  const confirmDeleteSubject = async () => {
    if (!subjectToDelete) return;

    try {
      await deleteSubject(subjectToDelete.id);
      closeDeleteDialog();
    } catch (error) {
      console.error("Error deleting subject:", error);
    }
  };

  // --- CSV helpers ---
  const csvEscape = (value: unknown) => {
    const s = String(value ?? "");
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  const buildCSV = (rows: Subject[]) => {
    const headers = ["ID", "Name", "Status"];
    const lines = [
      headers.join(","),
      ...rows.map((r) => [csvEscape(r.id), csvEscape(r.name), csvEscape(r.is_active ? "Active" : "Inactive")].join(",")),
    ];
    return lines.join("\n");
  };

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    if (!subjects?.length) {
      alert("There is no data to export.");
      return;
    }
    const csv = buildCSV(subjects);
    downloadCSV(csv, exportFilename || defaultExportName());
    (document.getElementById("modal_export_subjects") as HTMLDialogElement)?.close();
  };

  // Actions column render function
  const subjectActions = (subject: Subject) => (
    <div className="flex flex-col items-start gap-2">
      <button
        title="Edit"
        onClick={() => openEditDialog(subject)}
        className="flex items-center gap-1 text-sm transition-colors duration-300 hover:text-blue-500 hover:underline"
      >
        <PencilSquareIcon className="h-4 w-4" />
        Edit
      </button>
      <button
        title="Delete"
        onClick={() => openDeleteDialog(subject)}
        className="flex items-center gap-1 text-sm transition-colors duration-300 hover:text-red-500 hover:underline"
      >
        <TrashIcon className="h-4 w-4" />
        Delete
      </button>
    </div>
  );

  useEffect(() => {
    fetchSubjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  // Columns
  const subjectColumns: Column<Subject>[] = [
    {
      header: "Name",
      accessor: (subject: Subject) => subject.name,
    },
    {
      header: "Status",
      accessor: (subject: Subject) => (
        <input
          onClick={() => toggleSubjectStatus(subject)}
          className="toggle"
          type="checkbox"
          checked={subject.is_active}
          onChange={() => { }}
        />
      ),
    },
  ];

  return (
    <div className="custom-container gap-y-6">
      <BreadAndLogout
        setActiveView={setActiveView}
        breadcrumbs={[
          { label: "Home", view: "home" },
          { label: "Resource Group" },
          { label: "Subjects" },
        ]}
      />

      <h2 className="mt-4 text-3xl font-bold text-white">Subjects</h2>
      <span className="mx-6 block font-thin text-[#888888]">
        This is where you can keep course and subject details organized so evaluations and reports
        stay accurate. This is where you can access and organize your institution’s
        resources—programs, subjects, rooms, sections, and schedules—so that evaluation and
        classroom management run smoothly.
      </span>

      <div className="flex w-full flex-col items-stretch justify-center gap-3 border-b-2 border-b-gray-600 px-4 pb-2 shadow-xl sm:flex-row sm:justify-between sm:gap-5">
        {/* New Subject Button */}
        <button
          onClick={() =>
            (document.getElementById("create_new_subject") as HTMLDialogElement)?.showModal()
          }
          className="w-full rounded-lg bg-[#1c402a] px-5 py-2 whitespace-nowrap text-white shadow-xl transition-transform hover:scale-105 sm:w-auto"
        >
          New Subject
        </button>

        {/* Create Subject Modal */}
        <dialog id="create_new_subject" className="modal">
          <div className="modal-box w-11/12 max-w-3xl">
            <h3 className="mb-4 text-center text-2xl font-bold">Create New Subject</h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createSubject();
                (document.getElementById("create_new_subject") as HTMLDialogElement)?.close();
              }}
              className="flex flex-col gap-6"
            >
              {/* Subject Name */}
              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <label className="text-left text-lg font-bold md:w-1/6">Name:</label>
                <input
                  type="text"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  placeholder="Enter subject name"
                  className="input input-bordered w-full"
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="modal-action">
                <button type="submit" className="btn btn-success text-white">
                  Submit
                </button>
                <button
                  type="button"
                  className="btn btn-cancel"
                  onClick={() =>
                    (document.getElementById("create_new_subject") as HTMLDialogElement)?.close()
                  }
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </dialog>

        {/* Edit Subject Modal */}
        <dialog id="edit_subject" className="modal">
          <div className="modal-box w-11/12 max-w-3xl">
            <h3 className="mb-4 text-center text-2xl font-bold">Edit Subject</h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateSubject();
                closeEditDialog();
              }}
              className="flex flex-col gap-6"
            >
              {/* Subject Name */}
              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <label className="text-left text-lg font-bold md:w-1/6">Name:</label>
                <input
                  type="text"
                  value={editSubjectName}
                  onChange={(e) => setEditSubjectName(e.target.value)}
                  placeholder="Enter subject name"
                  className="input input-bordered w-full"
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="modal-action">
                <button type="submit" className="btn btn-success text-white">
                  Update
                </button>
                <button
                  type="button"
                  className="btn btn-cancel"
                  onClick={closeEditDialog}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </dialog>

        {/* Delete Subject Confirmation Modal */}
        <dialog id="delete_subject_confirmation" className="modal">
          <div className="modal-box w-11/12 max-w-md">
            <h3 className="mb-4 text-center text-2xl font-bold text-red-600">Confirm Delete</h3>

            <div className="mb-6 text-center">
              <p className="text-lg">Are you sure you want to delete the subject:</p>
              <p className="mt-2 text-xl font-bold text-red-500">
                "{subjectToDelete?.name}"
              </p>
              <p className="mt-2 text-sm text-gray-500">
                This action cannot be undone.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="modal-action justify-center">
              <button 
                onClick={confirmDeleteSubject}
                className="btn btn-error text-white"
              >
                Delete
              </button>
              <button
                type="button"
                className="btn btn-cancel"
                onClick={closeDeleteDialog}
              >
                Cancel
              </button>
            </div>
          </div>
        </dialog>

        <div className="flex flex-row justify-center">
          {/* Export Subjects Button */}
          <button
            onClick={() => {
              setExportFilename(defaultExportName()); // refresh timestamp each open
              (document.getElementById("modal_export_subjects") as HTMLDialogElement)?.showModal();
            }}
            className="w-full rounded-lg bg-[#1b2e3e] px-5 py-2 whitespace-nowrap text-white shadow-xl transition-transform hover:scale-105 sm:w-auto"
          >
            Export Subjects
          </button>

          {/* Export Modal */}
          <dialog id="modal_export_subjects" className="modal">
            <div className="modal-box w-11/12 max-w-3xl">
              <h3 className="mb-4 text-center text-2xl font-bold">Export Subjects</h3>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleExport();
                }}
                className="flex flex-col gap-6"
              >
                {/* Filename Field */}
                <div className="flex flex-col gap-2 md:flex-row md:items-center">
                  <label className="text-left text-lg font-bold md:w-1/4">Filename:</label>
                  <input
                    type="text"
                    value={exportFilename}
                    onChange={(e) => setExportFilename(e.target.value)}
                    placeholder="subjects_export.csv"
                    className="input input-bordered w-full"
                    required
                  />
                </div>

                {/* Info */}
                <div className="rounded-lg bg-base-200 p-3 text-sm">
                  This will export the <strong>currently listed subjects</strong> (after search/filter)
                  with columns: ID, Name, Status.
                </div>

                {/* Action Buttons */}
                <div className="modal-action">
                  <button type="submit" className="btn btn-success text-white">
                    Export
                  </button>
                  <button
                    type="button"
                    className="btn btn-cancel"
                    onClick={() =>
                      (document.getElementById("modal_export_subjects") as HTMLDialogElement)?.close()
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

      {/* Search */}
      <div className="flex w-full items-start justify-center border-b-2 border-b-gray-600 px-4 pb-2 shadow-xl">
        <label htmlFor="search" className="text-lg font-bold text-white"></label>
        <input
          id="search"
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by subject name"
          className="input input-bordered w-full max-w-md"
        />
      </div>

      {/* DataTable */}
      <DataTable
        data={subjects}
        columns={subjectColumns}
        getRowKey={(subject) => subject.id}
        actions={subjectActions}
        loading={loading}
      />
    </div>
  );
}

export default Subjects;
