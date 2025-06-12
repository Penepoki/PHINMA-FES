import axios from "axios";

const api = axios.create({
	baseURL: "http://localhost:8000/api", // Replace with your backend base URL
	headers: {
		"Content-Type": "application/json",
	},
});
api.interceptors.request.use(
  (config) => {
    // If skipAuth is set, do not add the Authorization header
    if (config.skipAuth) {
      return config;
    }
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
export async function generateAIFeedback(evaluationId: number, force = false) {
  const url = `/evaluation/evaluations/${evaluationId}/generate_feedback/${force ? '?force=true' : ''}`;
  const response = await api.post(url);
  return response.data;
}

export default api;
