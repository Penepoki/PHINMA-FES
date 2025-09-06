import React, { useEffect, useMemo, useState } from "react";
import api from "../../../utils/api";
import BreadAndLogout from "../../../Components/Bread and Logout.tsx";
import DataTable, { Column } from "../../../Components/Evaluation Components/Data Table";
import { resolveFacultyId } from "../../../utils/facultyContext";

interface ProfessorsProps {
  setActiveView: (view: string) => void;
}

interface ProfessorRow {
  id: number;
  full_name: string;
  email?: string;
}

function Professors({ setActiveView }: ProfessorsProps) {
  // ----- page state -----
  const [rows, setRows] = useState<ProfessorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [effectiveFacultyId, setEffectiveFacultyId] = useState<number | null>(null);

  // ----- dialog + form state -----
  const [currentEditing, setCurrentEditing] = useState<ProfessorRow | null>(null);

  const [createForm, setCreateForm] = useState({
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    roles: [] as string[],
  });

  const [editForm, setEditForm] = useState({
    first_name: "",
    last_name: "",
    roles: [] as string[],
  });

  const isHR = useMemo(() => localStorage.getItem("isTempFaculty") === "true", []);

  // ----- effects -----
  useEffect(() => {
    (async () => {
      const fid = await resolveFacultyId();
      setEffectiveFacultyId(fid ?? null);
    })();
  }, []);

  useEffect(() => {
    fetchProfessors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, isHR, effectiveFacultyId]);

  // ----- data -----
  const fetchProfessors = async () => {
    if (!isHR) return;
    setLoading(true);
    try {
      // Backend already scopes by current (or temp) faculty
      const res = await api.get("/users/professors/", {
        params: searchTerm.trim() ? { search: searchTerm.trim() } : undefined,
      });
      const mapped: ProfessorRow[] = (res.data || []).map((u: any) => ({
        id: Number(u.id),
        full_name:
          u.full_name ||
          u.name ||
          `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim() ||
          `Professor #${u.id}`,
        email: u.email,
      }));
      // Deduplicate
      const uniq = new Map<number, ProfessorRow>();
      for (const r of mapped) uniq.set(r.id, r);
      setRows(Array.from(uniq.values()));
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  // ----- create -----
  const resetCreateForm = () =>
    setCreateForm({ email: "", first_name: "", last_name: "", password: "", roles: [] });

  const openCreateDialog = () => {
    resetCreateForm();
    (document.getElementById("create_prof_modal") as HTMLDialogElement)?.showModal();
  };

  const createProfessor = async () => {
    const token = localStorage.getItem("token");
    if (!token) return alert("You are not authenticated. Please login.");

    try {
      await api.post(
        `/admin/users/`,
        {
          email: createForm.email,
          first_name: createForm.first_name,
          last_name: createForm.last_name,
          password: createForm.password || undefined,
          roles: createForm.roles,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      (document.getElementById("create_prof_modal") as HTMLDialogElement)?.close();
      resetCreateForm();
      fetchProfessors();
    } catch (error) {
      console.error("Error creating professor:", error);
      alert("Error creating user. Please try again.");
    }
  };

  // ----- edit -----
  const resetEditForm = () => setEditForm({ first_name: "", last_name: "", roles: [] });

  const openEditDialog = async (row: ProfessorRow) => {
    setCurrentEditing(row);
    try {
      const res = await api.get(`/admin/users/${row.id}/`);
      const data = res.data;
      setEditForm({
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        roles: (data.roles_read || []) as string[],
      });
      (document.getElementById("edit_prof_modal") as HTMLDialogElement)?.showModal();
    } catch (e) {
      console.error(e);
      alert("Failed to load user details.");
    }
  };

  const updateProfessor = async () => {
    if (!currentEditing) return;
    const token = localStorage.getItem("token");
    if (!token) return alert("You are not authenticated. Please login.");

    try {
      await api.put(
        `/admin/users/${currentEditing.id}/`,
        {
          first_name: editForm.first_name,
          last_name: editForm.last_name,
          roles: editForm.roles,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      resetEditForm();
      setCurrentEditing(null);
      (document.getElementById("edit_prof_modal") as HTMLDialogElement)?.close();
      fetchProfessors();
    } catch (error) {
      console.error("Error updating professor:", error);
      alert("Error updating user. Please try again.");
    }
  };

  // ----- delete -----
  const openDeleteDialog = (row: ProfessorRow) => {
    setCurrentEditing(row);
    (document.getElementById("delete_prof_modal") as HTMLDialogElement)?.showModal();
  };

  const deleteProfessor = async (id: number) => {
    const token = localStorage.getItem("token");
    if (!token) return alert("You are not authenticated. Please login.");

    try {
      await api.delete(`/admin/users/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      (document.getElementById("delete_prof_modal") as HTMLDialogElement)?.close();
      setCurrentEditing(null);
      fetchProfessors();
    } catch (error) {
      console.error("Error deleting professor:", error);
      alert("Error deleting user. Please try again.");
    }
  };

  // ----- columns + actions -----
  const columns: Column<ProfessorRow>[] = [
    { header: "Name", accessor: (r) => r.full_name },
    { header: "Email", accessor: (r) => r.email || "—" },
  ];

  const actions = (r: ProfessorRow) => (
    <div className="flex flex-col items-start gap-2">
      <button
        title="Edit"
        onClick={() => openEditDialog(r)}
        className="flex items-center gap-1 text-sm transition-colors duration-300 hover:text-blue-500 hover:underline"
      >
        Edit
      </button>
      <button
        title="Delete"
        onClick={() => openDeleteDialog(r)}
        className="flex items-center gap-1 text-sm transition-colors duration-300 hover:text-red-500 hover:underline"
      >
        Delete
      </button>
    </div>
  );

  if (!isHR) {
    return (
      <div className="custom-container">
        <BreadAndLogout
          setActiveView={setActiveView}
          breadcrumbs={[
            { label: "Home", view: "home" },
            { label: "Resource Group" },
            { label: "Professors" },
          ]}
        />
        <div className="mt-6 text-white">This page is restricted to HR users.</div>
      </div>
    );
  }

  return (
    <div className="custom-container gap-y-6">
      <BreadAndLogout
        setActiveView={setActiveView}
        breadcrumbs={[
          { label: "Home", view: "home" },
          { label: "Resource Group" },
          { label: "Professors" },
        ]}
      />

      <h2 className="mt-4 text-3xl font-bold text-white">Professors</h2>
      <span className="mx-6 block font-thin text-[#888888]">
        Manage professor accounts within your institution. Create, edit, or remove users and assign
        roles to ensure access aligns with your processes.
      </span>

      {/* Toolbar: New + Export (mirrors Rooms layout) */}
      <div className="flex w-full flex-col items-stretch justify-center gap-3 border-b-2 border-b-gray-600 px-4 pb-2 shadow-xl sm:flex-row sm:justify-between sm:gap-5">
        {/* New Professor */}
        <button
          onClick={openCreateDialog}
          className="w-full rounded-lg bg-[#1c402a] px-5 py-2 whitespace-nowrap text-white shadow-xl transition-transform hover:scale-105 sm:w-auto"
        >
          New Professor
        </button>

        {/* Create Professor Modal */}
        <dialog id="create_prof_modal" className="modal">
          <div className="modal-box w-11/12 max-w-3xl">
            <h3 className="mb-4 text-center text-2xl font-bold">Create New Professor</h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createProfessor();
              }}
              className="flex flex-col gap-6"
            >
              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <label className="text-left text-lg font-bold md:w-1/6">Email:</label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  placeholder="name@example.com"
                  className="input input-bordered w-full"
                  required
                />
              </div>

              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <label className="text-left text-lg font-bold md:w-1/6">First name:</label>
                <input
                  value={createForm.first_name}
                  onChange={(e) => setCreateForm({ ...createForm, first_name: e.target.value })}
                  placeholder="First name"
                  className="input input-bordered w-full"
                  required
                />
              </div>

              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <label className="text-left text-lg font-bold md:w-1/6">Last name:</label>
                <input
                  value={createForm.last_name}
                  onChange={(e) => setCreateForm({ ...createForm, last_name: e.target.value })}
                  placeholder="Last name"
                  className="input input-bordered w-full"
                  required
                />
              </div>

              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <label className="text-left text-lg font-bold md:w-1/6">Password:</label>
                <input
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  placeholder="••••••••"
                  className="input input-bordered w-full"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-left text-lg font-bold">Roles:</label>
                <div className="flex flex-wrap gap-3">
                  {["professor", "Program Head", "Dean", "HR"].map((r) => (
                    <label key={r} className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={createForm.roles.includes(r)}
                        onChange={(e) => {
                          const next = e.target.checked
                            ? [...createForm.roles, r]
                            : createForm.roles.filter((x) => x !== r);
                          setCreateForm({ ...createForm, roles: next });
                        }}
                      />
                      <span className="capitalize">{r}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  Note: If you are HR, new users will automatically receive the professor role.
                </p>
              </div>

              <div className="modal-action">
                <button type="submit" className="btn btn-success text-white">
                  Submit
                </button>
                <button
                  type="button"
                  className="btn btn-cancel"
                  onClick={() =>
                    (document.getElementById("create_prof_modal") as HTMLDialogElement)?.close()
                  }
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </dialog>

        {/* Edit Professor Modal */}
        <dialog id="edit_prof_modal" className="modal">
          <div className="modal-box w-11/12 max-w-3xl">
            <h3 className="mb-4 text-center text-2xl font-bold">Edit Professor</h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateProfessor();
              }}
              className="flex flex-col gap-6"
            >
              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <label className="text-left text-lg font-bold md:w-1/6">First name:</label>
                <input
                  value={editForm.first_name}
                  onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                  placeholder="First name"
                  className="input input-bordered w-full"
                  required
                />
              </div>

              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <label className="text-left text-lg font-bold md:w-1/6">Last name:</label>
                <input
                  value={editForm.last_name}
                  onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                  placeholder="Last name"
                  className="input input-bordered w-full"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-left text-lg font-bold">Roles:</label>
                <div className="flex flex-wrap gap-3">
                  {["professor", "Program Head", "Dean", "HR"].map((r) => (
                    <label key={r} className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editForm.roles.includes(r)}
                        onChange={(e) => {
                          const next = e.target.checked
                            ? [...editForm.roles, r]
                            : editForm.roles.filter((x) => x !== r);
                          setEditForm({ ...editForm, roles: next });
                        }}
                      />
                      <span className="capitalize">{r}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="modal-action">
                <button type="submit" className="btn btn-success text-white">
                  Update
                </button>
                <button
                  type="button"
                  className="btn btn-cancel"
                  onClick={() => {
                    resetEditForm();
                    setCurrentEditing(null);
                    (document.getElementById("edit_prof_modal") as HTMLDialogElement)?.close();
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </dialog>

        {/* Export (placeholder to mirror Rooms UX) */}
        <div className="flex flex-row justify-center">
          <button
            onClick={() =>
              (document.getElementById("export_prof_modal") as HTMLDialogElement)?.showModal()
            }
            className="w-full rounded-lg bg-[#1b2e3e] px-5 py-2 whitespace-nowrap text-white shadow-xl transition-transform hover:scale-105 sm:w-auto"
          >
            Export Professors
          </button>

          <dialog id="export_prof_modal" className="modal">
            <div className="modal-box w-11/12 max-w-3xl">
              <h3 className="mb-4 text-center text-2xl font-bold">Export Professors</h3>
              <form method="dialog" className="flex flex-col gap-6">
                <div className="flex flex-col gap-2 md:flex-row md:items-center">
                  <label className="text-left text-lg font-bold md:w-1/6">Format:</label>
                  <select className="select select-bordered w-full">
                    <option>CSV</option>
                    <option>JSON</option>
                  </select>
                </div>
                <div className="modal-action">
                  <button type="submit" className="btn btn-success text-white">
                    Export
                  </button>
                  <button
                    type="button"
                    className="btn btn-cancel"
                    onClick={() =>
                      (document.getElementById("export_prof_modal") as HTMLDialogElement)?.close()
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

      {/* Search (mirrors Rooms) */}
      <div className="flex w-full items-start justify-center border-b-2 border-b-gray-600 px-4 pb-2 shadow-xl">
        <label htmlFor="search" className="text-lg font-bold text-white"></label>
        <input
          id="search"
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name or email"
          className="input input-bordered w-full max-w-md"
        />
      </div>

      {/* DataTable */}
      <DataTable
        data={rows}
        columns={columns}
        getRowKey={(r) => r.id}
        actions={(r) => actions(r)}
        loading={loading}
      />

      {/* Delete Modal */}
      <dialog id="delete_prof_modal" className="modal">
        <div className="modal-box w-11/12 max-w-md">
          <h3 className="mb-4 text-center text-2xl font-bold">Delete Professor</h3>
          <p className="mb-6 text-center">
            Are you sure you want to delete "{currentEditing?.full_name}"? This action cannot be
            undone.
          </p>
          <div className="modal-action">
            <button
              onClick={() => currentEditing && deleteProfessor(currentEditing.id)}
              className="btn btn-error text-white"
            >
              Delete
            </button>
            <button
              type="button"
              className="btn btn-cancel"
              onClick={() => {
                setCurrentEditing(null);
                (document.getElementById("delete_prof_modal") as HTMLDialogElement)?.close();
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}

export default Professors;
