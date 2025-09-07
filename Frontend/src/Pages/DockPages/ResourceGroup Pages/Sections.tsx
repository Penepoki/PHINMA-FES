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

type StudentOption = {
  id: number;
  name: string;
  first_name?: string;
  last_name?: string;
  email?: string;
};

const toStudentOption = (u: any): StudentOption => {
  const first = String(u.first_name ?? "").trim();
  const last = String(u.last_name ?? "").trim();
  const email = String(u.email ?? "").trim();
  const name =
    String(u.name ?? "").trim() || `${first} ${last}`.trim() || email || `Student #${u.id}`;

  return {
    id: Number(u.id),
    name,
    first_name: first || undefined,
    last_name: last || undefined,
    email: email || undefined,
  };
};

import React, { useState, useEffect } from "react";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/16/solid";
import api from "../../../utils/api";
import DataTable, { Column } from "../../../Components/Evaluation Components/Data Table";
import ComboboxTextField from "../../../Components/Resource Components/ComboboxTextField";
import BreadAndLogout from "../../../Components/Bread and Logout.tsx";
import { resolveFacultyId } from "../../../utils/facultyContext.ts";

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
  const [newSectionName, setNewSectionName] = useState("");
  const [newYearLevel, setNewYearLevel] = useState<Option | null>(null);
  const [newProgram, setNewProgram] = useState<Option | null>(null);
  const [createSelectedStudent, setCreateSelectedStudent] = useState<Option | null>(null);
  const [createStagedStudents, setCreateStagedStudents] = useState<Option[]>([]);

  // Edit dialog state
  const [editSection, setEditSection] = useState<Section | null>(null);
  const [editName, setEditName] = useState<string>("");
  const [editActive, setEditActive] = useState<boolean>(false);
  const [editCurrentStudents, setEditCurrentStudents] = useState<Option[]>([]);
  const [editSelectedStudent, setEditSelectedStudent] = useState<Option | null>(null);
  const [editStagedStudents, setEditStagedStudents] = useState<Option[]>([]);
  const [editYearLevel, setEditYearLevel] = useState<Option | null>(null);
  const [editProgram, setEditProgram] = useState<Option | null>(null);
  const [effectiveFacultyId, setEffectiveFacultyId] = useState<number | null>(null);

  // ------- EXPORT state + helpers -------
  const defaultExportName = () => {
    const pad = (n: number) => String(n).padStart(2, "0");
    const d = new Date();
    return `sections_${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(
      d.getHours()
    )}-${pad(d.getMinutes())}.csv`;
  };
  const [exportFilename, setExportFilename] = useState<string>(defaultExportName());

  const csvEscape = (value: unknown) => {
    const s = String(value ?? "");
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const buildCSV = (rows: Section[]) => {
    const headers = ["ID", "Name", "Status"];
    const lines = [
      headers.join(","),
      ...rows.map((r) =>
        [csvEscape(r.id), csvEscape(r.name), csvEscape(r.is_active ? "Active" : "Inactive")].join(
          ","
        )
      ),
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
    if (!Sections?.length) {
      alert("There is no data to export.");
      return;
    }
    const csv = buildCSV(Sections);
    downloadCSV(csv, exportFilename || defaultExportName());
    (document.getElementById("modal_export_Sections") as HTMLDialogElement)?.close();
  };
  // --------------------------------------

  const YEAR_OPTIONS: Option[] = [
    { id: "1", name: "1st Year" },
    { id: "2", name: "2nd Year" },
    { id: "3", name: "3rd Year" },
    { id: "4", name: "4th Year" },
  ];

  // Resolve the faculty id once on mount
  useEffect(() => {
    (async () => {
      const raw = await resolveFacultyId();
      const fid = raw == null ? null : Number(raw);
      setEffectiveFacultyId(Number.isNaN(fid) ? null : fid);
    })();
  }, []);

  // Fetch Sections
  const fetchSections = async () => {
    setLoading(true);
    try {
      const params: any = { name: searchTerm || undefined };
      if (effectiveFacultyId) params.faculty = effectiveFacultyId;
      const response = await api.get("/section/sections/", { params });
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
  }, [searchTerm, effectiveFacultyId]);

  // Create Section
  const createSection = async () => {
    if (!newYearLevel || !newProgram) {
      alert("Please select Year Level and Program");
      return;
    }
    try {
      const body = {
        name: (newSectionName ?? "").trim() || undefined,
        year_level: String(newYearLevel.id),
        program: Number(newProgram.id),
      };

      const res = await api.post("/section/sections/", body, {
        params: effectiveFacultyId != null ? { faculty: effectiveFacultyId } : undefined,
      });

      const created: Section | undefined = res?.data;
      const sectionId = created?.id;

      if (sectionId && createStagedStudents.length > 0) {
        const ids = createStagedStudents.map((s) => Number(s.id));
        await api.post(
          `/section/sections/${sectionId}/add_students/`,
          { student_ids: ids },
          { params: effectiveFacultyId != null ? { faculty: effectiveFacultyId } : undefined }
        );
      }

      // reset…
      setNewSectionName("");
      setNewYearLevel(null);
      setNewProgram(null);
      setCreateSelectedStudent(null);
      setCreateStagedStudents([]);
      (document.getElementById("create_new_Section") as HTMLDialogElement)?.close();
      fetchSections();
    } catch (error: any) {
      console.error("Error creating Section:", error?.response?.data || error);
      alert(
        "Failed to create section." +
        (error?.response?.data ? `\n\nDetails: ${JSON.stringify(error.response.data)}` : "")
      );
    }
  };

  const toggleSectionstatus = async (Section: Section) => {
    try {
      await api.patch(
        `/section/sections/${Section.id}/`,
        { is_active: !Section.is_active },
        { params: effectiveFacultyId != null ? { faculty: effectiveFacultyId } : undefined }
      );
      fetchSections();
    } catch (error) {
      console.error("Error updating Section:", error);
    }
  };

  const deleteSection = async (SectionId: number) => {
    try {
      await api.delete(`/section/sections/${SectionId}/`, {
        params: effectiveFacultyId != null ? { faculty: effectiveFacultyId } : undefined,
      });
      fetchSections();
    } catch (error) {
      console.error("Error deleting Section:", error);
    }
  };

  // Create modal staging helpers
  const addCreateStudentToBatch = () => {
    if (!createSelectedStudent) return;
    const exists = createStagedStudents.some((s) => s.id === createSelectedStudent.id);
    if (!exists) setCreateStagedStudents((prev) => [...prev, createSelectedStudent]);
    setCreateSelectedStudent(null);
  };
  const removeCreateStudentFromBatch = (id: number | string) => {
    setCreateStagedStudents((prev) => prev.filter((s) => s.id !== id));
  };

  // Edit modal staging helpers
  const addEditStudentToBatch = () => {
    if (!editSelectedStudent) return;
    const exists = editStagedStudents.some((s) => s.id === editSelectedStudent.id);
    if (!exists) setEditStagedStudents((prev) => [...prev, editSelectedStudent]);
    setEditSelectedStudent(null);
  };
  const removeEditStudentFromBatch = (id: number | string) => {
    setEditStagedStudents((prev) => prev.filter((s) => s.id !== id));
  };

  // Open edit dialog
  const openEditDialog = async (section: Section) => {
    setEditSection(section);
    setEditName(section.name);
    setEditActive(section.is_active);
    setEditStagedStudents([]);

    const res = await api.get(`/section/sections/${section.id}/students/`, {
      params: effectiveFacultyId != null ? { faculty: effectiveFacultyId } : undefined,
    });
    const users: any[] = Array.isArray(res.data) ? res.data : [];
    const mapped: Option[] = users.map(toStudentOption);
    setEditCurrentStudents(mapped);

    (document.getElementById("edit_section_modal") as HTMLDialogElement)?.showModal();
  };

  // Submit edit fields
  const submitEditSection = async () => {
    if (!editSection) return;
    try {
      await api.patch(
        `/section/sections/${editSection.id}/`,
        {
          name: editName,
          is_active: editActive,
          year_level: editYearLevel?.id,
          program: editProgram?.id,
        },
        { params: effectiveFacultyId != null ? { faculty: effectiveFacultyId } : undefined }
      );
      (document.getElementById("edit_section_modal") as HTMLDialogElement)?.close();
      setEditSection(null);
      fetchSections();
    } catch (error) {
      console.error("Error updating Section:", error);
    }
  };

  // Submit staged students
  const submitEditStudents = async () => {
    if (!editSection) return;
    if (editStagedStudents.length === 0) {
      alert("No students staged to add.");
      return;
    }
    try {
      const existingIds = new Set(editCurrentStudents.map((s) => Number(s.id)));
      const toAdd = editStagedStudents.filter((s) => !existingIds.has(Number(s.id)));
      if (toAdd.length === 0) {
        alert("All staged students are already in this section.");
        return;
      }
      const ids = toAdd.map((s) => Number(s.id));
      await api.post(
        `/section/sections/${editSection.id}/add_students/`,
        { student_ids: ids },
        { params: effectiveFacultyId != null ? { faculty: effectiveFacultyId } : undefined }
      );
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

  // Helpers for custom tables
  const getFirst = (s: Option) => s.first_name ?? (s.name ? s.name.split(" ")[0] : "-");
  const getLast = (s: Option) =>
    s.last_name ?? (s.name ? s.name.split(" ").slice(1).join(" ") || "-" : "-");
  const getEmail = (s: Option) => s.email ?? "-";

  // Actions column
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

  // Main list columns
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
          { label: "Sections" },
        ]}
      />

      <h2 className="mt-4 text-3xl font-bold text-white">Sections</h2>
      <span className="mx-6 block font-thin text-[#888888]">
        This is where you can organize student sections or cohorts, making sure evaluations are tied
        to the right groups.
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

        {/* CREATE MODAL */}
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

              {/* Year Level */}
              <ComboboxTextField
                label="Year Level"
                placeholder="Select year"
                fetchUrl=""
                options={YEAR_OPTIONS}
                value={newYearLevel}
                onChange={setNewYearLevel}
              />

              {/* Program */}
              <ComboboxTextField
                label="Program"
                placeholder="Search program"
                fetchUrl="/program/programs/"
                value={newProgram}
                onChange={setNewProgram}
                mapResponse={(rows: any[]) =>
                  rows.map((p) => ({ id: p.id, name: p.name, code: p.code }))
                }
              />

              {/* Assign Students (create) */}
              <div className="rounded-lg border-2 border-gray-200 p-4">
                <h4 className="mb-4 text-lg font-semibold text-gray-700">
                  Assign Students (optional)
                </h4>
                <ComboboxTextField
                  label="Student Search"
                  placeholder="Type to search students"
                  fetchUrl="/users/students/"
                  mapResponse={(rows: any[]) => rows.map(toStudentOption)}
                  value={createSelectedStudent}
                  onChange={setCreateSelectedStudent}
                />
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    className="btn btn-primary text-white"
                    onClick={addCreateStudentToBatch}
                  >
                    Add to list
                  </button>
                  <button
                    type="button"
                    className="btn btn-cancel text-white"
                    onClick={() => {
                      setCreateSelectedStudent(null);
                      setCreateStagedStudents([]);
                    }}
                  >
                    Clear
                  </button>
                </div>

                {/* Simple custom table for "Students to Add" */}
                <div className="mt-3 overflow-x-auto">
                  <table className="table w-full">
                    <thead>
                      <tr>
                        <th className="font-semibold">First Name</th>
                        <th className="font-semibold">Last Name</th>
                        <th className="font-semibold">Email</th>
                        <th className="font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {createStagedStudents.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-3 text-center text-gray-500 italic">
                            No students staged.
                          </td>
                        </tr>
                      ) : (
                        createStagedStudents.map((s) => (
                          <tr key={s.id}>
                            <td>{getFirst(s)}</td>
                            <td>{getLast(s)}</td>
                            <td>{getEmail(s)}</td>
                            <td>
                              <button
                                type="button"
                                className="link text-red-600"
                                onClick={() => removeCreateStudentFromBatch(s.id)}
                              >
                                remove
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
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
                  onClick={() =>
                    (document.getElementById("create_new_Section") as HTMLDialogElement)?.close()
                  }
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </dialog>

        {/* Export Button + Modal (upgraded) */}
        <div className="flex flex-row justify-center">
          <button
            onClick={() => {
              setExportFilename(defaultExportName()); // refresh timestamp each open
              (document.getElementById("modal_export_Sections") as HTMLDialogElement)?.showModal();
            }}
            className="w-full rounded-lg bg-[#1b2e3e] px-5 py-2 whitespace-nowrap text-white shadow-xl transition-transform hover:scale-105 sm:w-auto"
          >
            Export Sections
          </button>

          <dialog id="modal_export_Sections" className="modal">
            <div className="modal-box w-11/12 max-w-3xl">
              <h3 className="mb-4 text-center text-2xl font-bold">Export Sections</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleExport();
                }}
                className="flex flex-col gap-6"
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-center">
                  <label className="text-left text-lg font-bold md:w-1/4">Filename:</label>
                  <input
                    type="text"
                    value={exportFilename}
                    onChange={(e) => setExportFilename(e.target.value)}
                    placeholder="sections_export.csv"
                    className="input input-bordered w-full"
                    required
                  />
                </div>
                <div className="rounded-lg bg-base-200 p-3 text-sm">
                  This will export the <strong>currently listed sections</strong> (after search/filter)
                  with columns: ID, Name, Status.
                </div>
                <div className="modal-action">
                  <button type="submit" className="btn btn-success text-white">
                    Export
                  </button>
                  <button
                    type="button"
                    className="btn btn-cancel"
                    onClick={() =>
                      (document.getElementById("modal_export_Sections") as HTMLDialogElement)?.close()
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
          placeholder="Search by Section name"
          className="input input-bordered w-full max-w-md"
        />
      </div>

      {/* EDIT SECTION MODAL */}
      <dialog id="edit_section_modal" className="modal">
        <div className="modal-box max-h-[90vh] w-11/12 max-w-5xl overflow-y-auto">
          <h3 className="mb-4 text-center text-2xl font-bold">Edit Section</h3>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitEditSection();
            }}
            className="flex flex-col gap-6"
          >
            {/* Fields */}
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <label className="text-left text-lg font-bold md:w-1/4">Name:</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="input input-bordered w-full"
                placeholder="Enter Section name"
                required
                autoFocus
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

            {/* Current Section Information */}
            {editSection && (
              <div className="rounded-lg bg-gray-100 p-4">
                <h4 className="mb-2 font-semibold text-gray-700">Current Section Information:</h4>
                <div className="grid grid-cols-1 gap-2 text-sm text-gray-600 md:grid-cols-2">
                  <div>
                    <span className="font-medium">ID:</span> {editSection.id}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>
                    <span className={`ml-1 ${editActive ? "text-green-600" : "text-red-600"}`}>
                      {editActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="md:col-span-2">
                    <span className="font-medium">Original Name:</span> {editSection.name}
                  </div>
                </div>
              </div>
            )}

            {/* Manage Students */}
            <div className="rounded-lg border-2 border-gray-200 p-4">
              <h4 className="mb-4 text-lg font-semibold text-gray-700">Manage Students</h4>

              {/* Currently Assigned */}
              <div className="mb-4">
                <h5 className="mb-2 font-medium text-gray-600">Currently Assigned Students:</h5>
                <div className="overflow-x-auto">
                  <table className="table w-full">
                    <thead>
                      <tr>
                        <th className="font-semibold">First Name</th>
                        <th className="font-semibold">Last Name</th>
                        <th className="font-semibold">Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {editCurrentStudents.length > 0 ? (
                        editCurrentStudents.map((s) => (
                          <tr key={s.id}>
                            <td>{getFirst(s)}</td>
                            <td>{getLast(s)}</td>
                            <td>{getEmail(s)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="py-3 text-center text-gray-500 italic">
                            No students currently assigned
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Add Student */}
              <div>
                <h5 className="mb-2 font-medium text-gray-600">Add Student:</h5>
                <ComboboxTextField
                  label="Student Search"
                  placeholder="Type to search students"
                  fetchUrl="/users/students/"
                  mapResponse={(rows: any[]) => rows.map(toStudentOption)}
                  value={editSelectedStudent}
                  onChange={(s) => setEditSelectedStudent(s)}
                />
                <div className="mt-2">
                  <button
                    type="button"
                    className="btn btn-primary text-white"
                    onClick={() => {
                      if (!editSelectedStudent) return;
                      const alreadyAssigned = editCurrentStudents.some(
                        (s) => Number(s.id) === Number(editSelectedStudent.id)
                      );
                      if (alreadyAssigned) {
                        alert("Student is already in this section.");
                        return;
                      }
                      const alreadyStaged = editStagedStudents.some(
                        (s) => Number(s.id) === Number(editSelectedStudent.id)
                      );
                      if (!alreadyStaged)
                        setEditStagedStudents((prev) => [...prev, editSelectedStudent]);
                      setEditSelectedStudent(null);
                    }}
                  >
                    Add to list
                  </button>
                  <button
                    type="button"
                    className="btn btn-cancel ml-2 text-white"
                    onClick={() => {
                      setEditSelectedStudent(null);
                      setEditStagedStudents([]);
                    }}
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* To be Added */}
              {editStagedStudents.length > 0 && (
                <div className="mt-4">
                  <h5 className="mb-2 font-medium text-green-600">Students to be Added:</h5>
                  <div className="overflow-x-auto">
                    <table className="table w-full">
                      <thead>
                        <tr>
                          <th className="font-semibold">First Name</th>
                          <th className="font-semibold">Last Name</th>
                          <th className="font-semibold">Email</th>
                          <th className="font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {editStagedStudents.map((s) => (
                          <tr key={s.id}>
                            <td>{getFirst(s)}</td>
                            <td>{getLast(s)}</td>
                            <td>{getEmail(s)}</td>
                            <td>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline btn-error"
                                onClick={() => removeEditStudentFromBatch(s.id)}
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-3">
                    <button
                      type="button"
                      className="btn btn-success text-white"
                      onClick={submitEditStudents}
                    >
                      Submit Students
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="modal-action">
              <button type="submit" className="btn btn-success text-white">
                Save Changes
              </button>
              <button type="button" className="btn btn-cancel" onClick={closeEditModal}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </dialog>

      {/* DataTable (main list) */}
      <DataTable
        data={Sections}
        columns={SectionColumns}
        getRowKey={(Section) => Section.id}
        actions={SectionActions}
        loading={loading}
      />
    </div>
  );
}

export default Sections;
