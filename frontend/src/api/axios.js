import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8001",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const detail =
      error?.response?.data?.detail ||
      error?.response?.data?.message;

    const message =
      typeof detail === "string"
        ? detail
        : Array.isArray(detail)
        ? detail.map((item) => item.msg).join(", ")
        : error?.message || "Request failed";

    return Promise.reject(new Error(message));
  }
);

export default api;