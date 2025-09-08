import { useEffect, useState } from "react";

// Option type for comboboxes
interface Option {
  id: number | string;
  name: string;
}
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/16/solid";
import api from "../../../utils/api";
import DataTable, { Column } from "../../../Components/Evaluation Components/Data Table";
import ComboboxTextField from "../../../Components/Resource Components/ComboboxTextField.tsx";
import BreadAndLogout from "../../../Components/Bread and Logout.tsx";
import { resolveFacultyId } from "../../../utils/facultyContext";
import {manilaFilenameTimestamp} from "../../../utils/time";

interface SchedulesProps {
  setActiveView: (view: string) => void;
}

// Define the Schedule Type
interface Schedule {
  id: number;
  section: number;
  section_name?: string;
  subject: number;
  subject_name?: string;
  instructor: number;
  instructor_name?: string;
  room: number;
  room_name?: string;
  program: number;
  program_name?: string;
  name: string;
  start_time: string;
  end_time: string;
  semester: string;
  year: string;
  is_active: boolean;
}

function Schedules({ setActiveView }: SchedulesProps) {
  const [effectiveFacultyId, setEffectiveFacultyId] = useState<number | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Export state + helpers
  const defaultExportName = () => {
    return `schedules_${manilaFilenameTimestamp()}.csv`;
  };
  const [exportFilename, setExportFilename] = useState<string>(defaultExportName());

  const csvEscape = (value: unknown) => {
    const s = String(value ?? "");
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  const buildCSV = (rows: Schedule[]) => {
    const headers = [
      "ID",
      "Title",
      "Program",
      "Section",
      "Subject",
      "Room",
      "Instructor",
      "Start",
      "End",
      "Semester",
      "Year",
      "Status",
    ];
    const lines = [
      headers.join(","),
      ...rows.map((r) =>
        [
          csvEscape(r.id),
          csvEscape(r.name),
          csvEscape(r.program_name ?? r.program ?? ""),
          csvEscape(r.section_name ?? r.section ?? ""),
          csvEscape(r.subject_name ?? r.subject ?? ""),
          csvEscape(r.room_name ?? r.room ?? ""),
          csvEscape(r.instructor_name ?? r.instructor ?? ""),
          csvEscape(r.start_time),
          csvEscape(r.end_time),
          csvEscape(r.semester),
          csvEscape(r.year),
          csvEscape(r.is_active ? "Active" : "Inactive"),
        ].join(",")
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
    if (!schedules?.length) {
      alert("There is no data to export.");
      return;
    }
    const csv = buildCSV(schedules);
    downloadCSV(csv, exportFilename || defaultExportName());
    (document.getElementById("modal_export_schedules") as HTMLDialogElement)?.close();
  };

  // Form state for all required fields
  const [form, setForm] = useState({
    section: "",
    subject: "",
    instructor: "",
    room: "",
    program: "",
    name: "",
    start_time: "",
    end_time: "",
    semester: "",
    year: "",
  });

  // Edit form state
  const [editForm, setEditForm] = useState({
    section: "",
    subject: "",
    instructor: "",
    room: "",
    program: "",
    name: "",
    start_time: "",
    end_time: "",
    semester: "",
    year: "",
  });

  const [selectedProgram, setSelectedProgram] = useState<Option | null>(null);
  const [selectedSection, setSelectedSection] = useState<Option | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Option | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Option | null>(null);
  const [selectedProfessor, setSelectedProfessor] = useState<Option | null>(null);

  // Edit form selections
  const [editSelectedProgram, setEditSelectedProgram] = useState<Option | null>(null);
  const [editSelectedSection, setEditSelectedSection] = useState<Option | null>(null);
  const [editSelectedSubject, setEditSelectedSubject] = useState<Option | null>(null);
  const [editSelectedRoom, setEditSelectedRoom] = useState<Option | null>(null);
  const [editSelectedProfessor, setEditSelectedProfessor] = useState<Option | null>(null);

  const [professorOptions, setProfessorOptions] = useState<Option[]>([]);
  const [editProfessorOptions, setEditProfessorOptions] = useState<Option[]>([]);
  const [currentEditingSchedule, setCurrentEditingSchedule] = useState<Schedule | null>(null);

  // Professor options for create form
  useEffect(() => {
    if (selectedProgram) {
      api
        .get(`/program-professor/program-professors/?program_id=${selectedProgram.id}`)
        .then((res) => {
          setProfessorOptions(
            res.data.map((item: any) => ({
              id: item.professor,
              name: item.professor_details.full_name,
            }))
          );
        });
    } else {
      setProfessorOptions([]);
    }
  }, [selectedProgram]);

  // Professor options for edit form
  useEffect(() => {
    if (editSelectedProgram) {
      api
        .get(`/program-professor/program-professors/?program_id=${editSelectedProgram.id}`)
        .then((res) => {
          setEditProfessorOptions(
            res.data.map((item: any) => ({
              id: item.professor,
              name: item.professor_details.full_name,
            }))
          );
        });
    } else {
      setEditProfessorOptions([]);
    }
  }, [editSelectedProgram]);

  useEffect(() => {
    (async () => {
      const fid = await resolveFacultyId();
      setEffectiveFacultyId(fid ?? null);
    })();
  }, []);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const response = await api.get("/schedule/schedules/", {
        params: {
          name: searchTerm || undefined,
          faculty: effectiveFacultyId ?? undefined,
        },
      });
      setSchedules(response.data);
    } catch (error) {
      console.error("Error fetching schedules:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, effectiveFacultyId]);

  const createSchedule = async () => {
    // Validate required fields
    if (
      !selectedProgram ||
      !selectedSection ||
      !selectedSubject ||
      !selectedRoom ||
      !selectedProfessor ||
      !form.name ||
      !form.start_time ||
      !form.end_time ||
      !form.semester ||
      !form.year
    ) {
      alert("Please fill in all required fields.");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) return alert("You are not authenticated. Please login.");
    try {
      await api.post(
        "/schedule/schedules/",
        {
          program: selectedProgram.id,
          section: selectedSection.id,
          subject: selectedSubject.id,
          room: selectedRoom.id,
          instructor: selectedProfessor.id,
          name: form.name,
          start_time: form.start_time,
          end_time: form.end_time,
          semester: form.semester,
          year: form.year,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { faculty: effectiveFacultyId ?? undefined },
        }
      );
      // Reset form
      setForm({
        section: "",
        subject: "",
        instructor: "",
        room: "",
        program: "",
        name: "",
        start_time: "",
        end_time: "",
        semester: "",
        year: "",
      });
      setSelectedProgram(null);
      setSelectedSection(null);
      setSelectedSubject(null);
      setSelectedRoom(null);
      setSelectedProfessor(null);
      fetchSchedules();
    } catch (error) {
      console.error("Error creating schedule:", error);
    }
  };

  const updateSchedule = async () => {
    if (!currentEditingSchedule) return;

    // Validate required fields
    if (
      !editSelectedProgram ||
      !editSelectedSection ||
      !editSelectedSubject ||
      !editSelectedRoom ||
      !editSelectedProfessor ||
      !editForm.name ||
      !editForm.start_time ||
      !editForm.end_time ||
      !editForm.semester ||
      !editForm.year
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return alert("You are not authenticated. Please login.");

    try {
      await api.patch(
        `/schedule/schedules/${currentEditingSchedule.id}/`,
        {
          program: editSelectedProgram.id,
          section: editSelectedSection.id,
          subject: editSelectedSubject.id,
          room: editSelectedRoom.id,
          instructor: editSelectedProfessor.id,
          name: editForm.name,
          start_time: editForm.start_time,
          end_time: editForm.end_time,
          semester: editForm.semester,
          year: editForm.year,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { faculty: effectiveFacultyId ?? undefined },
        }
      );

      // Reset edit form and close modal
      resetEditForm();
      (document.getElementById("edit_schedule_modal") as HTMLDialogElement)?.close();
      fetchSchedules();
    } catch (error) {
      console.error("Error updating schedule:", error);
      alert("Error updating schedule. Please try again.");
    }
  };

  const resetEditForm = () => {
    setEditForm({
      section: "",
      subject: "",
      instructor: "",
      room: "",
      program: "",
      name: "",
      start_time: "",
      end_time: "",
      semester: "",
      year: "",
    });
    setEditSelectedProgram(null);
    setEditSelectedSection(null);
    setEditSelectedSubject(null);
    setEditSelectedRoom(null);
    setEditSelectedProfessor(null);
    setCurrentEditingSchedule(null);
  };

  const openEditDialog = (schedule: Schedule) => {
    setCurrentEditingSchedule(schedule);

    // Populate edit form with current schedule data
    setEditForm({
      section: schedule.section.toString(),
      subject: schedule.subject.toString(),
      instructor: schedule.instructor.toString(),
      room: schedule.room.toString(),
      program: schedule.program.toString(),
      name: schedule.name,
      start_time: schedule.start_time,
      end_time: schedule.end_time,
      semester: schedule.semester,
      year: schedule.year,
    });

    // Set selected options for comboboxes
    setEditSelectedProgram({
      id: schedule.program,
      name: schedule.program_name || "",
    });
    setEditSelectedSection({
      id: schedule.section,
      name: schedule.section_name || "",
    });
    setEditSelectedSubject({
      id: schedule.subject,
      name: schedule.subject_name || "",
    });
    setEditSelectedRoom({
      id: schedule.room,
      name: schedule.room_name || "",
    });
    setEditSelectedProfessor({
      id: schedule.instructor,
      name: schedule.instructor_name || "",
    });

    // Open the modal
    (document.getElementById("edit_schedule_modal") as HTMLDialogElement)?.showModal();
  };

  const toggleScheduleStatus = async (schedule: Schedule) => {
    try {
      await api.patch(
        `/schedule/schedules/${schedule.id}/`,
        { is_active: !schedule.is_active },
        { params: { faculty: effectiveFacultyId ?? undefined } }
      );
      fetchSchedules();
    } catch (error) {
      console.error("Error updating schedule:", error);
    }
  };

  const deleteSchedule = async (scheduleId: number) => {
    const token = localStorage.getItem("token");
    if (!token) return alert("You are not authenticated. Please login.");

    try {
      await api.delete(`/schedule/schedules/${scheduleId}/`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { faculty: effectiveFacultyId ?? undefined },
      });
      (document.getElementById("delete_schedule_modal") as HTMLDialogElement)?.close();
      fetchSchedules();
    } catch (error) {
      console.error("Error deleting schedule:", error);
      alert("Error deleting schedule. Please try again.");
    }
  };

  const openDeleteDialog = (schedule: Schedule) => {
    setCurrentEditingSchedule(schedule);
    (document.getElementById("delete_schedule_modal") as HTMLDialogElement)?.showModal();
  };

  // Actions column render function
  const scheduleActions = (schedule: Schedule) => (
    <div className="flex flex-col items-start gap-2">
      <button
        title="Edit"
        onClick={() => openEditDialog(schedule)}
        className="flex items-center gap-1 text-sm transition-colors duration-300 hover:text-blue-500 hover:underline"
      >
        <PencilSquareIcon className="h-4 w-4" />
        Edit
      </button>
      <button
        title="Delete"
        onClick={() => openDeleteDialog(schedule)}
        className="flex items-center gap-1 text-sm transition-colors duration-300 hover:text-red-500 hover:underline"
      >
        <TrashIcon className="h-4 w-4" />
        Delete
      </button>
    </div>
  );

  useEffect(() => {
    fetchSchedules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  // Define columns with proper accessors
  const scheduleColumns: Column<Schedule>[] = [
    { header: "Name", accessor: (schedule: Schedule) => schedule.name },
    { header: "Instructor", accessor: (schedule: Schedule) => schedule.instructor_name || "N/A" },
    {
      header: "Status",
      accessor: (schedule: Schedule) => (
        <input
          onClick={() => toggleScheduleStatus(schedule)}
          className="toggle"
          type="checkbox"
          checked={schedule.is_active}
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
          { label: "Schedules" },
        ]}
      />

      <h2 className="mt-4 text-3xl font-bold text-white">Schedules</h2>
      <span className="mx-6 block font-thin text-[#888888]">
        This is where you can coordinate teaching schedules, classrooms, and evaluations to avoid
        conflicts and keep everything running on time.
      </span>

      <div className="flex w-full flex-col items-stretch justify-center gap-3 border-b-2 border-b-gray-600 px-4 pb-2 shadow-xl sm:flex-row sm:justify-between sm:gap-5">
        {/* New Schedule Button */}
        <button
          onClick={() =>
            (document.getElementById("create_new_schedule") as HTMLDialogElement)?.showModal()
          }
          className="w-full rounded-lg bg-[#1c402a] px-5 py-2 whitespace-nowrap text-white shadow-xl transition-transform hover:scale-105 sm:w-auto"
        >
          New Schedule
        </button>

        {/* Edit Schedule Modal */}
        <dialog id="edit_schedule_modal" className="modal">
          <div className="modal-box w-11/12 max-w-5xl">
            <h3 className="mb-4 text-center text-2xl font-bold">Edit Schedule</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (
                  !editSelectedProgram ||
                  !editSelectedSection ||
                  !editSelectedSubject ||
                  !editSelectedRoom ||
                  !editSelectedProfessor ||
                  !editForm.name ||
                  !editForm.start_time ||
                  !editForm.end_time ||
                  !editForm.semester ||
                  !editForm.year
                ) {
                  alert("Please fill in all required fields.");
                  return;
                }
                updateSchedule();
              }}
              className="flex flex-col gap-6"
            >
              {/* Program */}
              <ComboboxTextField
                label="Program"
                placeholder="Enter program"
                fetchUrl="/program/programs/"
                value={editSelectedProgram}
                onChange={setEditSelectedProgram}
              />

              {/* Section */}
              <ComboboxTextField
                label="Section"
                placeholder="Enter section"
                fetchUrl="/section/sections"
                value={editSelectedSection}
                onChange={setEditSelectedSection}
              />

              {/* Subject */}
              <ComboboxTextField
                label="Subject"
                placeholder="Enter subject"
                fetchUrl="/subject/subjects/"
                value={editSelectedSubject}
                onChange={setEditSelectedSubject}
              />

              {/* Room */}
              <ComboboxTextField
                label="Room"
                placeholder="Enter room"
                fetchUrl="/room/rooms/"
                value={editSelectedRoom}
                onChange={setEditSelectedRoom}
              />

              {/* Professor */}
              <ComboboxTextField
                label="Professor"
                placeholder="Enter professor name"
                fetchUrl={`/program-professor/program-professors/?program_id=${editSelectedProgram?.id || ""
                  }`}
                value={editSelectedProfessor}
                onChange={setEditSelectedProfessor}
                mapResponse={(data) =>
                  data.map((item: any) => ({
                    id: item.professor,
                    name: item.professor_details.full_name,
                  }))
                }
              />

              {/* Title */}
              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <label className="text-left text-lg font-bold md:w-1/4">Title:</label>
                <input
                  type="text"
                  placeholder="Enter title"
                  className="input input-bordered w-full"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      name: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              {/* Start Time */}
              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <label className="text-left text-lg font-bold md:w-1/4">Start Time:</label>
                <input
                  type="time"
                  className="input input-bordered w-full"
                  value={editForm.start_time}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      start_time: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              {/* End Time */}
              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <label className="text-left text-lg font-bold md:w-1/4">End Time:</label>
                <input
                  type="time"
                  className="input input-bordered w-full"
                  value={editForm.end_time}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      end_time: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              {/* Semester */}
              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <label className="text-left text-lg font-bold md:w-1/4">Semester:</label>
                <select
                  className="input input-bordered w-full"
                  value={editForm.semester}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      semester: e.target.value,
                    }))
                  }
                  required
                >
                  <option value="">Select semester</option>
                  <option value="First">First Semester</option>
                  <option value="Second">Second Semester</option>
                  <option value="Summer">Summer Semester</option>
                </select>
              </div>

              {/* Year */}
              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <label className="text-left text-lg font-bold md:w-1/4">Year:</label>
                <input
                  type="date"
                  className="input input-bordered w-full"
                  value={editForm.year}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      year: e.target.value,
                    }))
                  }
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
                  onClick={() => {
                    resetEditForm();
                    (document.getElementById("edit_schedule_modal") as HTMLDialogElement)?.close();
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </dialog>

        {/* Delete Schedule Modal */}
        <dialog id="delete_schedule_modal" className="modal">
          <div className="modal-box w-11/12 max-w-md">
            <h3 className="mb-4 text-center text-2xl font-bold">Delete Schedule</h3>
            <p className="mb-6 text-center">
              Are you sure you want to delete the schedule "{currentEditingSchedule?.name}"? This
              action cannot be undone.
            </p>
            <div className="modal-action">
              <button
                onClick={() => {
                  if (currentEditingSchedule) {
                    deleteSchedule(currentEditingSchedule.id);
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
                  setCurrentEditingSchedule(null);
                  (document.getElementById("delete_schedule_modal") as HTMLDialogElement)?.close();
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </dialog>

        <dialog id="create_new_schedule" className="modal">
          <div className="modal-box w-11/12 max-w-5xl">
            <h3 className="mb-4 text-center text-2xl font-bold">Create New Schedule</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (
                  !selectedProgram ||
                  !selectedSection ||
                  !selectedSubject ||
                  !selectedRoom ||
                  !selectedProfessor ||
                  !form.name ||
                  !form.start_time ||
                  !form.end_time ||
                  !form.semester ||
                  !form.year
                ) {
                  alert("Please fill in all required fields.");
                  return;
                }
                createSchedule();
                (document.getElementById("create_new_schedule") as HTMLDialogElement)?.close();
              }}
              className="flex flex-col gap-6"
            >
              {/* Program */}
              <ComboboxTextField
                label="Program"
                placeholder="Enter program"
                fetchUrl="/program/programs/"
                value={selectedProgram}
                onChange={setSelectedProgram}
              />

              {/* Section */}
              <ComboboxTextField
                label="Section"
                placeholder="Enter section"
                fetchUrl="/section/sections"
                value={selectedSection}
                onChange={setSelectedSection}
              />

              {/* Subject */}
              <ComboboxTextField
                label="Subject"
                placeholder="Enter subject"
                fetchUrl="/subject/subjects/"
                value={selectedSubject}
                onChange={setSelectedSubject}
              />

              {/* Room */}
              <ComboboxTextField
                label="Room"
                placeholder="Enter room"
                fetchUrl="/room/rooms/"
                value={selectedRoom}
                onChange={setSelectedRoom}
              />

              {/* Professor */}
              <ComboboxTextField
                label="Professor"
                placeholder="Enter professor name"
                fetchUrl={`/program-professor/program-professors/?program_id=${selectedProgram?.id || ""
                  }`}
                value={selectedProfessor}
                onChange={setSelectedProfessor}
                mapResponse={(data) =>
                  data.map((item: any) => ({
                    id: item.professor,
                    name: item.professor_details.full_name,
                  }))
                }
              />

              {/* Title */}
              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <label className="text-left text-lg font-bold md:w-1/4">Title:</label>
                <input
                  type="text"
                  placeholder="Enter title"
                  className="input input-bordered w-full"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      name: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              {/* Start Time */}
              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <label className="text-left text-lg font-bold md:w-1/4">Start Time:</label>
                <input
                  type="time"
                  className="input input-bordered w-full"
                  value={form.start_time}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      start_time: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              {/* End Time */}
              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <label className="text-left text-lg font-bold md:w-1/4">End Time:</label>
                <input
                  type="time"
                  className="input input-bordered w-full"
                  value={form.end_time}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      end_time: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              {/* Semester */}
              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <label className="text-left text-lg font-bold md:w-1/4">Semester:</label>
                <select
                  className="input input-bordered w-full"
                  value={form.semester}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      semester: e.target.value,
                    }))
                  }
                  required
                >
                  <option value="">Select semester</option>
                  <option value="First">First Semester</option>
                  <option value="Second">Second Semester</option>
                  <option value="Summer">Summer Semester</option>
                </select>
              </div>

              {/* Year */}
              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <label className="text-left text-lg font-bold md:w-1/4">Year:</label>
                <input
                  type="date"
                  className="input input-bordered w-full"
                  value={form.year}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      year: e.target.value,
                    }))
                  }
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
                    (document.getElementById("create_new_schedule") as HTMLDialogElement)?.close()
                  }
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </dialog>

        {/* Export Schedules Button */}
        <div className="flex flex-row justify-center">
          <button
            onClick={() => {
              setExportFilename(defaultExportName()); // refresh timestamp each open
              (document.getElementById("modal_export_schedules") as HTMLDialogElement)?.showModal();
            }}
            className="w-full rounded-lg bg-[#1b2e3e] px-5 py-2 whitespace-nowrap text-white shadow-xl transition-transform hover:scale-105 sm:w-auto"
          >
            Export Schedules
          </button>

          <dialog id="modal_export_schedules" className="modal">
            <div className="modal-box w-11/12 max-w-3xl">
              <h3 className="mb-4 text-center text-2xl font-bold">Export Schedules</h3>

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
                    placeholder="schedules_export.csv"
                    className="input input-bordered w-full"
                    required
                  />
                </div>

                <div className="rounded-lg bg-base-200 p-3 text-sm">
                  This will export the <strong>currently listed schedules</strong> (after search/filter)
                  with columns: ID, Title, Program, Section, Subject, Room, Instructor, Start, End,
                  Semester, Year, Status.
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
                      (document.getElementById("modal_export_schedules") as HTMLDialogElement)?.close()
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
          placeholder="Search by schedule name"
          className="input input-bordered w-full max-w-md"
        />
      </div>

      {/* DataTable */}
      <DataTable
        data={schedules}
        columns={scheduleColumns}
        getRowKey={(schedule) => schedule.id}
        actions={scheduleActions}
        loading={loading}
      />
    </div>
  );
}

export default Schedules;
