import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8090";
const API_VERSION = import.meta.env.VITE_API_VERSION || "/api/v1";

export const api = axios.create({
  baseURL: `${BASE_URL}${API_VERSION}`,
  withCredentials: true,
});

const authHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export const updateEmailNotify = async (enabled) => {
  const value = enabled ? "on" : "off"; // ✅ convert boolean to enum string

  const res = await api.patch(
    "/authUser/emailNotify",
    { emailNotify: value },
    authHeader(),
  );

  return res.data;
};

export const getUserDetails = async () => {
  const res = await api.get("/authUser/getUserDetails", authHeader());

  return res.data;
};
