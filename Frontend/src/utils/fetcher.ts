// fetchers/evaluationFetcher.ts
import api from "../utils/api";

export async function evaluationFetcher() {
    // Resolve faculty context when available to avoid empty arrays for HR
    let params: any = {};
    try {
        const {resolveFacultyId} = await import("./facultyContext");
        const fid = await resolveFacultyId();
        if (fid) params.faculty = fid;
    } catch {
    }
    const response = await api.get("/evaluation/evaluations/", {params});
  return response.data;
}
export async function schedulesFetcher() {
    let params: any = {};
    try {
        const {resolveFacultyId} = await import("./facultyContext");
        const fid = await resolveFacultyId();
        if (fid) params.faculty = fid;
    } catch {
    }
    const response = await api.get("/schedule/schedules/", {params});
  return response.data;
}
export async function programFetcher() {
    let params: any = {};
    try {
        const {resolveFacultyId} = await import("./facultyContext");
        const fid = await resolveFacultyId();
        if (fid) params.faculty = fid;
    } catch {
    }
    const response = await api.get("/program/programs/", {params});
    return response.data;
}
export async function programProfessorFetcher() {
    let params: any = {};
    try {
        const {resolveFacultyId} = await import("./facultyContext");
        const fid = await resolveFacultyId();
        if (fid) params.faculty = fid;
    } catch {
    }
    const response = await api.get("/program-professor/program-professors/", {params});
  return response.data;
}

// export async function fectchSetAll(p1, p2, p3, p4) {
//  p1(responses.data)
//
//
//fetchAll(setEvaluation)
//
//
//setEvaluation(Fetcher.evaluationFetcher());
