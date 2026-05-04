import axios from "axios";

import { invalidateSession } from "./authSession";

const api = axios.create({
  baseURL: "http://192.168.15.14:8083/api",
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
