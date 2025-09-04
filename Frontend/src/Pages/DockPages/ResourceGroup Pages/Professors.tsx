import React, {useEffect, useMemo, useState} from "react";
import api from "../../../utils/api";
import BreadAndLogout from "../../../Components/Bread and Logout.tsx";
import DataTable, {Column} from "../../../Components/Evaluation Components/Data Table";
import {resolveFacultyId} from "../../../utils/facultyContext";

interface ProfessorsProps {
    setActiveView: (view: string) => void;
}

interface ProfessorRow {
    id: number;
    full_name: string;
    email?: string;
}

function Professors({setActiveView}: ProfessorsProps) {
    const [showDialog, setShowDialog] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState({
        email: "",
        first_name: "",
        last_name: "",
        password: "",
        roles: [] as string[],
    });
    const [rows, setRows] = useState<ProfessorRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [effectiveFacultyId, setEffectiveFacultyId] = useState<number | null>(null);

    const isHR = useMemo(() => localStorage.getItem("isTempFaculty") === "true", []);

    useEffect(() => {
        (async () => {
            const fid = await resolveFacultyId();
            setEffectiveFacultyId(fid ?? null);
        })();
    }, []);

    useEffect(() => {
        const fetchProfessors = async () => {
            setLoading(true);
            try {
                // Scoped by backend to current (or temp) faculty; no program_id yields all in faculty
                const res = await api.get("/users/professors/");
                const mapped: ProfessorRow[] = (res.data || []).map((u: any) => ({
                    id: Number(u.id),
                    full_name: u.full_name || u.name || `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim() || `Professor #${u.id}`,
                    email: u.email,
                }));
                // De-duplicate by professor id
                const uniq = new Map<number, ProfessorRow>();
                for (const r of mapped) uniq.set(r.id, r);
                setRows(Array.from(uniq.values()));
            } catch (e) {
                setRows([]);
            } finally {
                setLoading(false);
            }
        };

        if (isHR) fetchProfessors();
    }, [isHR, effectiveFacultyId]);

    const columns: Column<ProfessorRow>[] = [
        {header: "Name", accessor: (r) => r.full_name},
        {header: "Email", accessor: (r) => r.email || "—"},
    ];

    if (!isHR) {
        return (
            <div className="custom-container">
                <BreadAndLogout
                    setActiveView={setActiveView}
                    breadcrumbs={[{label: "Home", view: "home"}, {label: "Resource Group"}, {label: "Professors"}]}
                />
                <div className="mt-6 text-white">This page is restricted to HR users.</div>
            </div>
        );
    }

    const resetForm = () => setForm({email: "", first_name: "", last_name: "", password: "", roles: []});

    const openCreate = () => {
        setEditingId(null);
        resetForm();
        setShowDialog(true);
    };
    const openEdit = async (row: ProfessorRow) => {
        setEditingId(row.id);
        try {
            const res = await api.get(`/admin/users/${row.id}/`);
            const data = res.data;
            setForm({
                email: data.email || "",
                first_name: data.first_name || "",
                last_name: data.last_name || "",
                password: "",
                roles: (data.roles_read || []) as string[],
            });
            setShowDialog(true);
        } catch (e) {
            console.error(e);
        }
    };

    const submit = async () => {
        try {
            if (editingId) {
                await api.put(`/admin/users/${editingId}/`, {
                    first_name: form.first_name,
                    last_name: form.last_name,
                    roles: form.roles,
                });
            } else {
                await api.post(`/admin/users/`, {
                    email: form.email,
                    first_name: form.first_name,
                    last_name: form.last_name,
                    password: form.password || undefined,
                    roles: form.roles,
                });
            }
            setShowDialog(false);
            // refresh list
            const res = await api.get("/users/professors/");
            const mapped: ProfessorRow[] = (res.data || []).map((u: any) => ({
                id: Number(u.id),
                full_name: u.full_name || u.name || `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim() || `Professor #${u.id}`,
                email: u.email,
            }));
            const uniq = new Map<number, ProfessorRow>();
            for (const r of mapped) uniq.set(r.id, r);
            setRows(Array.from(uniq.values()));
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="custom-container gap-y-6">
            <BreadAndLogout
                setActiveView={setActiveView}
                breadcrumbs={[{label: "Home", view: "home"}, {label: "Resource Group"}, {label: "Professors"}]}
            />

            <div className="flex items-center justify-between pr-6">
                <div>
                    <h2 className="mt-4 text-3xl font-bold text-white">Professors</h2>
                    <span className="font-thin text-[#888888] block mx-6">
                        View all professors for the currently selected faculty context. Only HR can access this page.
                    </span>
                </div>
                <button className="btn btn-success mt-4" onClick={openCreate}>Create User</button>
            </div>

            {/* Dialog */}
            {showDialog && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
                    <div className="bg-[#0f1b13] p-6 rounded-xl w-full max-w-md text-white shadow-xl">
                        <h3 className="text-xl font-semibold mb-4">{editingId ? 'Edit User' : 'Create User'}</h3>
                        <div className="space-y-3">
                            {!editingId && (
                                <div>
                                    <label className="block text-sm mb-1">Email</label>
                                    <input className="input input-bordered w-full" type="email" value={form.email}
                                           onChange={(e) => setForm({...form, email: e.target.value})}/>
                                </div>
                            )}
                            <div>
                                <label className="block text-sm mb-1">First name</label>
                                <input className="input input-bordered w-full" value={form.first_name}
                                       onChange={(e) => setForm({...form, first_name: e.target.value})}/>
                            </div>
                            <div>
                                <label className="block text-sm mb-1">Last name</label>
                                <input className="input input-bordered w-full" value={form.last_name}
                                       onChange={(e) => setForm({...form, last_name: e.target.value})}/>
                            </div>
                            {!editingId && (
                                <div>
                                    <label className="block text-sm mb-1">Password</label>
                                    <input className="input input-bordered w-full" type="password" value={form.password}
                                           onChange={(e) => setForm({...form, password: e.target.value})}/>
                                </div>
                            )}
                            <div>
                                <label className="block text-sm mb-1">Roles</label>
                                <div className="flex gap-3 flex-wrap">
                                    {['professor', 'Program Head', 'Dean', 'HR'].map(r => (
                                        <label key={r} className="inline-flex items-center gap-2">
                                            <input type="checkbox" checked={form.roles.includes(r)} onChange={(e) => {
                                                const next = e.target.checked ? [...form.roles, r] : form.roles.filter(x => x !== r);
                                                setForm({...form, roles: next});
                                            }}/>
                                            <span className="capitalize">{r}</span>
                                        </label>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-400 mt-1">Note: If you are HR, new users will
                                    automatically receive the professor role.</p>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button className="btn" onClick={() => {
                                setShowDialog(false)
                            }}>Cancel
                            </button>
                            <button className="btn btn-primary"
                                    onClick={submit}>{editingId ? 'Save' : 'Create'}</button>
                        </div>
                    </div>
                </div>
            )}

            <DataTable
                data={rows}
                columns={columns}
                getRowKey={(r) => r.id}
                actions={(r) => (
                    <button className="btn btn-xs" onClick={() => openEdit(r)}>Edit</button>
                )}
                selectable
                loading={loading}
            />
        </div>
    );
}

export default Professors;
