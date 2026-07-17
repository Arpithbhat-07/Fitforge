import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API_BASE = `${BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

// Attach bearer token from localStorage if present (fallback for cross-site cookie issues)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ff_access_token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to unpack standard response envelope
api.interceptors.response.use(
  (response) => {
    const resData = response.data;
    if (resData && typeof resData === "object" && "success" in resData && "data" in resData) {
      const unpacked = resData.data;
      if (unpacked && typeof unpacked === "object" && !Array.isArray(unpacked)) {
        if (!("success" in unpacked)) {
          unpacked.success = resData.success;
        }
        if (!("message" in unpacked)) {
          unpacked.message = resData.message;
        }
        if (!("request_id" in unpacked)) {
          unpacked.request_id = resData.request_id;
        }
      }
      response.data = unpacked;
    }
    return response;
  },
  (error) => {
    if (error.response && error.response.data && typeof error.response.data === "object") {
      const data = error.response.data;
      if (data.success === false && data.message) {
        // Map message to detail for backward compatibility with formatApiError callers
        data.detail = data.message;
      }
    }
    return Promise.reject(error);
  }
);

export function formatApiError(detail) {
  if (detail == null) return "Something went wrong. Please try again.";
  if (typeof detail === "string") return detail;
  
  if (detail && typeof detail === "object") {
    if (detail.message && typeof detail.message === "string") return detail.message;
    if (detail.detail) {
      const subDetail = detail.detail;
      if (typeof subDetail === "string") return subDetail;
      if (Array.isArray(subDetail)) {
        return subDetail
          .map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e)))
          .filter(Boolean)
          .join(" ");
      }
    }
    if (typeof detail.msg === "string") return detail.msg;
  }
  try { return JSON.stringify(detail); } catch { return String(detail); }
}

export function getMediaUrl(url) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${process.env.REACT_APP_BACKEND_URL}${url}`;
}


