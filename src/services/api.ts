import axios from "axios";

import { invalidateSession } from "./authSession";

const api = axios.create({
  baseURL: "http://10.135.141.15:8083/api/v1",
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
