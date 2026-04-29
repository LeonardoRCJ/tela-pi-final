import axios from "axios";

const api = axios.create({
  baseURL: "http://192.168.15.9:8083/api",
});

export default api;
