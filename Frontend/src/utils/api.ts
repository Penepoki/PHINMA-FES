import axios from "axios";

// Extend the axios request config to include skipAuth
declare module "axios" {
  export interface AxiosRequestConfig {
    skipAuth?: boolean;
  }
}

// A tiny login synchronization helper to avoid 401 right after setting token
let tokenReadyAt = 0;

export function markTokenReady() {
    tokenReadyAt = Date.now();
}

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use(
    async (config) => {
    // If skipAuth is set, do not add the Authorization header
    if (config.skipAuth) {
      return config;
    }
    const token = localStorage.getItem("token");
    if (token) {
        // If token was just written, yield once to ensure visibility to other async tasks
        if (Date.now() - tokenReadyAt < 500) {
            await new Promise((r) => setTimeout(r, 0));
        }
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
    (error) => Promise.reject(error),
);

export async function generateAIFeedback(evaluationId: number, force = false) {
    const url = `/evaluation/evaluations/${evaluationId}/generate_feedback/${force ? "?force=true" : ""}`;
  const response = await api.post(url);
  return response.data;
}

export default api;
