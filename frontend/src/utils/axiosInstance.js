import axios from "axios";

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
    headers: { "Content-Type": "application/json" },
});

API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export const apiRequest = {
  get: (url, params = {}) => API.get(url, { params }),
  post: (url, data) => API.post(url, data),
  put: (url, data) => API.put(url, data),
  delete: (url) => API.delete(url),
};

export default API;
