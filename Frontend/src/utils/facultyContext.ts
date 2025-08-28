import api from "../utils/api";

export async function resolveFacultyId(): Promise<string | null> {
    // Prefer explicit localStorage first
    const local =
        localStorage.getItem("facultyId") ||
        localStorage.getItem("faculty_id");
    if (local) return String(local).split(":")[0];

    // Fallback to server-held temp context (HR “borrowed” faculty)
    try {
        const r = await api.get("/get-faculty-context/");
        const id = r.data?.faculty_id;
        if (id != null) {
            localStorage.setItem("facultyId", String(id));
            localStorage.setItem("faculty_id", String(id));
            return String(id);
        }
    } catch {
    }
    return null;
}