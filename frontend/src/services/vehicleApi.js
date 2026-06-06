import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8090";
const API_VERSION = import.meta.env.VITE_API_VERSION || "/api/v1";

export const api = axios.create({
  baseURL: `${BASE_URL}${API_VERSION}`,
  withCredentials: true,
});

// GET single vehicle details
export const getVehicleById = async (id) => {
  // your backend route: /vehicle/get/:id
  const res = await api.get(`/vehicle/get/${id}`);
  return res.data; // { success, vehicle }
};
