import axios from "axios";

import { invalidateSession } from "./authSession";

const api = axios.create({
  baseURL: "http://192.168.15.6:8083/api/v1",
});

let _authToken: string | null = null;

export function setAuthToken(token: string | null) {
  _authToken = token;
}

api.interceptors.request.use((config) => {
  if (_authToken) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${_authToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const authHeader =
      error?.config?.headers?.Authorization ??
      error?.config?.headers?.authorization;
    if (status === 401 && authHeader) {
      invalidateSession();
    }
    return Promise.reject(error);
  },
);

export default api;
