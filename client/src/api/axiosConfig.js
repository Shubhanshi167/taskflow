import axios from 'axios';

const API = axios.create({
  baseURL: 'https://taskflow-production-434c.up.railway.app/api',
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;