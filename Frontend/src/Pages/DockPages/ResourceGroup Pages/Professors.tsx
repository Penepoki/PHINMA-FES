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
                const res = await api.get("/program-professor/program-professors/");
                const mapped: ProfessorRow[] = (res.data || []).map((pp: any) => ({
                    id: Number(pp.professor),
                    full_name: pp.professor_details?.full_name || `Professor #${pp.professor}`,
                    email: pp.professor_details?.email,
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

    return (
        <div className="custom-container gap-y-6">
            <BreadAndLogout
                setActiveView={setActiveView}
                breadcrumbs={[{label: "Home", view: "home"}, {label: "Resource Group"}, {label: "Professors"}]}
            />

            <h2 className="mt-4 text-3xl font-bold text-white">Professors</h2>
            <span className="font-thin text-[#888888] block mx-6">
        View all professors for the currently selected faculty context. Only HR can access this page.
      </span>

            <DataTable
                data={rows}
                columns={columns}
                getRowKey={(r) => r.id}
                selectable
                loading={loading}
            />
        </div>
    );
}

export default Professors;
