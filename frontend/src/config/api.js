const rawUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
const base = rawUrl.replace(/\/+$/, "");
export const API_URL = `${base}/api`;
