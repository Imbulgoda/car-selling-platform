// src/services/vehicleService.js

import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8090";
const API_VERSION = import.meta.env.VITE_API_VERSION || "/api/v1";

/** Base URL for vehicle photo URLs (e.g. http://localhost:8090). Use to build full image URL from path like /uploads/vehicleId/file.jpg */
export const getImageBaseUrl = () => BASE_URL;

export const api = axios.create({
  baseURL: `${BASE_URL}${API_VERSION}`,
  withCredentials: true,
});

// Add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors - do NOT redirect here so the page can render and handle 401 (e.g. show message then redirect)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Let the calling component handle redirect (e.g. VehicleManagement shows toast then redirects)
    }
    return Promise.reject(error);
  }
);

// Constants
export const VEHICLE_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

/**
 * GET single vehicle details
 * Backend: GET /api/v1/vehicle/get/:id
 */
export const getVehicleById = async (id) => {
  const res = await api.get(`/vehicle/get/${id}`);
  return res.data; // { success, vehicle }
};

/**
 * GET all vehicles (ADMIN)
 * Backend: GET /api/v1/vehicle/admin/get-all
 */
export const getAllVehicles = async () => {
  const res = await api.get("/vehicle/admin/get-all");
  return res.data; // { success, vehicles[] }
};

/**
 * UPDATE vehicle status (Approve/Reject) - ADMIN
 * Backend: PATCH /api/v1/vehicle/admin/status/:id
 */
export const updateVehicleStatus = async (id, status) => {
  // Backend expects status with capitalized enum values: "Pending", "Approved", "Rejected"
  let apiStatus = status;
  if (typeof status === "string") {
    const lower = status.toLowerCase();
    if (lower === VEHICLE_STATUS.PENDING) apiStatus = "Pending";
    else if (lower === VEHICLE_STATUS.APPROVED) apiStatus = "Approved";
    else if (lower === VEHICLE_STATUS.REJECTED) apiStatus = "Rejected";
  }

  const res = await api.patch(`/vehicle/admin/status/${id}`, { status: apiStatus });
  return res.data; // { success, message, vehicle }
};

/**
 * DELETE vehicle listing (owner only on backend)
 * Backend: DELETE /api/v1/vehicle/delete/:id
 */
export const deleteVehicle = async (id) => {
  const res = await api.delete(`/vehicle/delete/${id}`);
  return res.data;
};

// Export as vehicleAPI object for compatibility
export const vehicleAPI = {
  getAllVehicles,
  getVehicleById,
  updateVehicleStatus,
  deleteVehicle,
};
