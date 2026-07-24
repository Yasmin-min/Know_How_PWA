import axios from "axios";
import rotas from "./rotas";

const URL_API = import.meta.env.VITE_URL_API;
if (!URL_API) throw new Error("VITE_URL_API não definida.");

const TOKEN_KEY = "knowhow:token";

const Api = axios.create({
  baseURL: URL_API,
});

Api.defaults.headers.common["Content-Type"] = "application/json";

Api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

Api.interceptors.response.use(
  (response) => response,
  (error) => {
    const tinhaToken = Boolean(error.config?.headers?.Authorization);
    if (error.response?.status === 401 && tinhaToken) {
      localStorage.removeItem(TOKEN_KEY);
      window.location.href = rotas.login;
    }
    return Promise.reject(error);
  },
);

export default Api;
