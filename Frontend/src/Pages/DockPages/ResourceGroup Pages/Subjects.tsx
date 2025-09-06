import { useEffect, useState } from "react";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/16/solid";
import api from "../../../utils/api";
import DataTable, { Column } from "../../../Components/Evaluation Components/Data Table";
import BreadAndLogout from "../../../Components/Bread and Logout.tsx";
// Assuming you have your generic DataTable component exported

interface SubjectsProps {
  setActiveView: (view: string) => void;
}

// Define the Subject Type
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

  // Actions column render function
  const subjectActions = (subject: Subject) => (
    <div className="flex flex-col items-start gap-2">
      <button
        title="Edit"
        onClick={() => alert("Edit feature not implemented yet")}
        className="flex items-center gap-1 text-sm transition-colors duration-300 hover:text-blue-500 hover:underline"
      >
        <PencilSquareIcon className="h-4 w-4" />
        Edit
      </button>
      <button
        title="Delete"
        onClick={() => {
          if (window.confirm(`Delete subject "${subject.name}"?`)) deleteSubject(subject.id);
        }}
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

  // Define columns with proper accessors
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

        <dialog id="create_new_subject" className="modal">
          <div className="modal-box w-11/12 max-w-3xl">
            <h3 className="mb-4 text-center text-2xl font-bold">Create New Subject</h3>

            <form
              onSubmit={(e) => {
                e.preventDefault(); // Prevent default form behavior
                createSubject(); // Call createSubject function
                (document.getElementById("create_new_subject") as HTMLDialogElement)?.close(); // Close the modal
              }}
              className="flex flex-col gap-6"
            >
              {/* Subject Name */}
              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <label className="text-left text-lg font-bold md:w-1/6">Name:</label>
                <input
                  type="text"
                  value={newSubjectName} // Bind value to state
                  onChange={(e) => setNewSubjectName(e.target.value)} // Update value on change
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

        <div className="flex flex-row justify-center">
          {/* Export Subjects Button */}
          <button
            onClick={() =>
              (document.getElementById("modal_export_subjects") as HTMLDialogElement)?.showModal()
            }
            className="w-full rounded-lg bg-[#1b2e3e] px-5 py-2 whitespace-nowrap text-white shadow-xl transition-transform hover:scale-105 sm:w-auto"
          >
            Export Subject
          </button>

          <dialog id="modal_export_subjects" className="modal">
            <div className="modal-box w-11/12 max-w-3xl">
              <h3 className="mb-4 text-center text-2xl font-bold">Export Subject</h3>

              <form method="dialog" className="flex flex-col gap-6">
                {/* Name Field */}
                <div className="flex flex-col gap-2 md:flex-row md:items-center">
                  <label className="text-left text-lg font-bold md:w-1/6">Name:</label>
                  <input
                    type="text"
                    value="Subject A"
                    readOnly
                    className="input input-bordered w-full cursor-not-allowed bg-gray-100"
                  />
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
                      (
                        document.getElementById("modal_export_subjects") as HTMLDialogElement
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
      {/* Search and New Subject button */}
      <div className="flex w-full items-start justify-center border-b-2 border-b-gray-600 px-4 pb-2 shadow-xl">
        <label htmlFor="search" className="text-lg font-bold text-white"></label>
        <input
          id="search"
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)} // Trigger new search
          placeholder="Search by subject name"
          className="input input-bordered w-full max-w-md"
        />
      </div>
      {/* New Subject Modal */}
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

      {/* DataTable */}
      <DataTable
        data={subjects}
        columns={subjectColumns}
        getRowKey={(subject) => subject.name}
        actions={subjectActions}
        loading={loading}
      />
    </div>
  );
}

export default Subjects;
