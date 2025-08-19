// Option type for comboboxes
interface Option {
  id: number | string;
  name: string;
  // NEW: enrich for student rows
  first_name?: string;
  last_name?: string;
  email?: string;
  code?: string; // for program (optional)
}

import React, { useState, useEffect } from "react";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/16/solid";
import api from "../../../utils/api";
import DataTable, { Column } from "../../../Components/Evaluation Components/Data Table";
import ComboboxTextField from "../../../Components/Resource Components/ComboboxTextField";
import BreadAndLogout from "../../../Components/Bread and Logout.tsx";

interface SectionsProps {
  setActiveView: (view: string) => void;
}

// Define the Section Type
interface Section {
  id: number;
  name: string;
  is_active: boolean;
}

function Sections({ setActiveView }: SectionsProps) {
  const [Sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Create dialog state
  const [newSectionName, setNewSectionName] = useState(""); // (optional if backend auto-fills)
  const [newYearLevel, setNewYearLevel] = useState<Option | null>(null);         // NEW
  const [newProgram, setNewProgram] = useState<Option | null>(null);             // NEW
  const [createSelectedStudent, setCreateSelectedStudent] = useState<Option | null>(null);
  const [createStagedStudents, setCreateStagedStudents] = useState<Option[]>([]);

  // Edit dialog state
  const [editSection, setEditSection] = useState<Section | null>(null);
  const [editName, setEditName] = useState<string>("");
  const [editActive, setEditActive] = useState<boolean>(false);
  const [editCurrentStudents, setEditCurrentStudents] = useState<Option[]>([]);
  const [editSelectedStudent, setEditSelectedStudent] = useState<Option | null>(null);
  const [editStagedStudents, setEditStagedStudents] = useState<Option[]>([]);
  const [editYearLevel, setEditYearLevel] = useState<Option | null>(null);       // NEW
  const [editProgram, setEditProgram] = useState<Option | null>(null);           // NEW

  const YEAR_OPTIONS: Option[] = [
    {id: "1", name: "1st Year"},
    {id: "2", name: "2nd Year"},
    {id: "3", name: "3rd Year"},
    {id: "4", name: "4th Year"},
  ];
  const fetchSections = async () => {
    setLoading(true);
    try {
      const response = await api.get("/section/sections", {
        params: { name: searchTerm || undefined },
      });
      setSections(response.data);
    } catch (error) {
      console.error("Error fetching Sections:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const createSection = async () => {
    // If backend auto-fills name, you can drop this check; otherwise keep as fallback
    if (!newYearLevel || !newProgram) return alert("Please select Year Level and Program");

    const token = localStorage.getItem("token");
    if (!token) return alert("You are not authenticated. Please login.");

    try {
      // let backend auto-name based on year/program (as you mentioned)
      const res = await api.post(
        "/section/sections/",
        {
          // name: newSectionName || undefined, // optional if server auto-fills
          year_level: newYearLevel.id,
          program: newProgram.id,
        },
          {headers: {Authorization: `Bearer ${token}`}}
      );

      const created: Section | undefined = res?.data;
      const sectionId = created?.id;

      // bulk add staged students via the existing action
      if (sectionId && createStagedStudents.length > 0) {
        const ids = createStagedStudents.map((s) => Number(s.id));
        await api.post(`/section/sections/${sectionId}/add_students/`, {
          student_ids: ids,
        });
      }

      // reset
      setNewSectionName("");
      setNewYearLevel(null);
      setNewProgram(null);
      setCreateSelectedStudent(null);
      setCreateStagedStudents([]);
      (document.getElementById("create_new_Section") as HTMLDialogElement)?.close();

      fetchSections();
    } catch (error) {
      console.error("Error creating Section:", error);
      alert("Failed to create section.");
    }
  };

  const toggleSectionstatus = async (Section: Section) => {
    try {
      await api.patch(`/section/sections/${Section.id}/`, {
        is_active: !Section.is_active,
      });
      fetchSections();
    } catch (error) {
      console.error("Error updating Section:", error);
    }
  };

  const deleteSection = async (SectionId: number) => {
    try {
      await api.delete(`/section/sections/${SectionId}/`);
      fetchSections();
    } catch (error) {
      console.error("Error deleting Section:", error);
    }
  };

  // Utility: add to staged lists
  const addCreateStudentToBatch = () => {
    if (!createSelectedStudent) return;
    const exists = createStagedStudents.some((s) => s.id === createSelectedStudent.id);
    if (!exists) setCreateStagedStudents((prev) => [...prev, createSelectedStudent]);
    setCreateSelectedStudent(null);
  };
  const removeCreateStudentFromBatch = (id: number | string) => {
    setCreateStagedStudents((prev) => prev.filter((s) => s.id !== id));
  };

  const addEditStudentToBatch = () => {
    if (!editSelectedStudent) return;
    const exists = editStagedStudents.some((s) => s.id === editSelectedStudent.id);
    if (!exists) setEditStagedStudents((prev) => [...prev, editSelectedStudent]);
    setEditSelectedStudent(null);
  };
  const removeEditStudentFromBatch = (id: number | string) => {
    setEditStagedStudents((prev) => prev.filter((s) => s.id !== id));
  };

  // Edit dialog open: fetch current students
  const openEditDialog = async (section: Section) => {
    setEditSection(section);
    setEditName(section.name);
    setEditActive(section.is_active);
    setEditStagedStudents([]);

    try {
      const res = await api.get(`/section/sections/${section.id}/students/`);
      const users: any[] = Array.isArray(res.data) ? res.data : [];
      const mapped: Option[] = users.map((u) => {
        const first = (u.first_name ?? "").toString().trim();
        const last = (u.last_name ?? "").toString().trim();
        const email = (u.email ?? "").toString().trim();
        const name = `${first} ${last}`.trim() || email || `User #${u.id}`;
        return { id: u.id, name };
      });
      setEditCurrentStudents(mapped);
    } catch (e) {
      console.error("Failed to load section students:", e);
      setEditCurrentStudents([]);
    }

    (document.getElementById("edit_section_modal") as HTMLDialogElement)?.showModal();
  };

  // Submit edit of fields only
  const submitEditSection = async () => {
    if (!editSection) return;
    try {
      await api.patch(`/section/sections/${editSection.id}/`, {
        name: editName,                   // optional if server auto-fills; keep if you allow manual rename
        is_active: editActive,
        year_level: editYearLevel?.id,    // NEW
        program: editProgram?.id,         // NEW
      });
      (document.getElementById("edit_section_modal") as HTMLDialogElement)?.close();
      setEditSection(null);
      fetchSections();
    } catch (error) {
      console.error("Error updating Section:", error);
    }
  };

  // Submit staged students for edit dialog
  const submitEditStudents = async () => {
    if (!editSection) return;
    if (editStagedStudents.length === 0) {
      alert("No students staged to add.");
      return;
    }
    try {
      // Filter out IDs already assigned
      const existingIds = new Set(editCurrentStudents.map((s) => Number(s.id)));
      const toAdd = editStagedStudents.filter((s) => !existingIds.has(Number(s.id)));
      if (toAdd.length === 0) {
        alert("All staged students are already in this section.");
        return;
      }
      const ids = toAdd.map((s) => Number(s.id));
      await api.post(`/section/sections/${editSection.id}/add_students/`, {
        student_ids: ids,
      });
      // Merge and clear staged
      setEditCurrentStudents((prev) => [...prev, ...toAdd]);
      setEditStagedStudents([]);
      alert("Students added to section.");
    } catch (e) {
      console.error("Failed to add students:", e);
      alert("Failed to add students to section.");
    }
  };

  const closeEditModal = () => {
    (document.getElementById("edit_section_modal") as HTMLDialogElement)?.close();
    setEditSection(null);
  };

  // Actions column render function
  const SectionActions = (section: Section) => (
    <div className="flex flex-col items-start gap-2">
      <button
        title="Edit"
        onClick={() => openEditDialog(section)}
        className="flex items-center gap-1 text-sm transition-colors duration-300 hover:text-blue-500 hover:underline"
      >
        <PencilSquareIcon className="h-4 w-4" />
        Edit
      </button>
      <button
        title="Delete"
        onClick={() => {
          if (window.confirm(`Delete Section "${section.name}"?`)) deleteSection(section.id);
        }}
        className="flex items-center gap-1 text-sm transition-colors duration-300 hover:text-red-500 hover:underline"
      >
        <TrashIcon className="h-4 w-4" />
        Delete
      </button>
    </div>
  );

  // Define columns with proper accessors
  const SectionColumns: Column<Section>[] = [
    { header: "Name", accessor: (Section: Section) => Section.name },
    {
      header: "Status",
      accessor: (Section: Section) => (
        <input
          onClick={() => toggleSectionstatus(Section)}
          className="toggle"
          type="checkbox"
          checked={Section.is_active}
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
          { label: "Profile View" },
        ]}
      />

      <h2 className="mt-4 text-3xl font-bold text-white">Sections</h2>
      <span className="font-thin text-[#888888] block mb-6">
        This is where you can organize student sections or cohorts, making sure evaluations are tied to the right groups.
      </span>

      <div className="flex w-full flex-col items-stretch justify-center gap-3 border-b-2 border-b-gray-600 px-4 pb-2 shadow-xl sm:flex-row sm:justify-between sm:gap-5">
        {/* New Section Button */}
        <button
          onClick={() =>
            (document.getElementById("create_new_Section") as HTMLDialogElement)?.showModal()
          }
          className="w-full rounded-lg bg-[#1c402a] px-5 py-2 whitespace-nowrap text-white shadow-xl transition-transform hover:scale-105 sm:w-auto"
        >
          New Section
        </button>

        <dialog id="create_new_Section" className="modal">
          <div className="modal-box w-11/12 max-w-3xl">
            <h3 className="mb-4 text-center text-2xl font-bold">Create New Section</h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createSection();
              }}
              className="flex flex-col gap-6"
            >
              {/* Section Name */}
              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <label className="text-left text-lg font-bold md:w-1/4">Name:</label>
                <input
                  type="text"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  placeholder="Enter Section name"
                  className="input input-bordered w-full"
                  required
                />
              </div>
              {/* Year Level (local options; no API call) */}
              <ComboboxTextField
                  label="Year Level"
                  placeholder="Select year"
                  fetchUrl=""                  // empty => won't fetch
                  options={YEAR_OPTIONS}
                  value={newYearLevel}
                  onChange={setNewYearLevel}
              />

              {/* Program (type-ahead from backend) */}
              <ComboboxTextField
                  label="Program"
                  placeholder="Search program"
                  fetchUrl="/program/programs/"  // ProgramViewSet exists in backend
                  value={newProgram}
                  onChange={setNewProgram}
                  mapResponse={(rows: any[]) =>
                      rows.map((p) => ({id: p.id, name: p.name, code: p.code}))
                  }
              />
              {/* Assign Students (create) */}
              <div className="rounded border border-gray-300 p-3">
                <div className="mb-2 text-lg font-bold">Assign Students (optional)</div>
                <ComboboxTextField
                  label="Student Search"
                  placeholder="Type to search students"
                  fetchUrl="/users/students/"
                  value={createSelectedStudent} // or editSelectedStudent in edit dialog
                  onChange={setCreateSelectedStudent}
                  mapResponse={(rows: any[]) =>
                      rows.map((u) => ({
                        id: u.id,
                        name: `${(u.first_name ?? "").trim()} ${(u.last_name ?? "").trim()}`.trim() || u.email || `User #${u.id}`,
                        first_name: u.first_name,
                        last_name: u.last_name,
                        email: u.email,
                      }))
                  }
                />
                <div className="mt-2 flex gap-2">
                  <button type="button" className="btn btn-primary" onClick={addCreateStudentToBatch}>
                    Add to list
                  </button>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => {
                      setCreateSelectedStudent(null);
                      setCreateStagedStudents([]);
                    }}
                  >
                    Clear
                  </button>
                </div>
                <div className="mt-3">
                  <div className="font-semibold">Students to Add:</div>
                  <DataTable
                      data={createStagedStudents}
                      columns={[
                        {header: "First Name", accessor: (s) => s.first_name ?? "-"},
                        {header: "Last Name", accessor: (s) => s.last_name ?? "-"},
                        {header: "Email", accessor: (s) => s.email ?? "-"},
                      ]}
                      getRowKey={(s) => s.id}
                      actions={(s) => (
                          <button
                              type="button"
                              className="text-red-500 underline"
                              onClick={() => removeCreateStudentFromBatch(s.id)}
                          >
                            remove
                          </button>
                      )}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="modal-action">
                <button type="submit" className="btn btn-success text-white">
                  Submit
                </button>
                <button
                  type="button"
                  className="btn btn-cancel"
                  onClick={() => (document.getElementById("create_new_Section") as HTMLDialogElement)?.close()}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </dialog>

        <div className="flex flex-row justify-center">
          {/* Import Sections Button */}
          <button
            onClick={() => (document.getElementById("modal_import_Section") as HTMLDialogElement)?.showModal()}
            className="w-full rounded-lg bg-[#1b2e3e] px-5 py-2 whitespace-nowrap text-white shadow-xl transition-transform hover:scale-105 sm:w-auto"
          >
            Import Section
          </button>

          <dialog id="modal_import_Section" className="modal">
            <div className="modal-box w-11/12 max-w-3xl">
              <h3 className="mb-4 text-center text-2xl font-bold">Import Section</h3>
              <form method="dialog" className="flex flex-col gap-6">
                {/* CSV Upload */}
                <div className="flex flex-col gap-2 md:flex-row md:items-center">
                  <label className="text-left text-lg font-bold md:w-1/6">File:</label>
                  <input type="file" accept=".csv" className="file-input file-input-bordered w-full" required />
                </div>
                {/* Action Buttons */}
                <div className="modal-action">
                  <button type="submit" className="btn btn-success text-white">
                    Upload
                  </button>
                  <button
                    type="button"
                    className="btn btn-cancel"
                    onClick={() => (document.getElementById("modal_import_Section") as HTMLDialogElement)?.close()}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </dialog>

          {/* Export Sections Button */}
          <button
            onClick={() => (document.getElementById("modal_export_Sections") as HTMLDialogElement)?.showModal()}
            className="w-full rounded-lg bg-[#d4c351] px-5 py-2 whitespace-nowrap text-white shadow-xl transition-transform hover:scale-105 sm:w-auto"
          >
            Export Section
          </button>

          <dialog id="modal_export_Sections" className="modal">
            <div className="modal-box w-11/12 max-w-3xl">
              <h3 className="mb-4 text-center text-2xl font-bold">Export Section</h3>
              <form method="dialog" className="flex flex-col gap-6">
                {/* Name Field */}
                <div className="flex flex-col gap-2 md:flex-row md:items-center">
                  <label className="text-left text-lg font-bold md:w-1/6">Name:</label>
                  <input
                    type="text"
                    value="Section A"
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
                    onClick={() => (document.getElementById("modal_export_Sections") as HTMLDialogElement)?.close()}
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
          placeholder="Search by Section name"
          className="input input-bordered w-full max-w-md"
        />
      </div>

      {/* Edit Section Modal (with student assignment) */}
      <dialog id="edit_section_modal" className="modal">
        <div className="modal-box w-11/12 max-w-4xl">
          <h3 className="mb-4 text-center text-2xl font-bold">Edit Section</h3>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <label className="text-left text-lg font-bold md:w-1/4">Name:</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="input input-bordered w-full"
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold">Active:</span>
              <input
                className="toggle"
                type="checkbox"
                checked={editActive}
                onChange={(e) => setEditActive(e.target.checked)}
              />
            </div>

            {/* Edit: Year Level */}
            <ComboboxTextField
                label="Year Level"
                placeholder="Select year"
                fetchUrl=""
                options={YEAR_OPTIONS}
                value={editYearLevel}
                onChange={setEditYearLevel}
            />

            {/* Edit: Program */}
            <ComboboxTextField
                label="Program"
                placeholder="Search program"
                fetchUrl="/program/programs/"
                value={editProgram}
                onChange={setEditProgram}
                mapResponse={(rows: any[]) =>
                    rows.map((p) => ({id: p.id, name: p.name, code: p.code}))
                }
            />

            {/* Current Students */}
            <div className="mt-3">
              <div className="font-semibold">Currently Assigned:</div>
              <DataTable
                  data={editCurrentStudents}
                  columns={[
                    {header: "First Name", accessor: (s) => s.first_name ?? (s.name?.split(" ")[0] ?? "-")},
                    {
                      header: "Last Name",
                      accessor: (s) => s.last_name ?? (s.name?.split(" ").slice(1).join(" ") || "-")
                    },
                    {header: "Email", accessor: (s) => s.email ?? "-"},
                  ]}
                  getRowKey={(s) => s.id}
              />
            </div>

            {/* To Add */}
            <div className="mt-3">
              <div className="font-semibold">To Add:</div>
              <DataTable
                  data={editStagedStudents}
                  columns={[
                    {header: "First Name", accessor: (s) => s.first_name ?? "-"},
                    {header: "Last Name", accessor: (s) => s.last_name ?? "-"},
                    {header: "Email", accessor: (s) => s.email ?? "-"},
                  ]}
                  getRowKey={(s) => s.id}
                  actions={(s) => (
                      <button
                          type="button"
                          className="text-red-500 underline"
                          onClick={() => removeEditStudentFromBatch(s.id)}
                      >
                        remove
                      </button>
                )}
              />

              <div className="mt-3">
                <button type="button" className="btn btn-success text-white" onClick={submitEditStudents}>
                  Submit Students
                </button>
              </div>
            </div>

            <div className="modal-action">
              <button type="button" className="btn btn-success text-white" onClick={submitEditSection}>
                Save
              </button>
              <button type="button" className="btn btn-cancel" onClick={closeEditModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      </dialog>

      {/* DataTable */}
      <DataTable
        data={Sections}
        columns={SectionColumns}
        getRowKey={(Section) => Section.id}
        actions={SectionActions}
        selectable
        loading={loading}
      />
    </div>
  );
}

export default Sections;
