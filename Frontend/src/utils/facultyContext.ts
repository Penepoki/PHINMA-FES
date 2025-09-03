import api from "../utils/api";

// utils/facultyContext.ts
export async function resolveFacultyId(): Promise<number | null> {
  const local =
      localStorage.getItem("facultyId") ||
      localStorage.getItem("faculty_id");
  if (local) {
    const left = String(local).split(":")[0];
    const n = Number(left);
    return Number.isNaN(n) ? null : n;
  }
  try {
    const r = await api.get("/get-faculty-context/");
    const n = Number(r.data?.faculty_id);
    return Number.isNaN(n) ? null : n;
  } catch {
    return null;
  }
}