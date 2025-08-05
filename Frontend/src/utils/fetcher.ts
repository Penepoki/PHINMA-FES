// fetchers/evaluationFetcher.ts
import api from "../utils/api";

export async function evaluationFetcher() {
  const response = await api.get("/evaluation/evaluations/");
  return response.data;
}
export async function schedulesFetcher() {
  const response = await api.get("/schedule/schedules/");
  return response.data;
}
export async function programFetcher() {
  const response = await api.get("/program/programs/");
  return response.data
}
export async function programProfessorFetcher() {
  const response = await api.get("/program-professor/program-professors/");
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
